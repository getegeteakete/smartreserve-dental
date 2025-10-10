
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScheduleData } from "@/types/schedule";

export const useBasicScheduleOperations = (
  selectedYear: number,
  selectedMonth: number,
  schedules: ScheduleData[],
  fetchSchedules: () => Promise<void>
) => {
  const { toast } = useToast();

  const handleScheduleChange = async (
    dayOfWeek: number,
    timeSlot: { start: string; end: string },
    isAvailable: boolean
  ) => {
    try {
      console.log("スケジュール変更開始:", { dayOfWeek, timeSlot, isAvailable });
      
      // 既存のスケジュールを検索
      const existingSchedule = schedules.find(
        (s) =>
          s.day_of_week === dayOfWeek &&
          s.start_time === `${timeSlot.start}:00` &&
          s.end_time === `${timeSlot.end}:00` &&
          s.year === selectedYear &&
          s.month === selectedMonth
      );

      if (existingSchedule) {
        // 既存のスケジュールを更新
        console.log("既存スケジュール更新:", existingSchedule.id);
        const { error } = await (supabase as any).rpc('update_clinic_schedule', {
          p_id: existingSchedule.id,
          p_is_available: isAvailable
        });

        if (error) {
          console.error("スケジュール更新エラー:", error);
          throw error;
        }
        console.log("スケジュール更新成功");
      } else {
        // 新しいスケジュールを作成
        console.log("新規スケジュール作成");
        const { error } = await (supabase as any).rpc('insert_clinic_schedule', {
          p_year: selectedYear,
          p_month: selectedMonth,
          p_day_of_week: dayOfWeek,
          p_start_time: `${timeSlot.start}:00`,
          p_end_time: `${timeSlot.end}:00`,
          p_is_available: isAvailable
        });

        if (error) {
          console.error("スケジュール作成エラー:", error);
          throw error;
        }
        console.log("スケジュール作成成功");
      }

      console.log("データベース操作完了、fetchSchedules実行");
      await fetchSchedules();
      
    } catch (error: any) {
      console.error("スケジュール変更エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: `スケジュールの変更に失敗しました: ${error.message}`,
      });
      throw error;
    }
  };

  return {
    handleScheduleChange,
  };
};
