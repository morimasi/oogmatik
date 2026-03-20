import { useState, useCallback, useEffect } from 'react';
import type { AuditLogEntry, AuditAction, UserRoleType } from '../types/admin';

const STORAGE_KEY = 'admin_audit_log';
const MAX_LOG_ENTRIES = 500;

interface AuditLogFilter {
  search?: string;
  action?: AuditAction | '';
  actorId?: string;
  severity?: 'info' | 'warning' | 'error' | '';
  dateFrom?: string;
  dateTo?: string;
}

interface UseAuditLogReturn {
  entries: AuditLogEntry[];
  filteredEntries: AuditLogEntry[];
  loading: boolean;
  filter: AuditLogFilter;
  setFilter: (f: Partial<AuditLogFilter>) => void;
  resetFilter: () => void;
  addEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  clearLog: () => void;
  exportAsCsv: () => void;
  exportAsJson: () => void;
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  totalPages: number;
}

function generateId(): string {
  return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadLog(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return generateSeedLog();
    return JSON.parse(raw) as AuditLogEntry[];
  } catch {
    return generateSeedLog();
  }
}

function saveLog(entries: AuditLogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_LOG_ENTRIES)));
  } catch {
    // ignore
  }
}

function generateSeedLog(): AuditLogEntry[] {
  const actors: Array<{ id: string; name: string; role: UserRoleType }> = [
    { id: 'u1', name: 'Ahmet Yılmaz', role: 'admin' },
    { id: 'u2', name: 'Ayşe Demir', role: 'teacher' },
    { id: 'u3', name: 'Mehmet Kaya', role: 'student' },
  ];
  const actions: AuditAction[] = [
    'user.login', 'worksheet.created', 'worksheet.exported', 'user.updated',
    'permission.granted', 'system.settings_changed', 'cloud.sync',
  ];
  const severities: AuditLogEntry['severity'][] = ['info', 'info', 'info', 'warning', 'info'];

  return Array.from({ length: 25 }, (_, i) => {
    const actor = actors[i % actors.length];
    const action = actions[i % actions.length];
    return {
      id: generateId(),
      action,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      severity: severities[i % severities.length],
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      targetType: 'worksheet',
      targetLabel: `Çalışma #${i + 1}`,
    };
  });
}

export function useAuditLog(): UseAuditLogReturn {
  const [entries, setEntries] = useState<AuditLogEntry[]>(() => loadLog());
  const [filter, setFilterState] = useState<AuditLogFilter>({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const PAGE_SIZE = 20;

  useEffect(() => {
    saveLog(entries);
  }, [entries]);

  const setFilter = useCallback((f: Partial<AuditLogFilter>) => {
    setFilterState((prev) => ({ ...prev, ...f }));
    setPage(1);
  }, []);

  const resetFilter = useCallback(() => {
    setFilterState({});
    setPage(1);
  }, []);

  const addEntry = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    setEntries((prev) => [newEntry, ...prev].slice(0, MAX_LOG_ENTRIES));
  }, []);

  const clearLog = useCallback(() => {
    setEntries([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Apply filters
  const filteredEntries = entries.filter((e) => {
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (
        !e.actorName.toLowerCase().includes(q) &&
        !e.action.toLowerCase().includes(q) &&
        !(e.targetLabel ?? '').toLowerCase().includes(q)
      )
        return false;
    }
    if (filter.action && e.action !== filter.action) return false;
    if (filter.severity && e.severity !== filter.severity) return false;
    if (filter.actorId && e.actorId !== filter.actorId) return false;
    if (filter.dateFrom && e.timestamp < filter.dateFrom) return false;
    if (filter.dateTo && e.timestamp > filter.dateTo + 'T23:59:59Z') return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));

  const exportAsCsv = useCallback(() => {
    const headers = ['ID', 'Zaman', 'İşlem', 'Kullanıcı', 'Rol', 'Hedef', 'Önem'];
    const rows = filteredEntries.map((e) => [
      e.id, e.timestamp, e.action, e.actorName, e.actorRole, e.targetLabel ?? '', e.severity,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredEntries]);

  const exportAsJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(filteredEntries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredEntries]);

  return {
    entries,
    filteredEntries: filteredEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    loading,
    filter,
    setFilter,
    resetFilter,
    addEntry,
    clearLog,
    exportAsCsv,
    exportAsJson,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    totalPages,
  };
}
