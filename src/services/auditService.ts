import { logger } from '../utils/logger';

// Audit Service for Enterprise Compliance
// Handles logging of critical user actions for security and accountability.

export type AuditAction =
    | 'LOGIN'
    | 'LOGOUT'
    | 'VIEW_STUDENT'
    | 'UPDATE_IEP'
    | 'DELETE_STUDENT'
    | 'EXPORT_REPORT'
    | 'FINANCIAL_TRANSACTION';

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    userId: string;
    userRole: string;
    action: AuditAction;
    resourceId?: string;
    details: string;
    ipAddress?: string;
    status: 'success' | 'failure';
}

class AuditService {
    private logs: AuditLogEntry[] = [];
    private readonly STORAGE_KEY = 'audit_logs_local';

    constructor() {
        this.loadLogs();
    }

    private loadLogs() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                this.logs = JSON.parse(data);
            }
        } catch (_e) {
            console.warn('Failed to load audit logs from local storage');
        }
    }

    private saveLogs() {
        try {
            // Keep only last 1000 logs locally
            if (this.logs.length > 1000) {
                this.logs = this.logs.slice(-1000);
            }
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
        } catch (_e) {
            console.warn('Failed to save audit logs');
        }
    }

    public async log(
        userId: string,
        userRole: string,
        action: AuditAction,
        details: string,
        resourceId?: string,
        status: 'success' | 'failure' = 'success'
    ): Promise<void> {
        const entry: AuditLogEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            userId,
            userRole,
            action,
            details,
            resourceId,
            status
        };

        this.logs.push(entry);
        this.saveLogs();

        // In a real enterprise app, this would send data to a secure logging server (e.g. Splunk, ELK)
        // await fetch('https://api.enterprise.com/audit', { method: 'POST', body: JSON.stringify(entry) });

        if (process.env.NODE_ENV === 'development') {
            console.groupCollapsed(`[AUDIT] ${action}`);
            logger.info(JSON.stringify(entry));
            console.groupEnd();
        }
    }

    public getLogs(filter?: { userId?: string; action?: AuditAction }): AuditLogEntry[] {
        let filtered = this.logs;
        if (filter?.userId) filtered = filtered.filter(l => l.userId === filter.userId);
        if (filter?.action) filtered = filtered.filter(l => l.action === filter.action);
        return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    public exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }
}

export const auditService = new AuditService();
