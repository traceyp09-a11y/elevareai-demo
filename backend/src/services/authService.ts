/**
 * Authentication Service
 * Handles user authentication, registration, and session management
 */

import { Database } from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, hashToken } from '../middleware/auth';

const SALT_ROUNDS = 10;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

export interface RegisterUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  department?: string;
  facilityId?: number;
}

export interface LoginInput {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    department?: string;
    facilityId?: number;
  };
  expiresIn?: number;
  error?: string;
  message?: string;
}

export class AuthService {
  constructor(private db: Database) {}

  /**
   * Register a new user
   */
  async register(input: RegisterUserInput, createdBy?: number): Promise<AuthResponse> {
    try {
      // Validate email format
      if (!this.isValidEmail(input.email)) {
        return {
          success: false,
          error: 'Invalid email',
          message: 'Please provide a valid email address'
        };
      }

      // Validate password strength
      const passwordValidation = this.validatePassword(input.password);
      if (!passwordValidation.valid) {
        return {
          success: false,
          error: 'Weak password',
          message: passwordValidation.message
        };
      }

      // Check if user already exists
      const existingUser = this.db.prepare('SELECT id FROM users WHERE email = ?').get(input.email);
      if (existingUser) {
        return {
          success: false,
          error: 'User exists',
          message: 'A user with this email already exists'
        };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

      // Insert user
      const result = this.db.prepare(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, department, facility_id, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        input.email,
        passwordHash,
        input.firstName,
        input.lastName,
        input.role || 'viewer',
        input.department || null,
        input.facilityId || null,
        createdBy || null
      );

      const userId = result.lastInsertRowid as number;

      // Log audit event
      this.db.prepare(`
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, status)
        VALUES (?, 'create', 'user', ?, 'success')
      `).run(createdBy || userId, userId.toString());

      return {
        success: true,
        message: 'User registered successfully',
        user: {
          id: userId,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          role: input.role || 'viewer',
          department: input.department,
          facilityId: input.facilityId
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed',
        message: error instanceof Error ? error.message : 'An error occurred during registration'
      };
    }
  }

  /**
   * Authenticate user and create session
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    try {
      // Get user by email
      const user = this.db.prepare(`
        SELECT id, email, password_hash, first_name, last_name, role, department, facility_id,
               is_active, failed_login_attempts, locked_until
        FROM users
        WHERE email = ?
      `).get(input.email) as any;

      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        };
      }

      // Check if account is locked
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        const lockoutMinutes = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000);
        return {
          success: false,
          error: 'Account locked',
          message: `Account is locked due to multiple failed login attempts. Try again in ${lockoutMinutes} minutes.`
        };
      }

      // Check if account is active
      if (!user.is_active) {
        return {
          success: false,
          error: 'Account inactive',
          message: 'Your account has been deactivated. Contact your administrator.'
        };
      }

      // Verify password
      const passwordValid = await bcrypt.compare(input.password, user.password_hash);

      if (!passwordValid) {
        // Increment failed login attempts
        const failedAttempts = (user.failed_login_attempts || 0) + 1;
        let lockedUntil = null;

        if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
          lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60000).toISOString();
        }

        this.db.prepare(`
          UPDATE users
          SET failed_login_attempts = ?, locked_until = ?
          WHERE id = ?
        `).run(failedAttempts, lockedUntil, user.id);

        // Log failed login
        this.db.prepare(`
          INSERT INTO audit_logs (user_id, action, resource_type, ip_address, user_agent, status, error_message)
          VALUES (?, 'login', 'user', ?, ?, 'failure', 'Invalid password')
        `).run(user.id, input.ipAddress || null, input.userAgent || null);

        if (lockedUntil) {
          return {
            success: false,
            error: 'Account locked',
            message: `Too many failed login attempts. Account locked for ${LOCKOUT_DURATION_MINUTES} minutes.`
          };
        }

        return {
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        };
      }

      // Reset failed login attempts
      this.db.prepare(`
        UPDATE users
        SET failed_login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(user.id);

      // Create session
      const sessionId = this.createSession(user.id, input.ipAddress, input.userAgent);

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId
      });

      // Update session with token hashes
      this.db.prepare(`
        UPDATE user_sessions
        SET token_hash = ?, refresh_token_hash = ?
        WHERE id = ?
      `).run(hashToken(accessToken), hashToken(refreshToken), sessionId);

      // Log successful login
      this.db.prepare(`
        INSERT INTO audit_logs (user_id, action, resource_type, ip_address, user_agent, status)
        VALUES (?, 'login', 'user', ?, ?, 'success')
      `).run(user.id, input.ipAddress || null, input.userAgent || null);

      return {
        success: true,
        accessToken,
        refreshToken,
        expiresIn: 8 * 60 * 60, // 8 hours in seconds
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          department: user.department,
          facilityId: user.facility_id
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed',
        message: 'An error occurred during login'
      };
    }
  }

  /**
   * Logout user and revoke session
   */
  logout(sessionId: number, userId: number): { success: boolean; message: string } {
    try {
      // Revoke session
      this.db.prepare(`
        UPDATE user_sessions
        SET revoked_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `).run(sessionId, userId);

      // Log logout
      this.db.prepare(`
        INSERT INTO audit_logs (user_id, action, resource_type, status)
        VALUES (?, 'logout', 'user', 'success')
      `).run(userId);

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Logout failed'
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const jwt = require('jsonwebtoken');
      const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'elevareai-refresh-secret-key';

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;

      // Check if session is valid
      const session = this.db.prepare(`
        SELECT id, user_id, expires_at, revoked_at
        FROM user_sessions
        WHERE id = ? AND refresh_token_hash = ?
      `).get(decoded.sessionId, hashToken(refreshToken)) as any;

      if (!session || session.revoked_at || new Date(session.expires_at) < new Date()) {
        return {
          success: false,
          error: 'Invalid refresh token',
          message: 'Session expired or invalid'
        };
      }

      // Get user
      const user = this.db.prepare(`
        SELECT id, email, role, first_name, last_name, department, facility_id
        FROM users
        WHERE id = ? AND is_active = 1
      `).get(session.user_id) as any;

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: 'User account not found or inactive'
        };
      }

      // Generate new access token
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId: session.id
      });

