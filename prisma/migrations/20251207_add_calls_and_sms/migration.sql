-- =============================================
-- نظام سجل المكالمات ورسائل SMS
-- =============================================

-- جدول سجل المكالمات
CREATE TABLE IF NOT EXISTS "call_logs" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    
    -- المتصل
    "callerId" TEXT NOT NULL,
    "callerName" TEXT,
    "callerPhone" TEXT,
    
    -- المتلقي
    "calleeId" TEXT NOT NULL,
    "calleeName" TEXT,
    "calleePhone" TEXT,
    
    -- معلومات المكالمة
    "type" TEXT NOT NULL DEFAULT 'voice', -- 'voice' | 'video'
    "status" TEXT NOT NULL DEFAULT 'ringing', -- 'ringing' | 'connecting' | 'connected' | 'ended' | 'rejected' | 'missed' | 'busy' | 'failed'
    "direction" TEXT NOT NULL DEFAULT 'outgoing', -- 'incoming' | 'outgoing'
    
    -- المدة والتوقيت
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answerTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "duration" INTEGER DEFAULT 0, -- بالثواني
    
    -- معلومات إضافية
    "conversationId" TEXT,
    "quality" TEXT, -- 'excellent' | 'good' | 'fair' | 'poor'
    "endReason" TEXT, -- سبب إنهاء المكالمة
    "metadata" JSONB, -- بيانات إضافية
    
    -- التتبع
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

-- جدول رسائل SMS
CREATE TABLE IF NOT EXISTS "sms_logs" (
    "id" TEXT NOT NULL,
    
    -- معلومات الرسالة
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'notification', -- 'otp' | 'notification' | 'marketing' | 'reminder'
    "status" TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'sent' | 'delivered' | 'failed'
    
    -- معلومات المستخدم
    "userId" TEXT,
    "userName" TEXT,
    
    -- التكلفة والمزود
    "cost" DECIMAL(10, 4) DEFAULT 0,
    "provider" TEXT DEFAULT 'local', -- 'twilio' | 'nexmo' | 'local' | 'custom'
    "providerId" TEXT, -- معرف الرسالة من المزود
    
    -- التوقيت
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    
    -- الأخطاء
    "errorCode" TEXT,
    "errorMessage" TEXT,
    
    -- بيانات إضافية
    "metadata" JSONB,
    
    -- التتبع
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_logs_pkey" PRIMARY KEY ("id")
);

-- جدول قوالب الرسائل
CREATE TABLE IF NOT EXISTS "sms_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- 'otp' | 'notification' | 'marketing' | 'reminder'
    "content" TEXT NOT NULL,
    "variables" TEXT[], -- المتغيرات المستخدمة في القالب
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_templates_pkey" PRIMARY KEY ("id")
);

-- جدول إعدادات الاتصالات
CREATE TABLE IF NOT EXISTS "communication_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL UNIQUE,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "communication_settings_pkey" PRIMARY KEY ("id")
);

-- الفهارس
CREATE INDEX IF NOT EXISTS "call_logs_callerId_idx" ON "call_logs"("callerId");
CREATE INDEX IF NOT EXISTS "call_logs_calleeId_idx" ON "call_logs"("calleeId");
CREATE INDEX IF NOT EXISTS "call_logs_status_idx" ON "call_logs"("status");
CREATE INDEX IF NOT EXISTS "call_logs_type_idx" ON "call_logs"("type");
CREATE INDEX IF NOT EXISTS "call_logs_startTime_idx" ON "call_logs"("startTime");
CREATE INDEX IF NOT EXISTS "call_logs_conversationId_idx" ON "call_logs"("conversationId");

CREATE INDEX IF NOT EXISTS "sms_logs_phone_idx" ON "sms_logs"("phone");
CREATE INDEX IF NOT EXISTS "sms_logs_userId_idx" ON "sms_logs"("userId");
CREATE INDEX IF NOT EXISTS "sms_logs_status_idx" ON "sms_logs"("status");
CREATE INDEX IF NOT EXISTS "sms_logs_type_idx" ON "sms_logs"("type");
CREATE INDEX IF NOT EXISTS "sms_logs_createdAt_idx" ON "sms_logs"("createdAt");

-- إدراج قوالب افتراضية
INSERT INTO "sms_templates" ("id", "name", "type", "content", "variables") VALUES
    ('tpl_otp_default', 'رمز التحقق الافتراضي', 'otp', 'رمز التحقق الخاص بك في سوق مزاد: {{code}} - صالح لمدة 5 دقائق', ARRAY['code']),
    ('tpl_notification_default', 'إشعار افتراضي', 'notification', 'لديك إشعار جديد في سوق مزاد: {{message}}', ARRAY['message']),
    ('tpl_auction_won', 'فوز بمزاد', 'notification', 'مبروك! لقد فزت بمزاد {{auctionTitle}} بمبلغ {{amount}} دينار', ARRAY['auctionTitle', 'amount']),
    ('tpl_auction_outbid', 'مزايدة أعلى', 'notification', 'تم تجاوز مزايدتك على {{auctionTitle}}. المزايدة الحالية: {{amount}} دينار', ARRAY['auctionTitle', 'amount'])
ON CONFLICT DO NOTHING;

-- إدراج إعدادات افتراضية
INSERT INTO "communication_settings" ("id", "key", "value", "description") VALUES
    ('cs_webrtc', 'webrtc_config', '{"stunServers": ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"], "turnServer": "", "iceGatheringTimeout": 10000, "connectionTimeout": 30000}', 'إعدادات WebRTC'),
    ('cs_sms', 'sms_config', '{"provider": "local", "senderName": "سوق مزاد", "otpTemplate": "tpl_otp_default"}', 'إعدادات SMS'),
    ('cs_notifications', 'notification_config', '{"enableCallNotifications": true, "enableSMSNotifications": true, "quietHoursStart": "23:00", "quietHoursEnd": "07:00"}', 'إعدادات الإشعارات')
ON CONFLICT DO NOTHING;
