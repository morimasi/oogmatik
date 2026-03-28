import { logger } from '../utils/logger';
/**
 * OOGMATIK - Audit Logging System
 * Log all operations, permission checks, and security events
 */

import { Timestamp } from 'firebase/firestore';

export type AuditEventType =
    | 'CREATE_WORKSHEET'
    | 'READ_WORKSHEET'
    | 'UPDATE_WORKSHEET'
    | 'DELETE_WORKSHEET'
    | 'SHARE_WORKSHEET'
    | 'PERMISSION_DENIED'
    | 'AUTHENTICATION_FAILED'
    | 'ROLE_CHANGED'
    | 'USER_ACTIVATED'
    | 'USER_DEACTIVATED';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLog {
    id: string;
    timestamp: Timestamp;
    eventType: AuditEventType;
    severity: AuditSeverity;
    userId: string;
    userName: string;
    userRole: string;
    action: string;
    resourceId?: string;
    resourceType?: string;
    ipAddress?: string;
    userAgent?: string;
    status: 'success' | 'failure';
    errorMessage?: string;
    details: {
        [key: string]: any;
    };
}

/**
 * Audit Logger Service
 */
export class AuditLogger {
    private static readonly COLLECTION = 'audit_logs';
    private static readonly MAX_BATCH = 100;
    private static logs: AuditLog[] = [];

    /**
     * Log an audit event
     */
    static log(
        eventType: AuditEventType,
        userId: string,
        userName: string,
        userRole: string,
        action: string,
        details: any = {},
        severity: AuditSeverity = 'info'
    ): void {
        const auditLog: AuditLog = {
            id: this.generateId(),
            timestamp: Timestamp.now(),
            eventType,
            severity,
            userId,
            userName,
            userRole,
            action,
            status: 'success',
            details,
        };

        // Add to batch
        this.logs.push(auditLog);

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            logger.info(`[AUDIT] ${eventType}:`, {
                user: userName,
                action,
                timestamp: new Date(),
                details,
            });
        }