      // Update token hash
      this.db.prepare(`
        UPDATE user_sessions
        SET token_hash = ?
        WHERE id = ?
      `).run(hashToken(accessToken), session.id);

      return {
        success: true,
        accessToken,
        expiresIn: 8 * 60 * 60,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          department: user.department,
          facilityId: user.facility_id
        }
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: 'Token refresh failed',
        message: 'Invalid or expired refresh token'
      };
    }
  }

  /**
   * Create a new session
   */
  private createSession(userId: number, ipAddress?: string, userAgent?: string): number {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const result = this.db.prepare(`
      INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, expires_at)
      VALUES (?, '', ?, ?, ?)
    `).run(userId, ipAddress || null, userAgent || null, expiresAt.toISOString());

    return result.lastInsertRowid as number;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  private validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character' };
    }
    return { valid: true };
  }

  /**
   * Change user password
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const user = this.db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId) as any;

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify old password
      const passwordValid = await bcrypt.compare(oldPassword, user.password_hash);
      if (!passwordValid) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Validate new password
      const validation = this.validatePassword(newPassword);
      if (!validation.valid) {
        return { success: false, error: 'Weak password', message: validation.message };
      }

      // Hash and update password
      const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      this.db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(newHash, userId);

      // Revoke all sessions except current
      this.db.prepare('UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ?')
        .run(userId);

      // Log password change
      this.db.prepare(`
        INSERT INTO audit_logs (user_id, action, resource_type, status)
        VALUES (?, 'update', 'password', 'success')
      `).run(userId);

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'Password change failed' };
    }
  }
}
