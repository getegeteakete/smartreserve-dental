import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminContentHeader } from "@/components/admin/AdminContentHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReminderSettingsManager } from "@/components/admin/ReminderSettingsManager";
import { NotificationHistoryManager } from "@/components/admin/NotificationHistoryManager";
import { ArrowLeft, Bell, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminNotifications = () => {
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    // 管理者認証チェック
    const checkAdminAuth = () => {
      const isAdminLoggedIn = localStorage.getItem("admin_logged_in");
      const adminUsername = localStorage.getItem("admin_username");
      
      if (!isAdminLoggedIn || adminUsername !== "sup@ei-life.co.jp") {
        navigate("/admin-login");
        return;
      }
      
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
          subtitle="通知設定" 
        />
        
        {/* コンテンツエリア */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* ヘッダーセクション */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                管理画面に戻る
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">通知設定</h1>
            </div>

            {/* 通知設定タブ */}
            <Tabs defaultValue="settings" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  リマインダー設定
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  送信履歴
                </TabsTrigger>
              </TabsList>

              <TabsContent value="settings" className="space-y-4 mt-6">
                <ReminderSettingsManager />
              </TabsContent>

              <TabsContent value="history" className="space-y-4 mt-6">
                <NotificationHistoryManager />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* ページトップへ戻るボタン */}
      <ScrollToTopButton />
    </div>
  );
};

export default AdminNotifications;
