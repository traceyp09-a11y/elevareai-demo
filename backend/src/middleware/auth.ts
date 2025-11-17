/**
 * Authentication and Authorization Middleware
 * ElevareAI Enterprise Security Layer
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Database } from 'better-sqlite3';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
        department?: string;
        facilityId?: number;
        permissions: string[];
      };
      sessionId?: number;
    }
  }
}

// JWT secret - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'elevareai-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'elevareai-refresh-secret-key';

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  sessionId: number;
  iat?: number;
  exp?: number;
}

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = (db: Database) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'No authentication token provided'
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      // Check if session is still valid
      const session = db.prepare(`
        SELECT id, user_id, expires_at, revoked_at
        FROM user_sessions
        WHERE id = ? AND token_hash = ?
      `).get(decoded.sessionId, hashToken(token)) as any;

      if (!session) {
        return res.status(401).json({
          error: 'Invalid session',
          message: 'Session not found or token invalid'
        });
      }

      if (session.revoked_at) {
        return res.status(401).json({
          error: 'Session revoked',
          message: 'This session has been revoked'
        });
      }

      if (new Date(session.expires_at) < new Date()) {
        return res.status(401).json({
          error: 'Session expired',
          message: 'Your session has expired. Please login again.'
        });
      }

      // Get user info
      const user = db.prepare(`
        SELECT id, email, role, first_name, last_name, department, facility_id, is_active
        FROM users
        WHERE id = ?
      `).get(decoded.userId) as any;

      if (!user || !user.is_active) {
        return res.status(401).json({
          error: 'User inactive',
          message: 'User account is inactive or deleted'
        });
      }

      // Get user permissions
      const permissions = getUserPermissions(db, user.id, user.role);

      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        department: user.department,
        facilityId: user.facility_id,
        permissions
      };
      req.sessionId = session.id;

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          error: 'Invalid token',
          message: error.message
        });
      }
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          error: 'Token expired',
          message: 'Your session has expired. Please login again.'
        });
      }
      console.error('Authentication error:', error);
      return res.status(500).json({
        error: 'Authentication failed',
        message: 'Internal server error during authentication'
      });
    }
  };
};

/**
 * Check if user has required role
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Check if user has required permission
 */
export const requirePermission = (...requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }

    // Admin has all permissions
    if (req.user.role === 'admin' || req.user.permissions.includes('*')) {
      return next();
    }

    // Check if user has at least one of the required permissions
    const hasPermission = requiredPermissions.some(permission =>
      req.user!.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires one of the following permissions: ${requiredPermissions.join(', ')}`,
        requiredPermissions,
        userPermissions: req.user.permissions
      });
    }

    next();
  };
};

/**
 * Optional authentication - attaches user if token is present, but doesn't require it
 */
export const optionalAuth = (db: Database) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue without user
    }

    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      const user = db.prepare(`
        SELECT id, email, role, department, facility_id
        FROM users
        WHERE id = ? AND is_active = 1
      `).get(decoded.userId) as any;

      if (user) {
        const permissions = getUserPermissions(db, user.id, user.role);
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          department: user.department,
          facilityId: user.facility_id,
          permissions
        };
      }
    } catch (error) {
      // Token invalid or expired, continue without user
    }

    next();
  };
};

/**
 * Get user's effective permissions (role + user-specific overrides)
 */
function getUserPermissions(db: Database, userId: number, role: string): string[] {
  // Get role permissions
  const rolePerms = db.prepare(`
    SELECT p.name
    FROM permissions p
    JOIN role_permissions rp ON p.id = rp.permission_id
    JOIN roles r ON rp.role_id = r.id
    WHERE r.name = ?
  `).all(role) as Array<{ name: string }>;

  // Get user-specific permission overrides
  const userPerms = db.prepare(`
    SELECT p.name, up.granted
    FROM permissions p
    JOIN user_permissions up ON p.id = up.permission_id
    WHERE up.user_id = ?
  `).all(userId) as Array<{ name: string; granted: number }>;

  // Start with role permissions
  const permissions = new Set(rolePerms.map(p => p.name));

  // Apply user-specific overrides
  userPerms.forEach(p => {
    if (p.granted) {
      permissions.add(p.name);
    } else {
      permissions.delete(p.name);
    }
  });

  return Array.from(permissions);
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload as object, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  } as jwt.SignOptions);
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload as object, JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  } as jwt.SignOptions);
}

/**
 * Hash token for storage (simple SHA-256)
 */
export function hashToken(token: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Audit log middleware - logs all authenticated requests
 */
export const auditLog = (db: Database) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Capture original send function
    const originalSend = res.send;
    let responseBody: any;

    res.send = function(body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    // Log after response is sent
    res.on('finish', () => {
      if (req.user) {
        try {
          const action = req.method.toLowerCase();
          const resourceType = req.path.split('/')[2]; // e.g., /api/kpis/... -> kpis
          const resourceId = req.params.id || null;

          db.prepare(`
            INSERT INTO audit_logs
            (user_id, action, resource_type, resource_id, ip_address, user_agent, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(
            req.user.id,
            action,
            resourceType,
            resourceId,
            req.ip,
            req.get('user-agent'),
            res.statusCode < 400 ? 'success' : 'failure'
          );
        } catch (error) {
          console.error('Audit logging failed:', error);
        }
      }
    });

    next();
  };
};
