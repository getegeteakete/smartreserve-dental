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

      const { data, error } = await supabase
        .from("booking_time_schedules")
        .select("*")
        .eq("year", year)
        .eq("month", month)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        console.error("予約受付時間スケジュール取得エラー:", error);
        // エラーでも空配列を返して続行
        return [] as BookingTimeSchedule[];
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

      // 指定された年月の日付範囲を計算
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const { data, error } = await supabase
        .from("special_booking_time_schedules")
        .select("*")
        .gte("specific_date", startDate)
        .lte("specific_date", endDate)
        .order("specific_date", { ascending: true });

      if (error) {
        console.error("特別予約受付時間スケジュール取得エラー:", error);
        // エラーでも空配列を返して続行
        return [] as SpecialBookingTimeSchedule[];
      }

      console.log("特別予約受付時間スケジュール取得成功:", data?.length || 0, "件");
      return (data || []) as SpecialBookingTimeSchedule[];
    },
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  });
};