-- نظام سجل المكالمات و SMS
-- إضافة جداول المكالمات والرسائل النصية

-- جدول سجل المكالمات
CREATE TABLE IF NOT EXISTS call_logs (
    id TEXT PRIMARY KEY DEFAULT concat('call_', to_char(now(), 'YYYYMMDDHH24MISS'), '_', substr(md5(random()::text), 1, 8)),
    call_id TEXT UNIQUE NOT NULL,
    caller_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    callee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id TEXT REFERENCES conversations(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('voice', 'video')),
    status TEXT NOT NULL CHECK (status IN ('completed', 'missed', 'rejected', 'failed', 'busy')),
    direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
    duration INTEGER DEFAULT 0, -- بالثواني
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول إعدادات المكالمات للمستخدمين
CREATE TABLE IF NOT EXISTS call_settings (
    id TEXT PRIMARY KEY DEFAULT concat('callsett_', to_char(now(), 'YYYYMMDDHH24MISS'), '_', substr(md5(random()::text), 1, 8)),
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_enabled BOOLEAN DEFAULT true,
    audio_enabled BOOLEAN DEFAULT true,
    video_quality TEXT DEFAULT 'high' CHECK (video_quality IN ('low', 'medium', 'high', 'hd')),
    noise_suppression BOOLEAN DEFAULT true,
    echo_cancellation BOOLEAN DEFAULT true,
    auto_answer BOOLEAN DEFAULT false,
    ringtone_volume INTEGER DEFAULT 80 CHECK (ringtone_volume >= 0 AND ringtone_volume <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول سجل SMS
CREATE TABLE IF NOT EXISTS sms_logs (
    id TEXT PRIMARY KEY DEFAULT concat('sms_', to_char(now(), 'YYYYMMDDHH24MISS'), '_', substr(md5(random()::text), 1, 8)),
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('otp', 'notification', 'marketing', 'verification', 'alert')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    provider TEXT DEFAULT 'twilio',
    provider_message_id TEXT,
    cost DECIMAL(10, 4) DEFAULT 0,
    error_message TEXT,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول قوالب SMS
CREATE TABLE IF NOT EXISTS sms_templates (
    id TEXT PRIMARY KEY DEFAULT concat('smstpl_', to_char(now(), 'YYYYMMDDHH24MISS'), '_', substr(md5(random()::text), 1, 8)),
    name TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('otp', 'notification', 'marketing', 'verification', 'alert')),
    variables TEXT[], -- المتغيرات المستخدمة في القالب مثل {name}, {code}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول إعدادات SMS العامة
CREATE TABLE IF NOT EXISTS sms_settings (
    id TEXT PRIMARY KEY DEFAULT 'sms_settings_main',
    provider TEXT DEFAULT 'twilio',
    twilio_account_sid TEXT,
    twilio_auth_token TEXT,
    twilio_phone_number TEXT,
    nexmo_api_key TEXT,
    nexmo_api_secret TEXT,
    nexmo_from_number TEXT,
    daily_limit INTEGER DEFAULT 1000,
    monthly_limit INTEGER DEFAULT 30000,
    otp_expiry_minutes INTEGER DEFAULT 5,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_call_logs_caller_id ON call_logs(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_callee_id ON call_logs(callee_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_at ON call_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON call_logs(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_type ON call_logs(type);

CREATE INDEX IF NOT EXISTS idx_sms_logs_phone ON sms_logs(phone);
CREATE INDEX IF NOT EXISTS idx_sms_logs_user_id ON sms_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON sms_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON sms_logs(status);
CREATE INDEX IF NOT EXISTS idx_sms_logs_type ON sms_logs(type);

-- إدراج قوالب SMS الافتراضية
INSERT INTO sms_templates (name, name_ar, content, type, variables) VALUES
('otp_verification', 'رمز التحقق', 'رمز التحقق الخاص بك هو: {code}. صالح لمدة {expiry} دقائق.', 'otp', ARRAY['code', 'expiry']),
('welcome_message', 'رسالة ترحيب', 'أهلاً بك {name} في سوق مزاد! نتمنى لك تجربة ممتعة.', 'notification', ARRAY['name']),
('auction_won', 'فوز بمزاد', 'مبروك {name}! لقد فزت بمزاد {auction_title} بمبلغ {amount} د.ل', 'notification', ARRAY['name', 'auction_title', 'amount']),
('auction_outbid', 'تجاوز المزايدة', '{name}، تم تجاوز مزايدتك على {auction_title}. المزايدة الحالية: {amount} د.ل', 'alert', ARRAY['name', 'auction_title', 'amount']),
('payment_received', 'استلام دفعة', 'تم استلام دفعتك بمبلغ {amount} د.ل بنجاح. رصيدك الحالي: {balance} د.ل', 'notification', ARRAY['amount', 'balance']),
('account_verification', 'تحقق من الحساب', 'للتحقق من حسابك، يرجى استخدام الرمز: {code}', 'verification', ARRAY['code'])
ON CONFLICT (name) DO NOTHING;

-- إدراج إعدادات SMS الافتراضية
INSERT INTO sms_settings (id, provider, daily_limit, monthly_limit, otp_expiry_minutes, is_enabled)
VALUES ('sms_settings_main', 'twilio', 1000, 30000, 5, true)
ON CONFLICT (id) DO NOTHING;
