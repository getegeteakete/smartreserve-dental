import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReminderSettingsManager } from "@/components/admin/ReminderSettingsManager";
import { NotificationHistoryManager } from "@/components/admin/NotificationHistoryManager";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ArrowLeft, Bell, History } from "lucide-react";

export default function NotificationSettings() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 管理者認証チェック
    const checkAdminAuth = () => {
      const isAdminLoggedIn = localStorage.getItem("admin_logged_in");
      const adminUsername = localStorage.getItem("admin_username");
      
      if (!isAdminLoggedIn || adminUsername !== "admin@smartreserve.com") {
        navigate("/admin-login");
        return;
      }
      
      setLoading(false);
    };

    checkAdminAuth();
  }, [navigate]);

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
    <>
      <AdminHeader title="通知設定" />
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="container max-w-6xl mx-auto py-8 px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                管理画面に戻る
              </Button>
              <h1 className="text-2xl font-bold">通知設定</h1>
            </div>
          </div>

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
    </>
  );
}



