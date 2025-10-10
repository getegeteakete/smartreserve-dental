
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleData {
  id?: string;
  year: number;
  month: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface GoogleCalendarSyncButtonProps {
  schedules: ScheduleData[];
  selectedYear: number;
  selectedMonth: number;
}

export const GoogleCalendarSyncButton = ({ schedules, selectedYear, selectedMonth }: GoogleCalendarSyncButtonProps) => {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const handleBulkSync = async () => {
    try {
      setSyncing(true);
      
      // 時間スロットを生成
      const timeSlots = [];
      for (let hour = 9; hour < 19; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const endHour = minute === 30 ? hour + 1 : hour;
          const endMinute = minute === 30 ? 0 : 30;
          const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
          timeSlots.push({ start: startTime, end: endTime });
        }
      }

      let successCount = 0;
      let errorCount = 0;

      // 各曜日・時間スロット組み合わせで同期処理を実行
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        for (const timeSlot of timeSlots) {
          try {
            const existingSchedule = schedules.find(
              s => s.day_of_week === dayOfWeek && s.start_time === timeSlot.start
            );

            // デフォルトは利用不可、既存の設定があればその値を使用
            const isAvailable = existingSchedule ? existingSchedule.is_available : false;

            const { error } = await supabase.functions.invoke('sync-business-schedule', {
              body: {
                year: selectedYear,
                month: selectedMonth,
                dayOfWeek,
                timeSlot,
                isAvailable
              }
            });

            if (error) {
              console.error(`同期エラー (${dayOfWeek}, ${timeSlot.start}):`, error);
              errorCount++;
            } else {
              successCount++;
            }

            // 短い間隔を置いてAPI制限を回避
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`同期例外 (${dayOfWeek}, ${timeSlot.start}):`, error);
            errorCount++;
          }
        }
      }

      if (errorCount === 0) {
        toast({
          title: "一括同期完了",
          description: `${successCount}件の設定がGoogleカレンダーに同期されました`,
        });
      } else if (successCount > 0) {
        toast({
          title: "一括同期部分完了",
          description: `${successCount}件が成功、${errorCount}件が失敗しました`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "一括同期失敗",
          description: "Googleカレンダーとの同期に失敗しました",
        });
      }
    } catch (error: any) {
      console.error("一括同期エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: `一括同期に失敗しました: ${error.message}`,
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleBulkSync}
      disabled={syncing}
      variant="outline"
      className="flex items-center gap-2"
    >
      {syncing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Calendar className="h-4 w-4" />
      )}
      {syncing ? "同期中..." : "現在の設定をGoogleカレンダーに同期"}
    </Button>
  );
};
