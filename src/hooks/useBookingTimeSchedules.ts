import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BookingTimeSchedule {
  id: string;
  year: number;
  month: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpecialBookingTimeSchedule {
  id: string;
  specific_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export const useBookingTimeSchedules = (year: number, month: number) => {
  return useQuery({
    queryKey: ["bookingTimeSchedules", year, month],
    queryFn: async () => {
      console.log("予約受付時間スケジュール取得開始:", { year, month });

      const { data, error } = await supabase.rpc("get_booking_time_schedules", {
        p_year: year,
        p_month: month,
      });

      if (error) {
        console.error("予約受付時間スケジュール取得エラー:", error);
        throw error;
      }

      console.log("予約受付時間スケジュール取得成功:", data?.length || 0, "件");
      return (data || []) as BookingTimeSchedule[];
    },
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  });
};

export const useSpecialBookingTimeSchedules = (year: number, month: number) => {
  return useQuery({
    queryKey: ["specialBookingTimeSchedules", year, month],
    queryFn: async () => {
      console.log("特別予約受付時間スケジュール取得開始:", { year, month });

      const { data, error } = await supabase.rpc("get_special_booking_time_schedules", {
        p_year: year,
        p_month: month,
      });

      if (error) {
        console.error("特別予約受付時間スケジュール取得エラー:", error);
        throw error;
      }

      console.log("特別予約受付時間スケジュール取得成功:", data?.length || 0, "件");
      return (data || []) as SpecialBookingTimeSchedule[];
    },
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  });
};