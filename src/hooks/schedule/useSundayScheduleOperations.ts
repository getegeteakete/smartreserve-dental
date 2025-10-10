
import { generateTimeSlots } from "@/components/admin/calendar/utils/scheduleUtils";
import { useScheduleUtils } from "./useScheduleUtils";
import { format } from "date-fns";

export const useSundayScheduleOperations = (
  handleScheduleChange: (dayOfWeek: number, timeSlot: { start: string; end: string }, isAvailable: boolean) => Promise<void>,
  fetchSchedules: () => Promise<void>,
  onSpecialScheduleAdd: (selectedDate: Date, selectedTime: string) => Promise<void>,
  onSpecialScheduleDelete: (scheduleId: string) => Promise<void>
) => {
  const { toast, operationInProgress } = useScheduleUtils();

  const handleSundayScheduleSetup = async (clickedDate: Date) => {
    if (operationInProgress.current) {
      console.log("操作が既に進行中です。スキップします。");
      return;
    }

    try {
      operationInProgress.current = true;
      console.log("=== 日曜診療設定開始 ===");
      console.log("対象日付:", format(clickedDate, 'yyyy-MM-dd'));
      
      // 特別営業日として日曜診療の時間帯を設定
      // まず午前の診療時間を設定
      await onSpecialScheduleAdd(clickedDate, "09:00");
      
      // 少し待ってから再取得
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchSchedules();
      
      console.log("=== 日曜診療設定完了 ===");
      
      toast(
        "日曜診療設定完了",
        `${format(clickedDate, 'yyyy年MM月dd日')}を日曜診療日に設定しました。`
      );
      
    } catch (error: any) {
      console.error("日曜診療設定エラー:", error);
      toast(
        "エラー",
        `日曜診療の設定に失敗しました: ${error.message}`,
        "destructive"
      );
    } finally {
      operationInProgress.current = false;
    }
  };

  return {
    handleSundayScheduleSetup,
  };
};
