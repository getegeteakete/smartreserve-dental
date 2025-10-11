
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentList } from "@/components/admin/AppointmentList";
import { ReservationCalendar } from "@/components/admin/ReservationCalendar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Calendar, Users, BarChart3, UserCheck, BookOpen, Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Admin() {
  const [loading, setLoading] = useState(true);
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

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("admin_username");
    navigate("/admin-login");
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
    <>
      <AdminHeader title="管理画面" />
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className={`${isMobile ? 'space-y-4' : 'flex justify-between items-center'} mb-6`}>
          <div className={`${isMobile ? 'space-y-2' : 'flex items-center gap-4'}`}>
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>管理画面</h1>
            <div className={`${isMobile ? 'grid grid-cols-2 gap-2' : 'flex gap-2'}`}>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/guide")}
                className="flex items-center gap-2"
                size={isMobile ? "sm" : "default"}
              >
                <BookOpen className="h-4 w-4" />
                {isMobile ? '使い方ガイド' : '使い方ガイド'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/schedule")}
                className="flex items-center gap-2"
                size={isMobile ? "sm" : "default"}
              >
                <Calendar className="h-4 w-4" />
                {isMobile ? 'スケジュール' : 'スケジュール設定'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/treatments")}
                className="flex items-center gap-2"
                size={isMobile ? "sm" : "default"}
              >
                <Users className="h-4 w-4" />
                {isMobile ? '診療管理' : '診療メニュー管理'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/patients")}
                className="flex items-center gap-2"
                size={isMobile ? "sm" : "default"}
              >
                <UserCheck className="h-4 w-4" />
                {isMobile ? '患者管理' : '患者詳細情報管理'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/notifications")}
                className="flex items-center gap-2"
                size={isMobile ? "sm" : "default"}
              >
                <Bell className="h-4 w-4" />
                {isMobile ? '通知設定' : '通知・リマインダー設定'}
              </Button>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} size={isMobile ? "sm" : "default"}>
            ログアウト
          </Button>
        </div>

        <Tabs defaultValue="reservations" className="w-full">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-1 h-auto' : 'grid-cols-3'}`}>
            <TabsTrigger value="reservations" className={`flex items-center gap-2 ${isMobile ? 'text-sm p-3' : ''}`}>
              <BarChart3 className="h-4 w-4" />
              予約状況
            </TabsTrigger>
            {isMobile && (
              <div className="grid grid-cols-2 gap-1 mt-1">
                <TabsTrigger value="management" className="flex items-center gap-2 text-sm p-2">
                  <Users className="h-4 w-4" />
                  予約管理
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-2 text-sm p-2">
                  <Calendar className="h-4 w-4" />
                  スケジュール
                </TabsTrigger>
              </div>
            )}
            {!isMobile && (
              <>
                <TabsTrigger value="management" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  予約管理
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  スケジュール設定
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="reservations" className="space-y-4">
            <ReservationCalendar />
          </TabsContent>

          <TabsContent value="management" className="space-y-4">
            <AppointmentList />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                スケジュール設定は専用ページで行えます。
              </p>
              <Button onClick={() => navigate("/admin/schedule")} size={isMobile ? "sm" : "default"}>
                スケジュール設定ページへ
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}
