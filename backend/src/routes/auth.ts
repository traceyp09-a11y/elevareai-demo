/**
 * Authentication Routes
 * Handles user authentication, registration, and session management
 */

import { Router, Request, Response } from 'express';
import { Database } from 'better-sqlite3';
import { AuthService } from '../services/authService';
import { authenticate, requireRole } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

export function createAuthRoutes(db: Database): Router {
  const router = Router();
  const authService = new AuthService(db);

  /**
   * POST /api/auth/register
   * Register a new user
   */
  router.post('/register',
    [
      body('email').isEmail().withMessage('Valid email is required'),
      body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
      body('firstName').notEmpty().withMessage('First name is required'),
      body('lastName').notEmpty().withMessage('Last name is required'),
      body('role').optional().isIn(['admin', 'manager', 'analyst', 'viewer']).withMessage('Invalid role')
    ],
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await authService.register({
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: req.body.role,
        department: req.body.department,
        facilityId: req.body.facilityId
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  );

  /**
   * POST /api/auth/login
   * Authenticate user and create session
   */
  router.post('/login',
    [
      body('email').isEmail().withMessage('Valid email is required'),
      body('password').notEmpty().withMessage('Password is required')
    ],
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await authService.login({
        email: req.body.email,
        password: req.body.password,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      if (result.success) {
        res.json(result);
      } else {
        res.status(401).json(result);
      }
    }
  );

  /**
   * POST /api/auth/logout
   * Logout user and revoke session
   */
  router.post('/logout', authenticate(db), (req: Request, res: Response) => {
    if (!req.user || !req.sessionId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = authService.logout(req.sessionId, req.user.id);
    res.json(result);
  });

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  router.post('/refresh',
    [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await authService.refreshAccessToken(req.body.refreshToken);

      if (result.success) {
        res.json(result);
      } else {
        res.status(401).json(result);
      }
    }
  );

  /**
   * GET /api/auth/me
   * Get current user info
   */
  router.get('/me', authenticate(db), (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = db.prepare(`
      SELECT id, email, first_name, last_name, role, department, facility_id, created_at, last_login
      FROM users
      WHERE id = ?
    `).get(req.user.id);

    res.json({
      success: true,
      user,
      permissions: req.user.permissions
    });
  });

  /**
   * POST /api/auth/change-password
   * Change user password
   */
  router.post('/change-password',
    authenticate(db),
    [
      body('oldPassword').notEmpty().withMessage('Current password is required'),
      body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    ],
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const result = await authService.changePassword(
        req.user.id,
        req.body.oldPassword,
        req.body.newPassword
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    }
  );

  /**
   * GET /api/auth/sessions
   * Get user's active sessions
   */
  router.get('/sessions', authenticate(db), (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const sessions = db.prepare(`
      SELECT id, ip_address, user_agent, created_at, expires_at,
             CASE WHEN revoked_at IS NOT NULL THEN 1 ELSE 0 END as is_revoked
      FROM user_sessions
      WHERE user_id = ? AND expires_at > datetime('now')
      ORDER BY created_at DESC
    `).all(req.user.id);

    res.json({
      success: true,
      sessions,
      currentSessionId: req.sessionId
    });
  });

  /**
   * DELETE /api/auth/sessions/:sessionId
   * Revoke a specific session
   */
  router.delete('/sessions/:sessionId', authenticate(db), (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const sessionId = parseInt(req.params.sessionId);

    db.prepare(`
      UPDATE user_sessions
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(sessionId, req.user.id);

    res.json({
      success: true,
      message: 'Session revoked successfully'
    });
  });

  /**
   * GET /api/auth/users
   * Get all users (admin only)
   */
  router.get('/users', authenticate(db), requireRole('admin', 'manager'), (req: Request, res: Response) => {
    const users = db.prepare(`
      SELECT id, email, first_name, last_name, role, department, facility_id,
             is_active, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `).all();

    res.json({
      success: true,
      users
    });
  });

  /**
   * POST /api/auth/users
   * Create new user (admin only)
   */
  router.post('/users',
    authenticate(db),
    requireRole('admin'),
    [
      body('email').isEmail().withMessage('Valid email is required'),
      body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
      body('firstName').notEmpty().withMessage('First name is required'),
      body('lastName').notEmpty().withMessage('Last name is required'),
      body('role').isIn(['admin', 'manager', 'analyst', 'viewer']).withMessage('Invalid role')
    ],
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await authService.register({
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: req.body.role,
        department: req.body.department,
        facilityId: req.body.facilityId
      }, req.user?.id);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  );

  /**
   * PATCH /api/auth/users/:userId
   * Update user (admin only)
   */
  router.patch('/users/:userId',
    authenticate(db),
    requireRole('admin'),
    async (req: Request, res: Response) => {
      const userId = parseInt(req.params.userId);
      const { firstName, lastName, role, department, facilityId, isActive } = req.body;

      const updates: string[] = [];
      const values: any[] = [];

      if (firstName !== undefined) { updates.push('first_name = ?'); values.push(firstName); }
      if (lastName !== undefined) { updates.push('last_name = ?'); values.push(lastName); }
      if (role !== undefined) { updates.push('role = ?'); values.push(role); }
      if (department !== undefined) { updates.push('department = ?'); values.push(department); }
      if (facilityId !== undefined) { updates.push('facility_id = ?'); values.push(facilityId); }
      if (isActive !== undefined) { updates.push('is_active = ?'); values.push(isActive ? 1 : 0); }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(userId);

      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

      // Log audit event
      db.prepare(`
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, status)
        VALUES (?, 'update', 'user', ?, 'success')
      `).run(req.user?.id, userId.toString());

      res.json({
        success: true,
        message: 'User updated successfully'
      });
    }
  );

  /**
   * DELETE /api/auth/users/:userId
   * Delete user (admin only)
   */
  router.delete('/users/:userId',
    authenticate(db),
    requireRole('admin'),
    (req: Request, res: Response) => {
      const userId = parseInt(req.params.userId);

      // Don't allow deleting yourself
      if (userId === req.user?.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      // Soft delete - deactivate user
      db.prepare('UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(userId);

      // Revoke all sessions
      db.prepare('UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ?')
        .run(userId);

      // Log audit event
      db.prepare(`
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, status)
        VALUES (?, 'delete', 'user', ?, 'success')
      `).run(req.user?.id, userId.toString());

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    }
  );

  return router;
}
