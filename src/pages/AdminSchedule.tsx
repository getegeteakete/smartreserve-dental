
import { AdminScheduleHeader } from "@/components/admin/AdminScheduleHeader";
import { AdminScheduleTabs } from "@/components/admin/AdminScheduleTabs";
import { useScheduleManagement } from "@/hooks/useScheduleManagement";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminSchedule = () => {
  const isMobile = useIsMobile();
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

  console.log("AdminSchedule - treatmentLimits:", treatmentLimits);
  console.log("AdminSchedule - treatmentLimits length:", treatmentLimits.length);

  return (
    <div className={`container ${isMobile ? 'max-w-full px-2' : 'max-w-6xl'} mx-auto py-8 px-4`}>
      <AdminScheduleHeader />
      
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
  );
};

export default AdminSchedule;