        // Flush if batch is full
        if (this.logs.length >= this.MAX_BATCH) {
            this.flush();
        }
    }

    /**
     * Log permission denied event
     */
    static logPermissionDenied(
        userId: string,
        userName: string,
        userRole: string,
        deniedPermission: string,
        resourceId?: string,
        reason?: string
    ): void {
        this.log(
            'PERMISSION_DENIED',
            userId,
            userName,
            userRole,
            `Attempted to perform action without permission: ${deniedPermission}`,
            {
                permission: deniedPermission,
                resourceId,
                reason,
            },
            'warning'
        );
    }

    /**
     * Log authentication failure
     */
    static logAuthenticationFailure(
        reason: string,
        ipAddress?: string,
        userAgent?: string
    ): void {
        this.log(
            'AUTHENTICATION_FAILED',
            'unknown',
            'Unknown User',
            'none',
            `Authentication failed: ${reason}`,
            {
                ipAddress,
                userAgent,
                reason,
            },
            'warning'
        );
    }

    /**
     * Log worksheet operation
     */
    static logWorksheetOperation(
        operationType: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'SHARE',
        worksheetId: string,
        userId: string,
        userName: string,
        userRole: string,
        details?: any
    ): void {
        const eventTypeMap = {
            CREATE: 'CREATE_WORKSHEET' as AuditEventType,
            READ: 'READ_WORKSHEET' as AuditEventType,
            UPDATE: 'UPDATE_WORKSHEET' as AuditEventType,
            DELETE: 'DELETE_WORKSHEET' as AuditEventType,
            SHARE: 'SHARE_WORKSHEET' as AuditEventType,
        };

        this.log(
            eventTypeMap[operationType],
            userId,
            userName,
            userRole,
            `${operationType} worksheet: ${worksheetId}`,
            {
                worksheetId,
                operation: operationType,
                ...details,
            }
        );
    }

    /**
     * Log role change
     */
    static logRoleChange(
        targetUserId: string,
        targetUserName: string,
        oldRole: string,
        newRole: string,
        adminId: string,
        adminName: string
    ): void {
        this.log(
            'ROLE_CHANGED',
            adminId,
            adminName,
            'admin',
            `Changed role for user ${targetUserName} from ${oldRole} to ${newRole}`,
            {
                targetUserId,
                targetUserName,
                oldRole,
                newRole,
            },
            'info'
        );
    }

    /**
     * Log user activation/deactivation
     */
    static logUserStatusChange(
        targetUserId: string,
        targetUserName: string,
        isActivated: boolean,
        adminId: string,
        adminName: string
    ): void {
        const eventType = isActivated ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';
        this.log(
            eventType,
            adminId,
            adminName,
            'admin',
            `${isActivated ? 'Activated' : 'Deactivated'} user: ${targetUserName}`,
            {
                targetUserId,
                targetUserName,
                isActivated,
            }
        );
    }

    /**
     * Flush logs to Firestore
     */
    static async flush(): Promise<void> {
        if (this.logs.length === 0) return;

        try {
            const batch = this.logs.splice(0, this.MAX_BATCH);
            
            // In production, save to Firestore
            // For now, log to console
            logger.info(`[AUDIT] Flushing ${batch.length} log entries to database`);

            // Mock: Save to localStorage for demo
            const existing = JSON.parse(localStorage.getItem('audit_logs') || '[]');
            const updated = [...existing, ...batch].slice(-1000); // Keep last 1000
            localStorage.setItem('audit_logs', JSON.stringify(updated));
        } catch (error) {
            console.error('[AUDIT] Failed to flush logs:', error);
        }
    }

    /**
     * Get audit logs with filtering
     */
    static getLogsSummary(): {
        totalLogs: number;
        lastHourCount: number;
        deniedPermissionsCount: number;
        failedAuthCount: number;
        criticalEvents: AuditLog[];
    } {
        try {
            const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
            const now = Date.now();
            const oneHourAgo = now - 60 * 60 * 1000;

            const lastHourLogs = logs.filter(
                (log: any) =>
                    new Date(log.timestamp._seconds * 1000).getTime() > oneHourAgo
            );

            const deniedPermissions = logs.filter(
                (log: any) => log.eventType === 'PERMISSION_DENIED'
            );

            const failedAuth = logs.filter(
                (log: any) => log.eventType === 'AUTHENTICATION_FAILED'
            );

            const criticalEvents = logs.filter(
                (log: any) => log.severity === 'critical'
            );

            return {
                totalLogs: logs.length,
                lastHourCount: lastHourLogs.length,
                deniedPermissionsCount: deniedPermissions.length,
                failedAuthCount: failedAuth.length,
                criticalEvents,
            };
        } catch (error) {
            console.error('[AUDIT] Failed to get logs summary:', error);
            return {
                totalLogs: 0,
                lastHourCount: 0,
                deniedPermissionsCount: 0,
                failedAuthCount: 0,
                criticalEvents: [],
            };
        }
    }

    /**
     * Generate unique log ID
     */
    private static generateId(): string {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Middleware: Log all API requests
 */
export const auditLoggingMiddleware = (
    req: any,
    res: any,
    next: any
) => {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    // Attach audit logger to request
    req.auditLog = (
        action: string,
        details: any = {},
        severity: AuditSeverity = 'info'
    ) => {
        const eventType = req.method === 'POST' ? 'CREATE_WORKSHEET' : 'READ_WORKSHEET';
        AuditLogger.log(
            eventType as AuditEventType,
            userId,
            'User',
            userRole,
            action,
            {
                method: req.method,
                path: req.url,
                ...details,
            },
            severity
        );
    };

    next();
};

/**
 * Example usage in API handlers
 */
export const auditLogExamples = {
    logWorksheetCreated: (userId: string, worksheetId: string, worksheetName: string) => {
        AuditLogger.logWorksheetOperation(
            'CREATE',
            worksheetId,
            userId,
            'User Name',
            'teacher',
            { worksheetName }
        );
    },

    logWorksheetDeleted: (userId: string, worksheetId: string) => {
        AuditLogger.logWorksheetOperation(
            'DELETE',
            worksheetId,
            userId,
            'User Name',
            'teacher'
        );
    },

    logAccessDenied: (
        userId: string,
        userName: string,
        permission: string,
        resourceId: string
    ) => {
        AuditLogger.logPermissionDenied(
            userId,
            userName,
            'student',
            permission,
            resourceId,
            'User lacks required permission'
        );
    },
};

export default AuditLogger;
