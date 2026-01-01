-- ═══════════════════════════════════════════════════════════════════════
-- Migration: Unify User and Admin Models
-- Date: 2024-11-27
-- Description: دمج نموذج Admin في User وتوحيد النظام
-- ═══════════════════════════════════════════════════════════════════════

-- Step 1: إضافة الحقول الجديدة لجدول users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Step 2: نقل بيانات المديرين من جدول admins إلى users
INSERT INTO users (
    id,
    name,
    email,
    password_hash,
    role,
    is_admin,
    is_super_admin,
    permissions,
    status,
    created_at,
    updated_at,
    last_login,
    login_identifier
)
SELECT 
    'admin_' || id as id,
    name,
    email,
    password_hash,
    CASE 
        WHEN role = 'SUPER_ADMIN' THEN 'SUPER_ADMIN'::user_role
        WHEN role = 'ADMIN' THEN 'ADMIN'::user_role
        WHEN role = 'MODERATOR' THEN 'MODERATOR'::user_role
        ELSE 'USER'::user_role
    END as role,
    TRUE as is_admin,
    CASE WHEN role = 'SUPER_ADMIN' THEN TRUE ELSE FALSE END as is_super_admin,
    ARRAY[]::TEXT[] as permissions,
    CASE WHEN is_active THEN 'ACTIVE'::user_status ELSE 'SUSPENDED'::user_status END as status,
    created_at,
    updated_at,
    last_login,
    email as login_identifier
FROM admins
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE users.email = admins.email
);

-- Step 3: إنشاء جدول الجلسات الموحد
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_token TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    device_fingerprint TEXT,
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 4: نقل جلسات المديرين إلى الجدول الموحد
INSERT INTO user_sessions (
    id,
    session_token,
    user_id,
    ip_address,
    user_agent,
    device_fingerprint,
    login_at,
    last_activity,
    logout_at,
    expires_at,
    is_active
)
SELECT 
    'admin_session_' || id as id,
    session_token,
    'admin_' || admin_id as user_id,
    ip_address,
    user_agent,
    device_fingerprint,
    login_at,
    last_activity,
    logout_at,
    expires_at,
    is_active
FROM admin_sessions
WHERE EXISTS (
    SELECT 1 FROM users WHERE users.id = 'admin_' || admin_sessions.admin_id
);

-- Step 5: إنشاء جدول النشاطات الموحد
CREATE TABLE IF NOT EXISTS user_activities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    
    CONSTRAINT fk_user_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 6: نقل نشاطات المديرين
INSERT INTO user_activities (
    id,
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent,
    created_at,
    success,
    error_message
)
SELECT 
    'admin_activity_' || id as id,
    'admin_' || admin_id as user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent,
    created_at,
    success,
    error_message
FROM admin_activities
WHERE EXISTS (
    SELECT 1 FROM users WHERE users.id = 'admin_' || admin_activities.admin_id
);

-- Step 7: إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_action ON user_activities(action);
CREATE INDEX IF NOT EXISTS idx_user_activities_created ON user_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_permissions ON users USING GIN(permissions);

-- Step 8: إضافة قيود للتأكد من تكامل البيانات
ALTER TABLE users ADD CONSTRAINT check_admin_role 
    CHECK ((is_admin = TRUE AND role IN ('ADMIN', 'SUPER_ADMIN', 'MODERATOR')) OR is_admin = FALSE);

-- Step 9: تنظيف (اختياري - بعد التأكد من نجاح النقل)
-- هذه الأوامر معطلة للأمان، قم بتفعيلها بعد التأكد
-- DROP TABLE IF EXISTS admin_permissions CASCADE;
-- DROP TABLE IF EXISTS admin_activities CASCADE;
-- DROP TABLE IF EXISTS admin_sessions CASCADE;
-- DROP TABLE IF EXISTS admins CASCADE;

-- Step 10: إضافة تعليق توضيحي
COMMENT ON TABLE user_sessions IS 'Unified sessions table for all users including admins';
COMMENT ON TABLE user_activities IS 'Unified activity log for all users including admins';
COMMENT ON COLUMN users.is_admin IS 'True if user has admin privileges';
COMMENT ON COLUMN users.is_super_admin IS 'True if user has super admin privileges';
COMMENT ON COLUMN users.permissions IS 'Array of custom permissions for fine-grained access control';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully! Users and Admins are now unified.';
END $$;
