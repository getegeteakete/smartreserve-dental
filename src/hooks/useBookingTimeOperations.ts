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

      const { data, error } = await supabase.rpc("insert_booking_time_schedule", {
        p_year: year,
        p_month: month,
        p_day_of_week: dayOfWeek,
        p_start_time: startTime,
        p_end_time: endTime,
        p_is_available: isAvailable,
      });

      if (error) {
        console.error("予約受付時間スケジュール作成エラー:", error);
        throw error;
      }

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

      const { data, error } = await supabase.rpc("update_booking_time_schedule", {
        p_id: scheduleId,
        p_start_time: startTime,
        p_end_time: endTime,
        p_is_available: isAvailable,
      });

      if (error) {
        console.error("予約受付時間スケジュール更新エラー:", error);
        throw error;
      }

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

      const { data, error } = await supabase.rpc("insert_special_booking_time_schedule", {
        p_specific_date: specificDate,
        p_start_time: startTime,
        p_end_time: endTime,
        p_is_available: isAvailable,
      });

      if (error) {
        console.error("特別予約受付時間スケジュール作成エラー:", error);
        throw error;
      }

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

      const { data, error } = await supabase.rpc("update_special_booking_time_schedule", {
        p_id: scheduleId,
        p_start_time: startTime,
        p_end_time: endTime,
        p_is_available: isAvailable,
      });

      if (error) {
        console.error("特別予約受付時間スケジュール更新エラー:", error);
        throw error;
      }

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

      const { data, error } = await supabase.rpc("delete_special_booking_time_schedule", {
        p_id: scheduleId,
      });

      if (error) {
        console.error("特別予約受付時間スケジュール削除エラー:", error);
        throw error;
      }

      return data;
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

  return {
    insertBookingTimeSchedule,
    updateBookingTimeSchedule,
    insertSpecialBookingTimeSchedule,
    updateSpecialBookingTimeSchedule,
    deleteSpecialBookingTimeSchedule,
  };
};