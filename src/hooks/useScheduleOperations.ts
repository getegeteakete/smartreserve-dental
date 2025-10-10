
import { ScheduleData } from "@/types/schedule";
import { useBasicScheduleOperations } from "./schedule/useBasicScheduleOperations";
import { useSundayScheduleOperations } from "./schedule/useSundayScheduleOperations";
import { useSpecialScheduleAdd } from "./schedule/useSpecialScheduleAdd";

export const useScheduleOperations = (
  selectedYear: number,
  selectedMonth: number,
  schedules: ScheduleData[],
  setSchedules: React.Dispatch<React.SetStateAction<ScheduleData[]>>,
  fetchSchedules: () => Promise<void>
) => {
  const { handleScheduleChange } = useBasicScheduleOperations(
    selectedYear,
    selectedMonth,
    schedules,
    fetchSchedules
  );

  const { handleSpecialScheduleAdd } = useSpecialScheduleAdd();

  const { handleSundayScheduleSetup } = useSundayScheduleOperations(
    handleScheduleChange,
    fetchSchedules,
    handleSpecialScheduleAdd,
    (scheduleId: string) => Promise.resolve()
  );

  return {
    handleScheduleChange,
    handleSundayScheduleSetup,
    handleSpecialScheduleAdd,
  };
};
