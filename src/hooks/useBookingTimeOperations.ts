import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useBookingTimeOperations = (year: number, month: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["bookingTimeSchedules"] });
    queryClient.invalidateQueries({ queryKey: ["specialBookingTimeSchedules"] });
    queryClient.invalidateQueries({ queryKey: ["timeSlots"] }); // 予約時間枠も更新
  };

  // 通常予約受付時間の追加/更新
  const insertBookingTimeSchedule = useMutation({
    mutationFn: async ({
      dayOfWeek,
      startTime,
      endTime,
      isAvailable
    }: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }) => {
      console.log("予約受付時間スケジュール作成:", { year, month, dayOfWeek, startTime, endTime, isAvailable });

      // RPC関数が存在しない場合は直接テーブルに挿入
      const { data, error } = await supabase
        .from("booking_time_schedules")
        .insert({
          year,
          month,
          day_of_week: dayOfWeek,
          start_time: startTime + ":00",
          end_time: endTime + ":00",
          is_available: isAvailable,
        })
        .select()
        .single();

      if (error) {
        console.error("予約受付時間スケジュール作成エラー:", error);
        throw error;
      }

      console.log("予約受付時間スケジュール作成成功:", data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "予約受付時間設定完了",
        description: "予約受付時間スケジュールが正常に設定されました。",
      });
      invalidateQueries();
    },
    onError: (error) => {
      console.error("予約受付時間スケジュール作成失敗:", error);
      toast({
        variant: "destructive",
        title: "予約受付時間設定エラー",
        description: "予約受付時間スケジュールの設定に失敗しました。",
      });
    },
  });

  // 通常予約受付時間の更新
  const updateBookingTimeSchedule = useMutation({
    mutationFn: async ({
      scheduleId,
      startTime,
      endTime,
      isAvailable
    }: {
      scheduleId: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }) => {
      console.log("予約受付時間スケジュール更新:", { scheduleId, startTime, endTime, isAvailable });

      const { data, error } = await supabase
        .from("booking_time_schedules")
        .update({
          start_time: startTime + ":00",
          end_time: endTime + ":00",
          is_available: isAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq("id", scheduleId)
        .select()
        .single();

      if (error) {
        console.error("予約受付時間スケジュール更新エラー:", error);
        throw error;
      }

      console.log("予約受付時間スケジュール更新成功:", data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "予約受付時間更新完了",
        description: "予約受付時間スケジュールが正常に更新されました。",
      });
      invalidateQueries();
    },
    onError: (error) => {
      console.error("予約受付時間スケジュール更新失敗:", error);
      toast({
        variant: "destructive",
        title: "予約受付時間更新エラー",
        description: "予約受付時間スケジュールの更新に失敗しました。",
      });
    },
  });

  // 特別予約受付時間の追加
  const insertSpecialBookingTimeSchedule = useMutation({
    mutationFn: async ({
      specificDate,
      startTime,
      endTime,
      isAvailable
    }: {
      specificDate: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }) => {
      console.log("特別予約受付時間スケジュール作成:", { specificDate, startTime, endTime, isAvailable });

      const { data, error } = await supabase
        .from("special_booking_time_schedules")
        .insert({
          specific_date: specificDate,
          start_time: startTime + ":00",
          end_time: endTime + ":00",
          is_available: isAvailable,
        })
        .select()
        .single();

      if (error) {
        console.error("特別予約受付時間スケジュール作成エラー:", error);
        throw error;
      }

      console.log("特別予約受付時間スケジュール作成成功:", data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "特別予約受付時間設定完了",
        description: "特別予約受付時間スケジュールが正常に設定されました。",
      });
      invalidateQueries();
    },
    onError: (error) => {
      console.error("特別予約受付時間スケジュール作成失敗:", error);
      toast({
        variant: "destructive",
        title: "特別予約受付時間設定エラー",
        description: "特別予約受付時間スケジュールの設定に失敗しました。",
      });
    },
  });

  // 特別予約受付時間の更新
  const updateSpecialBookingTimeSchedule = useMutation({
    mutationFn: async ({
      scheduleId,
      startTime,
      endTime,
      isAvailable
    }: {
      scheduleId: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }) => {
      console.log("特別予約受付時間スケジュール更新:", { scheduleId, startTime, endTime, isAvailable });

      const { data, error } = await supabase
        .from("special_booking_time_schedules")
        .update({
          start_time: startTime + ":00",
          end_time: endTime + ":00",
          is_available: isAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq("id", scheduleId)
        .select()
        .single();

      if (error) {
        console.error("特別予約受付時間スケジュール更新エラー:", error);
        throw error;
      }

      console.log("特別予約受付時間スケジュール更新成功:", data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "特別予約受付時間更新完了",
        description: "特別予約受付時間スケジュールが正常に更新されました。",
      });
      invalidateQueries();
    },
    onError: (error) => {
      console.error("特別予約受付時間スケジュール更新失敗:", error);
      toast({
        variant: "destructive",
        title: "特別予約受付時間更新エラー",
        description: "特別予約受付時間スケジュールの更新に失敗しました。",
      });
    },
  });

  // 特別予約受付時間の削除
  const deleteSpecialBookingTimeSchedule = useMutation({
    mutationFn: async (scheduleId: string) => {
      console.log("特別予約受付時間スケジュール削除:", { scheduleId });

      const { error } = await supabase
        .from("special_booking_time_schedules")
        .delete()
        .eq("id", scheduleId);

      if (error) {
        console.error("特別予約受付時間スケジュール削除エラー:", error);
        throw error;
      }

      console.log("特別予約受付時間スケジュール削除成功");
      return true;
    },
    onSuccess: () => {
      toast({
        title: "特別予約受付時間削除完了",
        description: "特別予約受付時間スケジュールが正常に削除されました。",
      });
      invalidateQueries();
    },
    onError: (error) => {
      console.error("特別予約受付時間スケジュール削除失敗:", error);
      toast({
        variant: "destructive",
        title: "特別予約受付時間削除エラー",
        description: "特別予約受付時間スケジュールの削除に失敗しました。",
      });
    },
  });

  // 通常予約受付時間の削除
  const deleteBookingTimeSchedule = useMutation({
    mutationFn: async (scheduleId: string) => {
      console.log("予約受付時間スケジュール削除:", { scheduleId });

      const { error } = await supabase
        .from("booking_time_schedules")
        .delete()
        .eq("id", scheduleId);

      if (error) {
        console.error("予約受付時間スケジュール削除エラー:", error);
        throw error;
      }

      console.log("予約受付時間スケジュール削除成功");
      return true;
    },
    onSuccess: () => {
      toast({
        title: "予約受付時間削除完了",
        description: "予約受付時間スケジュールが正常に削除されました。",
      });
      invalidateQueries();
    },
    onError: (error) => {
      console.error("予約受付時間スケジュール削除失敗:", error);
      toast({
        variant: "destructive",
        title: "予約受付時間削除エラー",
        description: "予約受付時間スケジュールの削除に失敗しました。",
      });
    },
  });

  return {
    insertBookingTimeSchedule,
    updateBookingTimeSchedule,
    deleteBookingTimeSchedule,
    insertSpecialBookingTimeSchedule,
    updateSpecialBookingTimeSchedule,
    deleteSpecialBookingTimeSchedule,
  };
};