
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminContentHeader } from "@/components/admin/AdminContentHeader";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { AlertCard } from "@/components/admin/AlertCard";
import { StatsCard } from "@/components/admin/StatsCard";
import { Car, CheckCircle, Wrench, Users as UsersIcon, AlertTriangle, Fuel } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    // 管理者認証チェック
    const checkAdminAuth = () => {
      const isAdminLoggedIn = localStorage.getItem("admin_logged_in");
      const adminUsername = localStorage.getItem("admin_username");
      
      console.log("管理者認証チェック:", { isAdminLoggedIn, adminUsername });
      
      if (!isAdminLoggedIn || adminUsername !== "admin@smartreserve.com") {
        console.log("管理者認証が必要です");
        navigate("/admin-login");
        return;
      }
      
      console.log("管理者認証済み");
      setLoading(false);
    };

    checkAdminAuth();
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">認証確認中...</p>
        </div>
      </div>
    );
  }

  // サンプルデータ
  const dashboardStats = [
    { title: "総予約数", value: "48", icon: Car },
    { title: "今日の予約", value: "42", icon: CheckCircle },
    { title: "未確定予約", value: "8", icon: Wrench },
    { title: "患者数", value: "56", icon: UsersIcon },
  ];

  const alertItems = [
    {
      id: "1",
      title: "田中 太郎",
      description: "次回予約: 2024年8月1日",
      badge: { text: "残り15日", color: "red" as const }
    },
    {
      id: "2", 
      title: "佐藤 花子",
      description: "定期検診: 2024年9月15日",
      badge: { text: "残り30日", color: "orange" as const }
    },
    {
      id: "3",
      title: "山田 次郎",
      description: "治療完了: 2024年10月20日",
      badge: { text: "残り45日", color: "blue" as const }
    }
  ];

  const statsItems = [
    { label: "総予約数", value: "2,340 件" },
    { label: "平均予約時間", value: "45 分" },
    { label: "月間収益", value: "¥486,720" }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* サイドバー */}
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={toggleSidebar} 
      />
      
      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <AdminContentHeader 
          title="SmartReserve" 
          subtitle="管理システムの概要" 
        />
        
        {/* コンテンツエリア */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* タイトル */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
              <p className="text-gray-600 mt-1">SmartReserve管理システムの概要</p>
            </div>

            {/* ダッシュボードカード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardStats.map((stat, index) => (
                <DashboardCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                />
              ))}
            </div>

            {/* 下部カード */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 予約アラート */}
              <AlertCard
                title="予約アラート"
                items={alertItems}
                icon={AlertTriangle}
              />
              
              {/* 今月の統計 */}
              <StatsCard
                title="今月の統計"
                items={statsItems}
                trend={{ value: "+5.2%", isPositive: false }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ページトップへ戻るボタン */}
      <ScrollToTopButton />
    </div>
  );
}
