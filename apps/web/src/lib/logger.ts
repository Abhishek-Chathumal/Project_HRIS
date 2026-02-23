/**
 * Frontend Structured Logger — Project HRIS
 *
 * Features:
 * - Structured JSON logs with levels (DEBUG, INFO, WARN, ERROR)
 * - Component-scoped logging via `createLogger(component)`
 * - Memory buffer (last 500 entries) for diagnostics page
 * - Window error/unhandled rejection listeners
 * - Timestamps, action names, and metadata
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  action: string;
  message?: string;
  metadata?: Record<string, unknown>;
  duration?: number;
}

// ── In-memory buffer ────────────────────────

const MAX_BUFFER_SIZE = 500;
const logBuffer: LogEntry[] = [];

function addToBuffer(entry: LogEntry) {
  logBuffer.push(entry);
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.shift();
  }
}

export function getLogBuffer(): LogEntry[] {
  return [...logBuffer];
}

export function clearLogBuffer(): void {
  logBuffer.length = 0;
}

// ── Level config ────────────────────────────

const levelColors: Record<LogLevel, string> = {
  DEBUG: '#9CA3AF',
  INFO: '#3B82F6',
  WARN: '#F59E0B',
  ERROR: '#EF4444',
};

const levelPriority: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Minimum log level (configurable via env or localStorage)
function getMinLevel(): LogLevel {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('HRIS_LOG_LEVEL');
    if (stored && stored in levelPriority) return stored as LogLevel;
  }
  return process.env.NODE_ENV === 'production' ? 'WARN' : 'DEBUG';
}

function shouldLog(level: LogLevel): boolean {
  return levelPriority[level] >= levelPriority[getMinLevel()];
}

// ── Core logging function ───────────────────

function log(
  level: LogLevel,
  component: string,
  action: string,
  message?: string,
  metadata?: Record<string, unknown>,
) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    component,
    action,
    ...(message && { message }),
    ...(metadata && { metadata }),
  };

  addToBuffer(entry);

  if (!shouldLog(level)) return;

  const color = levelColors[level];
  const prefix = `%c[${entry.timestamp.split('T')[1].split('.')[0]}] %c${level}%c [${component}]`;
  const styles = [
    'color: #6b7280; font-weight: normal',
    `color: ${color}; font-weight: bold; padding: 0 4px`,
    'color: #8B5CF6; font-weight: 600',
  ];

  const args: unknown[] = [prefix, ...styles];
  if (action) args.push(action);
  if (message) args.push(`— ${message}`);

  switch (level) {
    case 'ERROR':
      console.error(...args, metadata || '');
      break;
    case 'WARN':
      console.warn(...args, metadata || '');
      break;
    case 'DEBUG':
      console.debug(...args, metadata || '');
      break;
    default:
      console.log(...args, metadata || '');
  }
}

// ── Component Logger ────────────────────────

export interface ComponentLogger {
  debug: (action: string, message?: string, metadata?: Record<string, unknown>) => void;
  info: (action: string, message?: string, metadata?: Record<string, unknown>) => void;
  warn: (action: string, message?: string, metadata?: Record<string, unknown>) => void;
  error: (action: string, message?: string, metadata?: Record<string, unknown>) => void;
  time: (action: string) => () => void;
}

export function createLogger(component: string): ComponentLogger {
  return {
    debug: (action, message, metadata) => log('DEBUG', component, action, message, metadata),
    info: (action, message, metadata) => log('INFO', component, action, message, metadata),
    warn: (action, message, metadata) => log('WARN', component, action, message, metadata),
    error: (action, message, metadata) => log('ERROR', component, action, message, metadata),
    time: (action: string) => {
      const start = performance.now();
      log('DEBUG', component, action, 'Timer started');
      return () => {
        const duration = Math.round(performance.now() - start);
        log('INFO', component, action, `Completed in ${duration}ms`, { duration });
      };
    },
  };
}

// ── Global error listeners ──────────────────

if (typeof window !== 'undefined') {
  const globalLogger = createLogger('Global');

  window.addEventListener('error', (event) => {
    globalLogger.error('UncaughtError', event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    globalLogger.error('UnhandledPromiseRejection', String(event.reason), {
      reason: event.reason?.message || String(event.reason),
    });
  });
}

// ── API request logger ──────────────────────

const apiLogger = createLogger('API');

export function logApiRequest(method: string, url: string, status?: number, durationMs?: number) {
  const level: LogLevel = !status
    ? 'DEBUG'
    : status >= 500
      ? 'ERROR'
      : status >= 400
        ? 'WARN'
        : 'INFO';
  const action = `${method.toUpperCase()} ${url}`;
  const message = status ? `${status} (${durationMs}ms)` : 'Sending request';
  log(level, 'API', action, message, { method, url, status, durationMs });
}

// ── Navigation logger ───────────────────────

export function logNavigation(from: string, to: string) {
  log('INFO', 'Router', 'Navigate', `${from} → ${to}`, { from, to });
}

// ── Export convenience ──────────────────────

export const logger = createLogger('App');
