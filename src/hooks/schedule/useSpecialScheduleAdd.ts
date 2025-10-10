
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useScheduleUtils } from "./useScheduleUtils";

export const useSpecialScheduleAdd = () => {
  const { toast, timeSlots, operationInProgress } = useScheduleUtils();

  const handleSpecialScheduleAdd = async (selectedDate: Date, selectedTime: string) => {
    if (operationInProgress.current) {
      console.log("操作が既に進行中です。スキップします。");
      return;
    }

    try {
      operationInProgress.current = true;
      
      // 特別診療日の場合は、適切な診療時間範囲を設定
      let startTime = selectedTime;
      let endTime = selectedTime;
      
      // 開始時間に基づいて適切な診療時間範囲を決定
      if (selectedTime === "10:00") {
        // 平日の通常診療時間: 10:00-19:00
        startTime = "10:00";
        endTime = "19:00";
      } else if (selectedTime === "09:00") {
        // 土曜日・日曜日の診療時間: 9:00-17:30
        startTime = "09:00";
        endTime = "17:30";
      } else {
        // その他の場合は元のロジックを使用
        const timeSlot = timeSlots.find(slot => slot.start === selectedTime);
        if (!timeSlot) {
          toast(
            "エラー",
            "有効な時間を選択してください",
            "destructive"
          );
          return;
        }
        startTime = timeSlot.start;
        endTime = timeSlot.end;
      }

      const { error } = await (supabase as any).rpc('insert_special_clinic_schedule', {
        p_specific_date: format(selectedDate, 'yyyy-MM-dd'),
        p_start_time: startTime,
        p_end_time: endTime,
        p_is_available: true
      });

      if (error) throw error;

      toast(
        "追加完了",
        "特別診療日が追加されました"
      );
    } catch (error: any) {
      console.error("特別診療日追加エラー:", error);
      toast(
        "エラー",
        `特別診療日の追加に失敗しました: ${error.message}`,
        "destructive"
      );
    } finally {
      operationInProgress.current = false;
    }
  };

  return {
    handleSpecialScheduleAdd,
  };
};
