
import { AdminScheduleTabs } from "@/components/admin/AdminScheduleTabs";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminContentHeader } from "@/components/admin/AdminContentHeader";
import { useScheduleManagement } from "@/hooks/useScheduleManagement";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { checkAdminAuth } from "@/utils/adminAuth";

const AdminSchedule = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 管理者認証チェック
    if (checkAdminAuth(navigate)) {
      setLoading(false);
    }
  }, [navigate]);
  const {
    loading,
    selectedYear,
    selectedMonth,
    schedules,
    specialSchedules,
    treatmentLimits,
    setTreatmentLimits,
    handleScheduleChange,
    handleSpecialScheduleAdd,
    handleSpecialScheduleToggle,
    handleSpecialScheduleDelete,
    handleTreatmentLimitUpdate,
    handleTreatmentLimitDelete,
    handleYearMonthChange
  } = useScheduleManagement();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  console.log("AdminSchedule - treatmentLimits:", treatmentLimits);
  console.log("AdminSchedule - treatmentLimits length:", treatmentLimits.length);

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
      {!isMobile && (
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={toggleSidebar} 
        />
      )}
      {isMobile && (
        <AdminSidebar 
          isCollapsed={false} 
          onToggle={toggleSidebar}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={closeMobileMenu}
        />
      )}
      
      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* ヘッダー */}
        <AdminContentHeader 
          title="SmartReserve" 
          subtitle="スケジュール設定"
          onMenuToggle={toggleMobileMenu}
        />
        
        {/* コンテンツエリア */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* ヘッダーセクション */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2"
                size={isMobile ? "sm" : "default"}
              >
                <ArrowLeft className="h-4 w-4" />
                管理画面に戻る
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">スケジュール設定</h1>
            </div>
            
            <AdminScheduleTabs
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              schedules={schedules}
              specialSchedules={specialSchedules}
              loading={loading}
              onYearMonthChange={handleYearMonthChange}
              onScheduleChange={handleScheduleChange}
              onSpecialScheduleAdd={handleSpecialScheduleAdd}
              onSpecialScheduleToggle={handleSpecialScheduleToggle}
              onSpecialScheduleDelete={handleSpecialScheduleDelete}
            />
          </div>
        </div>
      </div>

      {/* ページトップへ戻るボタン */}
      <ScrollToTopButton />
    </div>
  );
};

export default AdminSchedule;
