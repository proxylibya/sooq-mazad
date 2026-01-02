-- إصلاح العلاقات المفقودة في قاعدة البيانات
-- تحديث العلاقات لإضافة CASCADE DELETE حيث مطلوب

-- تحديث conversation_participants
ALTER TABLE conversation_participants 
DROP CONSTRAINT IF EXISTS conversation_participants_userId_fkey;

ALTER TABLE conversation_participants 
ADD CONSTRAINT conversation_participants_userId_fkey 
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;

-- تحديث message_reads  
ALTER TABLE message_reads 
DROP CONSTRAINT IF EXISTS message_reads_userId_fkey;

ALTER TABLE message_reads 
ADD CONSTRAINT message_reads_userId_fkey 
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;

-- تحديث support_responses (SET NULL للعلاقات الاختيارية)
ALTER TABLE support_responses 
DROP CONSTRAINT IF EXISTS support_responses_userId_fkey;

ALTER TABLE support_responses 
ADD CONSTRAINT support_responses_userId_fkey 
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL;

-- تحديث sms_logs
ALTER TABLE sms_logs 
DROP CONSTRAINT IF EXISTS sms_logs_userId_fkey;

ALTER TABLE sms_logs 
ADD CONSTRAINT sms_logs_userId_fkey 
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL;

-- تحديث activity_logs
ALTER TABLE activity_logs 
DROP CONSTRAINT IF EXISTS activity_logs_userId_fkey;

ALTER TABLE activity_logs 
ADD CONSTRAINT activity_logs_userId_fkey 
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL;

-- تحديث security_logs
ALTER TABLE security_logs 
DROP CONSTRAINT IF EXISTS security_logs_userId_fkey;

ALTER TABLE security_logs 
ADD CONSTRAINT security_logs_userId_fkey 
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL;

-- تحديث audit_logs
ALTER TABLE audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_userId_fkey;

ALTER TABLE audit_logs 
ADD CONSTRAINT audit_logs_userId_fkey 
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_adminId_fkey;

ALTER TABLE audit_logs 
ADD CONSTRAINT audit_logs_adminId_fkey 
FOREIGN KEY (adminId) REFERENCES users(id) ON DELETE SET NULL;

-- تحديث analytics_events
ALTER TABLE analytics_events 
DROP CONSTRAINT IF EXISTS analytics_events_userId_fkey;

ALTER TABLE analytics_events 
ADD CONSTRAINT analytics_events_userId_fkey 
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL;
