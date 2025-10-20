
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminContentHeader } from "@/components/admin/AdminContentHeader";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { AlertCard } from "@/components/admin/AlertCard";
import { StatsCard } from "@/components/admin/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, CheckCircle, Wrench, Users as UsersIcon, AlertTriangle, Fuel, Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { useAppointmentManagement } from "@/hooks/useAppointmentManagement";
import { format, isToday, addDays } from "date-fns";
import { ja } from "date-fns/locale";

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { appointments, fetchAppointments } = useAppointmentManagement();

  useEffect(() => {
    // 管理者認証チェック
    const checkAdminAuth = () => {
      const isAdminLoggedIn = localStorage.getItem("admin_logged_in");
      const adminUsername = localStorage.getItem("admin_username");
      
      console.log("管理者認証チェック:", { isAdminLoggedIn, adminUsername });
      
      if (isAdminLoggedIn !== "true" || adminUsername !== "sup@ei-life.co.jp") {
        console.log("管理者認証が必要です");
        navigate("/admin-login");
        return;
      }
      
      console.log("管理者認証済み");
      setLoading(false);
    };

    checkAdminAuth();
  }, [navigate]);

  // 予約データを取得
  useEffect(() => {
    if (!loading) {
      fetchAppointments();
    }
  }, [loading, fetchAppointments]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // 本日の予約を取得
  const getTodayAppointments = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return appointments.filter(apt => {
      const appointmentDate = apt.confirmed_date || apt.appointment_date?.split('T')[0];
      return appointmentDate === today && apt.status !== 'cancelled';
    });
  };

  // 明日の予約を取得
  const getTomorrowAppointments = () => {
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    return appointments.filter(apt => {
      const appointmentDate = apt.confirmed_date || apt.appointment_date?.split('T')[0];
      return appointmentDate === tomorrow && apt.status !== 'cancelled';
    });
  };

  // 承認待ちの予約を取得
  const getPendingAppointments = () => {
    return appointments.filter(apt => apt.status === 'pending');
  };

  // 本日の予約一覧を取得（詳細表示用）
  const todayAppointments = getTodayAppointments();
  const tomorrowAppointments = getTomorrowAppointments();
  const pendingAppointments = getPendingAppointments();

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

  // 実際のデータを使用したダッシュボード統計
  const dashboardStats = [
    { title: "総予約数", value: appointments.length.toString(), icon: Car },
    { title: "今日の予約", value: todayAppointments.length.toString(), icon: CheckCircle },
    { title: "明日の予約", value: tomorrowAppointments.length.toString(), icon: Calendar },
    { title: "承認待ち", value: pendingAppointments.length.toString(), icon: Wrench },
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

            {/* 本日と明日の予約詳細 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 本日のご予約 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    本日のご予約 ({todayAppointments.length}件)
                  </CardTitle>
                  <CardDescription>
                    {format(new Date(), 'yyyy年MM月dd日 (EEEE)', { locale: ja })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {todayAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>本日の予約はありません</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {todayAppointments.map((appointment) => (
                        <div key={appointment.id} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{appointment.patient_name}</p>
                              <p className="text-sm text-gray-600">{appointment.treatment_name}</p>
                              <p className="text-sm text-gray-500">
                                {appointment.confirmed_time_slot || '時間未定'}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                appointment.status === 'confirmed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {appointment.status === 'confirmed' ? '確定' : '承認待ち'}
                              </span>
                              {appointment.fee > 0 && (
                                <p className="text-sm text-gray-600 mt-1">¥{appointment.fee.toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 明日のご予約 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    明日のご予約 ({tomorrowAppointments.length}件)
                  </CardTitle>
                  <CardDescription>
                    {format(addDays(new Date(), 1), 'yyyy年MM月dd日 (EEEE)', { locale: ja })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tomorrowAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>明日の予約はありません</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {tomorrowAppointments.map((appointment) => (
                        <div key={appointment.id} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{appointment.patient_name}</p>
                              <p className="text-sm text-gray-600">{appointment.treatment_name}</p>
                              <p className="text-sm text-gray-500">
                                {appointment.confirmed_time_slot || '時間未定'}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                appointment.status === 'confirmed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {appointment.status === 'confirmed' ? '確定' : '承認待ち'}
                              </span>
                              {appointment.fee > 0 && (
                                <p className="text-sm text-gray-600 mt-1">¥{appointment.fee.toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
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
