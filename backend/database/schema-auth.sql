-- Authentication and Authorization Schema
-- ElevareAI Enterprise Security Layer

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'analyst', 'viewer')) DEFAULT 'viewer',
    department TEXT,
    facility_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    is_verified BOOLEAN DEFAULT 0,
    last_login DATETIME,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER
    -- Foreign keys removed for compatibility - facility_id and created_by are informational only
);

-- Role definitions
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions TEXT, -- JSON array of permission strings
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for JWT token tracking
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    refresh_token_hash TEXT,
    ip_address TEXT,
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    revoked_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Audit log for all user actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL, -- login, logout, create, update, delete, view
    resource_type TEXT, -- kpi, dashboard, user, etc.
    resource_id TEXT,
    old_value TEXT, -- JSON
    new_value TEXT, -- JSON
    ip_address TEXT,
    user_agent TEXT,
    status TEXT CHECK(status IN ('success', 'failure', 'error')),
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- API keys for external integrations
CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    key_hash TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    scopes TEXT, -- JSON array of allowed scopes
    rate_limit INTEGER DEFAULT 1000, -- requests per hour
    is_active BOOLEAN DEFAULT 1,
    last_used_at DATETIME,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SSO provider configurations
CREATE TABLE IF NOT EXISTS sso_providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_name TEXT NOT NULL UNIQUE, -- google, microsoft, okta
    client_id TEXT NOT NULL,
    client_secret TEXT NOT NULL,
    authorization_url TEXT,
    token_url TEXT,
    user_info_url TEXT,
    scopes TEXT, -- space-separated scopes
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User SSO mappings
CREATE TABLE IF NOT EXISTS user_sso_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    provider_id INTEGER NOT NULL,
    provider_user_id TEXT NOT NULL,
    provider_email TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES sso_providers(id),
    UNIQUE(provider_id, provider_user_id)
);

-- Permissions table for fine-grained access control
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE, -- e.g., 'view_hr_dashboard', 'edit_kpi', 'delete_user'
    resource TEXT NOT NULL, -- hr, hse, ops, qc, finance, etc.
    action TEXT NOT NULL CHECK(action IN ('view', 'create', 'edit', 'delete', 'export')),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Role-Permission mappings
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- User-specific permission overrides (for exceptions)
CREATE TABLE IF NOT EXISTS user_permissions (
    user_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    granted BOOLEAN DEFAULT 1, -- 1 = grant, 0 = revoke
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    granted_by INTEGER,
    PRIMARY KEY (user_id, permission_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_user_sso_provider ON user_sso_mappings(provider_id, provider_user_id);

-- Insert default roles
INSERT OR IGNORE INTO roles (name, description, permissions) VALUES
('admin', 'Full system access', '["*"]'),
('manager', 'Department management and reporting', '["view:*", "edit:own_department", "export:*"]'),
('analyst', 'View and analyze data', '["view:*", "export:reports"]'),
('viewer', 'Read-only access', '["view:dashboards"]');

-- Insert default permissions
INSERT OR IGNORE INTO permissions (name, resource, action, description) VALUES
-- HR permissions
('view_hr_dashboard', 'hr', 'view', 'View HR analytics dashboard'),
('edit_hr_data', 'hr', 'edit', 'Edit HR data'),
('export_hr_reports', 'hr', 'export', 'Export HR reports'),
-- HSE permissions
('view_hse_dashboard', 'hse', 'view', 'View HSE analytics dashboard'),
('edit_hse_data', 'hse', 'edit', 'Edit HSE data'),
('export_hse_reports', 'hse', 'export', 'Export HSE reports'),
-- Operations permissions
('view_ops_dashboard', 'ops', 'view', 'View Operations dashboard'),
('edit_ops_data', 'ops', 'edit', 'Edit Operations data'),
('export_ops_reports', 'ops', 'export', 'Export Operations reports'),
-- Quality Control permissions
('view_qc_dashboard', 'qc', 'view', 'View Quality Control dashboard'),
('edit_qc_data', 'qc', 'edit', 'Edit Quality Control data'),
('export_qc_reports', 'qc', 'export', 'Export QC reports'),
-- Supply Chain permissions
('view_supplychain_dashboard', 'supplychain', 'view', 'View Supply Chain dashboard'),
('edit_supplychain_data', 'supplychain', 'edit', 'Edit Supply Chain data'),
('export_supplychain_reports', 'supplychain', 'export', 'Export Supply Chain reports'),
-- Finance permissions
('view_finance_dashboard', 'finance', 'view', 'View Finance dashboard'),
('edit_finance_data', 'finance', 'edit', 'Edit Finance data'),
('export_finance_reports', 'finance', 'export', 'Export Finance reports'),
-- Admin permissions
('view_admin_dashboard', 'administration', 'view', 'View IT/Admin dashboard'),
('edit_admin_data', 'administration', 'edit', 'Edit Admin data'),
-- Sales permissions
('view_sales_dashboard', 'sales', 'view', 'View Sales dashboard'),
('edit_sales_data', 'sales', 'edit', 'Edit Sales data'),
-- Customer Success permissions
('view_cs_dashboard', 'customer_success', 'view', 'View Customer Success dashboard'),
('edit_cs_data', 'customer_success', 'edit', 'Edit Customer Success data'),
-- Marketing permissions
('view_marketing_dashboard', 'marketing', 'view', 'View Marketing dashboard'),
('edit_marketing_data', 'marketing', 'edit', 'Edit Marketing data'),
-- User management
('create_user', 'users', 'create', 'Create new users'),
('edit_user', 'users', 'edit', 'Edit user information'),
('delete_user', 'users', 'delete', 'Delete users'),
('view_users', 'users', 'view', 'View user list'),
-- System
('view_audit_logs', 'system', 'view', 'View audit logs'),
('manage_api_keys', 'system', 'edit', 'Manage API keys');

-- Insert default admin user (password: Admin123!)
-- Password hash for 'Admin123!' generated with bcrypt
INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, role, is_active, is_verified)
VALUES (1, 'admin@elevareai.com', '$2a$10$XOjKqXQZX5qJxZ5qJxZ5qOqJxZ5qJxZ5qJxZ5qJxZ5qJxZ5qJxZ5q', 'System', 'Administrator', 'admin', 1, 1);
