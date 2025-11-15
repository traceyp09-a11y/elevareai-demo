# ElevareAI Authentication API Documentation

## 🔐 Enterprise Security Layer

The ElevareAI platform now includes a comprehensive enterprise-grade authentication and authorization system.

## Quick Start

### Default Admin Credentials
```
Email: admin@elevareai.com
Password: Admin123!
```

**⚠️ IMPORTANT: Change this password immediately in production!**

## Authentication Endpoints

### Base URL
```
http://localhost:3001/api/auth
```

### 1. User Registration

**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@company.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "analyst",
  "department": "Operations",
  "facilityId": 1
}
```

**Roles:**
- `admin` - Full system access
- `manager` - Department management and reporting
- `analyst` - View and analyze data
- `viewer` - Read-only access

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "email": "user@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "analyst",
    "department": "Operations",
    "facilityId": 1
  }
}
```

### 2. User Login

**POST** `/api/auth/login`

Authenticate and receive access/refresh tokens.

**Request Body:**
```json
{
  "email": "admin@elevareai.com",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 28800,
  "user": {
    "id": 1,
    "email": "admin@elevareai.com",
    "firstName": "System",
    "lastName": "Administrator",
    "role": "admin",
    "department": null,
    "facilityId": null
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": "Invalid credentials",
  "message": "Email or password is incorrect"
}
```

**Account Lockout:**
After 5 failed login attempts, account is locked for 30 minutes:
```json
{
  "success": false,
  "error": "Account locked",
  "message": "Too many failed login attempts. Account locked for 30 minutes."
}
```

### 3. Token Refresh

**POST** `/api/auth/refresh`

Refresh an expired access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 28800,
  "user": {
    "id": 1,
    "email": "admin@elevareai.com",
    "firstName": "System",
    "lastName": "Administrator",
    "role": "admin"
  }
}
```

### 4. Logout

**POST** `/api/auth/logout`

Revoke the current session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 5. Get Current User

**GET** `/api/auth/me`

Retrieve current user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@elevareai.com",
    "first_name": "System",
    "last_name": "Administrator",
    "role": "admin",
    "department": null,
    "facility_id": null,
    "created_at": "2025-11-15T22:30:00.000Z",
    "last_login": "2025-11-15T22:45:00.000Z"
  },
  "permissions": ["*"]
}
```

### 6. Change Password

**POST** `/api/auth/change-password`

Change the current user's password.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "oldPassword": "Admin123!",
  "newPassword": "NewSecurePass456!"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*(),.?":{}|<>)

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 7. Get Active Sessions

**GET** `/api/auth/sessions`

View all active sessions for the current user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "id": 15,
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-11-15T22:45:00.000Z",
      "expires_at": "2025-11-22T22:45:00.000Z",
      "is_revoked": 0
    }
  ],
  "currentSessionId": 15
}
```

### 8. Revoke Session

**DELETE** `/api/auth/sessions/:sessionId`

Revoke a specific session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Session revoked successfully"
}
```

## Admin-Only Endpoints

### 9. List All Users

**GET** `/api/auth/users`

Get all users in the system (admin or manager only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "email": "admin@elevareai.com",
      "first_name": "System",
      "last_name": "Administrator",
      "role": "admin",
      "department": null,
      "facility_id": null,
      "is_active": 1,
      "created_at": "2025-11-15T22:30:00.000Z",
      "last_login": "2025-11-15T22:45:00.000Z"
    }
  ]
}
```

### 10. Create User (Admin)

**POST** `/api/auth/users`

Create a new user (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "email": "manager@company.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "manager",
  "department": "HSE",
  "facilityId": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 3,
    "email": "manager@company.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "manager",
    "department": "HSE",
    "facilityId": 2
  }
}
```

### 11. Update User (Admin)

**PATCH** `/api/auth/users/:userId`

