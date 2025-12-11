import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/solid';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  isUp?: boolean;
  description?: string;
  color?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  isUp,
  description,
  color = 'blue',
}: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-700 bg-blue-500/10 text-blue-500',
    emerald: 'from-emerald-600 to-emerald-700 bg-emerald-500/10 text-emerald-500',
    amber: 'from-amber-600 to-amber-700 bg-amber-500/10 text-amber-500',
    purple: 'from-purple-600 to-purple-700 bg-purple-500/10 text-purple-500',
    pink: 'from-pink-600 to-pink-700 bg-pink-500/10 text-pink-500',
    indigo: 'from-indigo-600 to-indigo-700 bg-indigo-500/10 text-indigo-500',
    red: 'from-red-600 to-red-700 bg-red-500/10 text-red-500',
  };

  // Default to blue if color not found
  const selectedColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;
  const [gradient, bg, text] = selectedColor.split(' ');

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 p-6 transition-all hover:border-slate-600 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
        </div>
        <div className={`rounded-xl bg-gradient-to-br p-3 ${gradient}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>

      {(trend || description) && (
        <div className="mt-4 flex items-center text-sm">
          {trend && (
            <span
              className={`flex items-center font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {isUp ? (
                <ArrowUpIcon className="mr-1 h-4 w-4" />
              ) : (
                <ArrowDownIcon className="mr-1 h-4 w-4" />
              )}
              {trend}
            </span>
          )}
          {description && <span className="ml-2 text-slate-500">{description}</span>}
        </div>
      )}
    </div>
  );
}
