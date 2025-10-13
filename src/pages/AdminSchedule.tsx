
import { AdminScheduleTabs } from "@/components/admin/AdminScheduleTabs";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminContentHeader } from "@/components/admin/AdminContentHeader";
import { useScheduleManagement } from "@/hooks/useScheduleManagement";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const AdminSchedule = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  console.log("AdminSchedule - treatmentLimits:", treatmentLimits);
  console.log("AdminSchedule - treatmentLimits length:", treatmentLimits.length);

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
          subtitle="スケジュール設定" 
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
              <h1 className="text-3xl font-bold text-gray-900">スケジュール設定</h1>
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
