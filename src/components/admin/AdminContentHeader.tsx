import { useState, useEffect } from "react";
import { Bell, Search, User, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminContentHeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

export const AdminContentHeader = ({ title, subtitle, onMenuToggle }: AdminContentHeaderProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const isMobile = useIsMobile();

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
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* 左側 - ハンバーガーメニュー（スマホのみ）とタイトル */}
        <div className="flex items-center gap-2 md:gap-4">
          {isMobile && onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">SmartReserve</h1>
          {!isMobile && (
            <div className="text-sm md:text-base text-gray-600">
              {formatDate(currentTime)}
            </div>
          )}
        </div>

        {/* 右側 - アクション */}
        <div className="flex items-center gap-2 md:gap-4">
          {isMobile && (
            <div className="text-xs text-gray-600">
              {formatDate(currentTime)}
            </div>
          )}
          {!isMobile && (
            <>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <User className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


