/**
 * Activity Logger - Simple implementation
 */

export interface ActivityLogEntry {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    timestamp?: Date;
}

class ActivityLogger {
    async log(entry: ActivityLogEntry): Promise<void> {
        const logEntry = {
            ...entry,
            timestamp: entry.timestamp || new Date(),
        };

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('[Activity]', JSON.stringify(logEntry, null, 2));
        }

        // In production, you would save to database
        // await prisma.activityLogs.create({ data: logEntry });
    }

    async logUserAction(userId: string, action: string, details?: Record<string, any>): Promise<void> {
        await this.log({
            userId,
            action,
            resource: 'user',
            resourceId: userId,
            details,
        });
    }

    async logAdminAction(adminId: string, action: string, targetResource: string, targetId?: string, details?: Record<string, any>): Promise<void> {
        await this.log({
            userId: adminId,
            action: `admin:${action}`,
            resource: targetResource,
            resourceId: targetId,
            details,
        });
    }

    async logSecurityEvent(event: string, details?: Record<string, any>, ipAddress?: string): Promise<void> {
        await this.log({
            action: `security:${event}`,
            resource: 'security',
            details,
            ipAddress,
        });
    }
}

export const activityLogger = new ActivityLogger();
export default activityLogger;
