
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useScheduleData } from "./useScheduleData";
import { useScheduleOperations } from "./useScheduleOperations";
import { useSpecialScheduleOperations } from "./useSpecialScheduleOperations";
import { useTreatmentLimitOperations } from "./useTreatmentLimitOperations";

export const useScheduleManagement = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const navigate = useNavigate();

  // 管理者認証チェック
  const isAdminLoggedIn = localStorage.getItem("admin_logged_in");
  if (!isAdminLoggedIn) {
    navigate("/admin-login");
  }

  const {
    schedules,
    setSchedules,
    specialSchedules,
    treatmentLimits,
    setTreatmentLimits,
    loading,
    fetchSchedules,
    fetchSpecialSchedules,
  } = useScheduleData(selectedYear, selectedMonth);

  const { handleScheduleChange, handleSundayScheduleSetup, handleSpecialScheduleAdd } = useScheduleOperations(
    selectedYear,
    selectedMonth,
    schedules,
    setSchedules,
    fetchSchedules
  );

  const { handleSpecialScheduleToggle, handleSpecialScheduleDelete } = useSpecialScheduleOperations();
  const { handleTreatmentLimitUpdate, handleTreatmentLimitDelete } = useTreatmentLimitOperations();

  const handleYearMonthChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  // 特別スケジュール操作時にデータ再取得
  const handleSpecialScheduleAddWithRefresh = async (selectedDate: Date, selectedTime: string) => {
    await handleSpecialScheduleAdd(selectedDate, selectedTime);
    await fetchSpecialSchedules();
  };

  const handleSpecialScheduleToggleWithRefresh = async (scheduleId: string, isAvailable: boolean) => {
    await handleSpecialScheduleToggle(scheduleId, isAvailable);
    await fetchSpecialSchedules();
  };

  const handleSpecialScheduleDeleteWithRefresh = async (scheduleId: string) => {
    await handleSpecialScheduleDelete(scheduleId);
    await fetchSpecialSchedules();
  };

  return {
    loading,
    selectedYear,
    selectedMonth,
    schedules,
    specialSchedules,
    treatmentLimits,
    setTreatmentLimits,
    handleScheduleChange,
    handleSundayScheduleSetup,
    handleSpecialScheduleAdd: handleSpecialScheduleAddWithRefresh,
    handleSpecialScheduleToggle: handleSpecialScheduleToggleWithRefresh,
    handleSpecialScheduleDelete: handleSpecialScheduleDeleteWithRefresh,
    handleTreatmentLimitUpdate,
    handleTreatmentLimitDelete,
    handleYearMonthChange
  };
};
