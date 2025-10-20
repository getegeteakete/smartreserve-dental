import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserCheck, 
  BookOpen, 
  Bell, 
  Settings,
  ChevronDown,
  ChevronRight,
  BarChart3,
  MessageCircle
} from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const AdminSidebar = ({ isCollapsed, onToggle }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      label: "ダッシュボード",
      icon: LayoutDashboard,
      path: "/admin",
      badge: null
    },
    {
      id: "schedule",
      label: "スケジュール設定",
      icon: Calendar,
      path: "/admin/schedule",
      badge: null
    },
    {
      id: "treatments",
      label: "診療メニュー管理",
      icon: Users,
      path: "/admin/treatments",
      badge: null
    },
    {
      id: "patients",
      label: "患者管理",
      icon: UserCheck,
      path: "/admin/patients",
      badge: null
    },
    {
      id: "notifications",
      label: "通知設定",
      icon: Bell,
      path: "/admin/notifications",
      badge: null
    },
    {
      id: "chat-history",
      label: "チャット履歴",
      icon: MessageCircle,
      path: "/admin/chat-history",
      badge: null
    },
    {
      id: "guide",
      label: "使い方ガイド",
      icon: BookOpen,
      path: "/admin/guide",
      badge: null
    },
    {
      id: "settings",
      label: "システム設定",
      icon: Settings,
      path: "/admin/settings",
      badge: null
    }
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("admin_username");
    navigate("/admin-login");
  };

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${isMobile ? 'fixed inset-0 z-50' : 'relative'} flex flex-col h-screen`}>
      
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white">SmartReserve</h1>
              <p className="text-sm text-gray-400">管理システム</p>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
          </button>
        </div>
      </div>

      {/* メニューアイテム */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                active 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {item.badge && !isCollapsed && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* フッター */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <>
              <span className="text-sm font-medium">管理者</span>
              <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${
                showUserMenu ? 'rotate-180' : ''
              }`} />
            </>
          )}
        </button>
        
        {showUserMenu && !isCollapsed && (
          <div className="mt-2 bg-gray-800 rounded-lg p-2">
            <div className="px-3 py-2 text-sm text-gray-400">
              sup@ei-life.co.jp
            </div>
            <div className="px-3 py-1 text-sm text-gray-400">
              (株)SmartReserve
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded transition-colors"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

