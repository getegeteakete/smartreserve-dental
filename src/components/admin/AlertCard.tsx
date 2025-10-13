import { AlertTriangle, Clock, Calendar } from "lucide-react";

interface AlertItem {
  id: string;
  title: string;
  description: string;
  badge: {
    text: string;
    color: 'red' | 'orange' | 'blue';
  };
}

interface AlertCardProps {
  title: string;
  items: AlertItem[];
  icon?: React.ComponentType<{ className?: string }>;
}

export const AlertCard = ({ title, items, icon: Icon = AlertTriangle }: AlertCardProps) => {
  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-500 text-white';
      case 'orange':
        return 'bg-orange-500 text-white';
      case 'blue':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(item.badge.color)}`}>
              {item.badge.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

