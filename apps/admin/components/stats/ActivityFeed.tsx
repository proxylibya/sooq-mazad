import { ClockIcon, CurrencyDollarIcon, UserIcon } from '@heroicons/react/24/outline';

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

export default function ActivityFeed({ items }: ActivityFeedProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'USER_REGISTER':
        return <UserIcon className="h-5 w-5 text-blue-500" />;
      case 'AUCTION_CREATE':
        return <CurrencyDollarIcon className="h-5 w-5 text-emerald-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-slate-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {items.map((item, itemIdx) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {itemIdx !== items.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-700"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3 rtl:space-x-reverse">
                <div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800 ring-8 ring-slate-800">
                    {getIcon(item.type)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5 rtl:space-x-reverse">
                  <div>
                    <p className="text-sm text-slate-300">{item.message}</p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-slate-500">
                    <time dateTime={item.timestamp}>{formatTime(item.timestamp)}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
