/**
 * مكون الرسم البياني الديناميكي
 */

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface DynamicChartProps {
  data: ChartDataPoint[];
  type?: 'bar' | 'line' | 'pie' | 'doughnut';
  title?: string;
  height?: number;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
}

export function DynamicChart({
  data,
  type = 'bar',
  title,
  height = 300,
  className = '',
  showLegend = true,
}: DynamicChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gray-50 ${className}`}
        style={{ height }}
      >
        <p className="text-gray-500">لا توجد بيانات للعرض</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (type === 'bar') {
    return (
      <div className={`rounded-lg bg-white p-4 ${className}`}>
        {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
        <div className="space-y-3" style={{ height }}>
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="w-24 truncate text-sm text-gray-600">{item.label}</span>
              <div className="h-6 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color || colors[index % colors.length],
                  }}
                />
              </div>
              <span className="w-16 text-right text-sm font-medium">
                {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        {showLegend && (
          <div className="mt-4 flex flex-wrap gap-4 border-t pt-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color || colors[index % colors.length] }}
                />
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // للأنواع الأخرى، عرض بسيط
  return (
    <div className={`rounded-lg bg-white p-4 ${className}`}>
      {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
      <div className="grid grid-cols-2 gap-4" style={{ minHeight: height }}>
        {data.map((item, index) => (
          <div key={index} className="rounded-lg bg-gray-50 p-4 text-center">
            <div
              className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: item.color || colors[index % colors.length] }}
            >
              <span className="font-bold text-white">{index + 1}</span>
            </div>
            <p className="text-lg font-bold">{item.value.toLocaleString()}</p>
            <p className="text-sm text-gray-600">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DynamicChart;
