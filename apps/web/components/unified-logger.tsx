/**
 * مكون عرض السجلات
 */

export interface LogEntry {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export interface UnifiedLoggerProps {
  logs?: LogEntry[];
  maxHeight?: number;
  showTimestamp?: boolean;
  showLevel?: boolean;
  className?: string;
}

const levelColors = {
  debug: 'text-gray-500',
  info: 'text-blue-600',
  warn: 'text-yellow-600',
  error: 'text-red-600',
};

const levelBgs = {
  debug: 'bg-gray-100',
  info: 'bg-blue-50',
  warn: 'bg-yellow-50',
  error: 'bg-red-50',
};

export function UnifiedLogger({
  logs = [],
  maxHeight = 400,
  showTimestamp = true,
  showLevel = true,
  className = '',
}: UnifiedLoggerProps) {
  if (logs.length === 0) {
    return (
      <div className={`rounded-lg bg-gray-50 p-4 text-center text-gray-500 ${className}`}>
        لا توجد سجلات
      </div>
    );
  }

  return (
    <div className={`overflow-auto rounded-lg border bg-white ${className}`} style={{ maxHeight }}>
      {logs.map((log) => (
        <div key={log.id} className={`border-b p-3 last:border-b-0 ${levelBgs[log.level]}`}>
          <div className="flex items-start gap-2">
            {showLevel && (
              <span className={`text-xs font-medium uppercase ${levelColors[log.level]}`}>
                [{log.level}]
              </span>
            )}
            <span className="flex-1 text-sm">{log.message}</span>
            {showTimestamp && (
              <span className="text-xs text-gray-400">
                {new Date(log.timestamp).toLocaleTimeString('ar-LY')}
              </span>
            )}
          </div>
          {log.context && (
            <pre className="mt-2 overflow-x-auto rounded bg-white/50 p-2 text-xs text-gray-600">
              {JSON.stringify(log.context, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

export default UnifiedLogger;
