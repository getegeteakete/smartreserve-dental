import { useState, useEffect } from "react";
import { Bell, Search, User } from "lucide-react";

interface AdminContentHeaderProps {
  title: string;
  subtitle?: string;
}

export const AdminContentHeader = ({ title, subtitle }: AdminContentHeaderProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日曜日', '月曜日', '火曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    const weekday = weekdays[date.getDay()];
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `本日は令和${year - 2018}年${month}月${day}日(${weekday}) ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* 左側 - タイトル */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">SmartReserve</h1>
          <div className="text-gray-600">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* 右側 - アクション */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <Search className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};


