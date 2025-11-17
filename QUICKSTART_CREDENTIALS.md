# Quick Start: Adding Your Login Credentials

This guide will help you add your personalized login credentials to the ElevareAI platform in just a few minutes.

## Prerequisites

- Backend server must be running
- Database must be initialized (happens automatically when you start the backend)

## Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd backend
npm install  # Only needed first time
npm run dev
```

Wait for the message: `🚀 Server running on port 3001`

The authentication database will be automatically initialized with a default admin account.

## Step 2: Add Your Personal Credentials

Open a **new terminal** (keep the backend running) and navigate to the project root:

```bash
cd /home/user/elevareai-demo
./add-user.sh
```

You'll be prompted for:

1. **Email address** - Your work email (e.g., `your.name@company.com`)
2. **First name** - Your first name
3. **Last name** - Your last name
4. **Password** - Secure password (minimum 8 characters)
5. **Role** - Select from:
   - `1` = Admin (full access)
   - `2` = Manager (department management)
   - `3` = Analyst (data analysis)
   - `4` = Viewer (read-only)
6. **Department** - Optional (e.g., Operations, Finance, HR)

### Example Session:

```
=== ElevareAI User Management ===

Add a new user to the platform

Email address: john.doe@company.com
First name: John
Last name: Doe
Password: SecurePass123!

Available roles:
1. admin    - Full system access
2. manager  - Department management
3. analyst  - View and analyze data
4. viewer   - Read-only access
Select role (1-4): 1
Department (optional, press Enter to skip): Operations

--- Creating user ---

✅ User created successfully!

User Details:
- ID: 2
- Email: john.doe@company.com
- Name: John Doe
- Role: admin
- Department: Operations

You can now log in with these credentials at http://localhost:5173/login
```

## Step 3: Start the Frontend

Open a **third terminal** and run:

```bash
cd frontend
npm install  # Only needed first time
npm run dev
```

Wait for: `Local: http://localhost:5173/`

## Step 4: Log In

1. Open your browser to **http://localhost:5173/login**
2. Enter your email and password
3. Click "Sign in"

You should see the ElevareAI dashboard with your name in the top-right corner!

## Default Credentials (For Demo/Testing)

If you just want to test the platform first:

- **Email:** admin@elevareai.com
- **Password:** Admin123!

## Troubleshooting

### "User with this email already exists"

Each email can only be used once. Either:
- Use a different email, or
- Delete the existing user first

### "Database not found" or "no such table: users"

Make sure the backend server has started at least once. It automatically initializes the database on first run.

```bash
cd backend
npm run dev
```

### Script won't run: "Permission denied"

Make the script executable:

```bash
chmod +x add-user.sh
```

### Need to view all users?

```bash
cd backend
node dist/scripts/listUsers.js
```

## Security Notes

✅ Passwords are hashed with bcrypt (not stored in plain text)
✅ JWT tokens expire after 8 hours
✅ Account locks after 5 failed login attempts
✅ All user actions are logged for audit purposes

## Next Steps

After logging in:
- Explore the different departmental dashboards
- View KPI details and analytics
- Create custom reports
- Manage user accounts (admin only)

## Need More Help?

- Full documentation: `USER_CREDENTIALS.md`
- API documentation: `AUTHENTICATION_API.md`
- Contact your system administrator

---

**Platform Version:** 1.0.0
**Last Updated:** November 17, 2025
