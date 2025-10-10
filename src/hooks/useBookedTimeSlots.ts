
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BookedTimeSlot {
  confirmed_date: string;
  confirmed_time_slot: string;
  treatment_name: string;
  email: string;
}

export const useBookedTimeSlots = (userEmail?: string) => {
  return useQuery({
    queryKey: ["bookedTimeSlots", userEmail],
    queryFn: async () => {
      console.log("予約済み時間枠を取得中...");
      
      // 確定済み予約を取得
      const { data: confirmedAppointments, error: confirmedError } = await supabase
        .from("appointments")
        .select("confirmed_date, confirmed_time_slot, treatment_name, email")
        .eq("status", "confirmed")
        .not("confirmed_date", "is", null)
        .not("confirmed_time_slot", "is", null);

      if (confirmedError) {
        console.error("確定済み予約取得エラー:", confirmedError);
        throw confirmedError;
      }

      // 承認待ち予約の希望日時も取得
      const { data: pendingAppointments, error: pendingError } = await supabase
        .from("appointments")
        .select(`
          email,
          treatment_name,
          appointment_preferences (
            preferred_date,
            preferred_time_slot
          )
        `)
        .eq("status", "pending");

      if (pendingError) {
        console.error("承認待ち予約取得エラー:", pendingError);
        throw pendingError;
      }

      // 承認待ち予約の希望日時を変換
      const pendingBookedSlots = pendingAppointments.flatMap(appointment => 
        appointment.appointment_preferences?.map(pref => ({
          confirmed_date: pref.preferred_date,
          confirmed_time_slot: pref.preferred_time_slot,
          treatment_name: appointment.treatment_name,
          email: appointment.email
        })) || []
      );

      // 確定済み予約と承認待ち予約を合併
      const allBookedSlots = [
        ...confirmedAppointments.map(apt => ({
          confirmed_date: apt.confirmed_date,
          confirmed_time_slot: apt.confirmed_time_slot,
          treatment_name: apt.treatment_name,
          email: apt.email
        })),
        ...pendingBookedSlots
      ];

      console.log("取得した予約済み時間枠:", allBookedSlots);
      return allBookedSlots as BookedTimeSlot[];
    },
    enabled: true,
    staleTime: 10 * 1000, // 10秒間キャッシュ（より頻繁に更新）
    refetchInterval: 30 * 1000, // 30秒ごとに自動更新
  });
};
