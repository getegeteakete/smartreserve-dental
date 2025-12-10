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
  MessageCircle,
  ClipboardList,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

export const AdminSidebar = ({ isCollapsed, onToggle, isMobileMenuOpen = false, onMobileMenuClose }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // メニューアイテムクリック時にスマホメニューを閉じる
  const handleMenuItemClick = (path: string) => {
    navigate(path);
    if (isMobile && onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  // 承認待ちの予約数を取得
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const { count, error } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        if (error) {
          console.error("承認待ち予約数取得エラー:", error);
        } else {
          setPendingCount(count || 0);
        }
      } catch (error) {
        console.error("承認待ち予約数取得エラー:", error);
      }
    };

    fetchPendingCount();

    // 定期的に更新（30秒ごと）
    const interval = setInterval(fetchPendingCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    {
      id: "dashboard",
      label: "ダッシュボード",
      icon: LayoutDashboard,
      path: "/admin",
      badge: null
    },
    {
      id: "appointments",
      label: "予約管理",
      icon: ClipboardList,
      path: "/admin/appointments",
      badge: pendingCount > 0 ? `${pendingCount}件` : null
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

  // スマホではオーバーレイ表示、PCでは通常表示
  if (isMobile) {
    return (
      <>
        {/* オーバーレイ */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onMobileMenuClose}
          />
        )}
        
        {/* サイドバー（スマホ） */}
        <div className={`fixed inset-y-0 left-0 bg-gray-900 text-white z-50 w-64 transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col h-screen`}>
          {/* ヘッダー */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-white">SmartReserve</h1>
                <p className="text-sm text-gray-400">管理システム</p>
              </div>
              <button
                onClick={onMobileMenuClose}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* メニューアイテム */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 relative ${
                    active 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className={`ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold ${
                      item.id === 'appointments' && pendingCount > 0 ? 'animate-pulse' : ''
                    }`}>
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
              <span className="text-sm font-medium">管理者</span>
              <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${
                showUserMenu ? 'rotate-180' : ''
              }`} />
            </button>
            
            {showUserMenu && (
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
      </>
    );
  }

  // PC版の表示
  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } relative flex flex-col h-screen`}>
      
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
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 relative ${
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
                <span className={`ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold ${
                  item.id === 'appointments' && pendingCount > 0 ? 'animate-pulse' : ''
                }`}>
                  {item.badge}
                </span>
              )}
              {item.badge && isCollapsed && item.id === 'appointments' && pendingCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {pendingCount > 9 ? '9+' : pendingCount}
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

