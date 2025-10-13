import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  items: Array<{
    label: string;
    value: string;
  }>;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatsCard = ({ title, items, trend }: StatsCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="space-y-3 mb-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className="text-sm font-medium text-gray-900 text-right">{item.value}</span>
          </div>
        ))}
      </div>
      
      {trend && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full ${trend.isPositive ? 'bg-green-500' : 'bg-red-500'} w-3/4`}></div>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend.isPositive ? 'text-red-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {trend.value}
          </div>
        </div>
      )}
    </div>
  );
};

