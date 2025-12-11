interface RealTimeIndicatorProps {
  status: 'connected' | 'disconnected' | 'connecting';
  lastUpdated?: string;
}

export default function RealTimeIndicator({ status, lastUpdated }: RealTimeIndicatorProps) {
  const statusColors = {
    connected: 'bg-emerald-500',
    disconnected: 'bg-red-500',
    connecting: 'bg-amber-500',
  };

  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      <span className="relative flex h-3 w-3">
        {status === 'connected' && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex h-3 w-3 rounded-full ${statusColors[status]}`}
        ></span>
      </span>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-slate-300">
          {status === 'connected'
            ? 'Live System'
            : status === 'connecting'
              ? 'Connecting...'
              : 'Offline'}
        </span>
        {lastUpdated && <span className="text-[10px] text-slate-500">Updated: {lastUpdated}</span>}
      </div>
    </div>
  );
}
