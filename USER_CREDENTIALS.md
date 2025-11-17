# User Credentials Management

## Adding Your Own Login Credentials

The ElevareAI platform includes a simple script to add your personalized login credentials to the system.

### Quick Start

1. **Run the user creation script:**
   ```bash
   ./add-user.sh
   ```

2. **Follow the prompts:**
   - Enter your email address
   - Enter your first and last name
   - Create a secure password (minimum 8 characters)
   - Select your role (admin, manager, analyst, or viewer)
   - Optionally enter your department

3. **Log in to the platform:**
   - Navigate to http://localhost:5173/login
   - Use your newly created credentials

### User Roles

| Role | Access Level | Permissions |
|------|--------------|-------------|
| **Admin** | Full system access | All permissions, user management, system configuration |
| **Manager** | Department management | View/edit departmental data, manage team members |
| **Analyst** | Data analysis | View and analyze all metrics, create custom reports |
| **Viewer** | Read-only access | View dashboards and reports only |

### Default Credentials

For demo/testing purposes, the following account is pre-configured:

- **Email:** admin@elevareai.com
- **Password:** Admin123!
- **Role:** Admin

> ⚠️ **Important:** Change the default admin password in production environments!

### Manual User Creation (Alternative Method)

If you prefer to add users programmatically:

```bash
cd backend
npm install
npx tsc
node dist/scripts/addUser.js
```

### Password Requirements

- Minimum 8 characters
- Recommended: Include uppercase, lowercase, numbers, and special characters
- Avoid common passwords

### Troubleshooting

**"User with this email already exists"**
- Each email can only be used once
- Use a different email or delete the existing user first

**"Invalid email format"**
- Ensure your email follows the format: name@domain.com

**"Database not found"**
- Make sure you've initialized the database by running the backend at least once
- Run: `cd backend && npm run dev`

### Security Notes

- Passwords are securely hashed using bcrypt (10 salt rounds)
- JWT tokens are used for authentication (8-hour access tokens)
- Sessions are tracked and can be revoked
- Failed login attempts are monitored (5 attempts = account lock)
- All user actions are logged in the audit table

### Adding Users via API

You can also create users programmatically via the REST API:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "analyst",
    "department": "Operations"
  }'
```

> Note: User registration requires admin authentication.

### Need Help?

For additional assistance with user management:
- See `AUTHENTICATION_API.md` for full API documentation
- Check `backend/src/scripts/addUser.ts` for the source code
- Review audit logs in the database for user activity

---

**Last Updated:** November 17, 2025
**Platform Version:** 1.0.0