Update user information (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "manager",
  "department": "Operations",
  "facilityId": 1,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully"
}
```

### 12. Delete User (Admin)

**DELETE** `/api/auth/users/:userId`

Soft-delete a user (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Using Authentication with Protected Routes

### Making Authenticated Requests

All API requests (except `/api/auth/*`) should include the JWT token:

```javascript
// JavaScript/TypeScript Example
const response = await fetch('http://localhost:3001/api/kpis/current', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

```bash
# cURL Example
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     http://localhost:3001/api/kpis/current
```

### Error Responses

**401 Unauthorized:**
```json
{
  "error": "Authentication required",
  "message": "No authentication token provided"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions",
  "message": "This action requires one of the following roles: admin, manager",
  "requiredRoles": ["admin", "manager"],
  "userRole": "analyst"
}
```

**429 Too Many Requests:**
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## Security Features Implemented

### ✅ Authentication
- JWT-based stateless authentication
- Refresh token rotation
- Session management and tracking
- Token expiration (8 hours for access, 7 days for refresh)

### ✅ Authorization
- Role-Based Access Control (RBAC)
- 4 predefined roles: admin, manager, analyst, viewer
- Fine-grained permission system
- User-specific permission overrides

### ✅ Security Hardening
- Password hashing with bcrypt (10 salt rounds)
- Password strength requirements
- Account lockout after failed attempts (5 attempts, 30-minute lockout)
- Rate limiting (100 requests/15min general, 5 login attempts/15min)
- Helmet.js security headers
- Input validation with express-validator
- SQL injection protection (parameterized queries)

### ✅ Audit & Compliance
- Complete audit logging for all actions
- Track user login history
- Session tracking (IP, user agent, timestamps)
- User creation/modification logging

## Database Schema

### Core Tables

**users**
- id, email, password_hash, first_name, last_name
- role, department, facility_id
- is_active, is_verified, last_login
- failed_login_attempts, locked_until
- created_at, updated_at, created_by

**user_sessions**
- id, user_id, token_hash, refresh_token_hash
- ip_address, user_agent
- expires_at, created_at, revoked_at

**audit_logs**
- id, user_id, action, resource_type, resource_id
- old_value, new_value
- ip_address, user_agent, status, error_message
- created_at

**roles & permissions**
- roles: id, name, description, permissions
- permissions: id, name, resource, action, description
- role_permissions: many-to-many mapping
- user_permissions: user-specific overrides

## Environment Variables

Create a `.env` file in the backend directory:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=production
```

## Next Steps

### Phase 1 Remaining (High Priority):
1. **Frontend Integration** - Create login page and auth context
2. **SSO/OAuth** - Google, Microsoft, Okta integration
3. **Real-Time Data Integration** - ERP/MES/SCADA connectors
4. **Enhanced Executive Dashboard** - Unified command center

### Phase 2 (Medium Priority):
1. **True AI/ML** - Python ML service integration
2. **Multi-Channel Alerts** - Email, SMS, Slack, Teams
3. **Advanced Drill-Down** - Root cause analysis
4. **ROI Tracking** - Dollar-value calculations

### Phase 3 (Future):
1. **CAPA Workflow** - Action management system
2. **Benchmarking** - Industry comparison
3. **Collaboration** - Comments, @mentions, activity feeds

### Phase 4 (Strategic):
1. **Scenario Planning** - What-if analysis
2. **ESG Metrics** - Sustainability tracking
3. **PostgreSQL Migration** - Enterprise scalability
4. **Custom KPI Builder** - Drag-and-drop interface

## Testing the Authentication

### 1. Register a new user:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@company.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "analyst"
  }'
```

### 2. Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elevareai.com",
    "password": "Admin123!"
  }'
```

### 3. Access protected resource:
```bash
curl -H "Authorization: Bearer <your-token-here>" \
  http://localhost:3001/api/auth/me
```

## Support

For questions or issues:
1. Check the audit logs: Review `audit_logs` table
2. Monitor sessions: Use `/api/auth/sessions` endpoint
3. Review user permissions: Check `/api/auth/me` endpoint

---

**Built with security in mind. Ready for enterprise deployment.**
