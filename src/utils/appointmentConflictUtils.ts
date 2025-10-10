
import { supabase } from "@/integrations/supabase/client";

export const checkAppointmentTimeConflict = async (
  email: string,
  confirmedDate: string, // バグ修正: Date型ではなくstring型であることを明確化
  confirmedTimeSlot: string,
  excludeAppointmentId?: string
): Promise<{ canConfirm: boolean; error?: string }> => {
  try {
    console.log("予約重複チェック実行:", { email, confirmedDate, confirmedTimeSlot });
    
    const { data: canConfirm, error } = await supabase.rpc('check_appointment_time_conflict', {
      p_email: email,
      p_confirmed_date: confirmedDate,
      p_confirmed_time_slot: confirmedTimeSlot,
      p_exclude_appointment_id: excludeAppointmentId || null
    });

    if (error) {
      console.error("予約重複チェックエラー:", error);
      return { canConfirm: false, error: "予約重複チェック中にエラーが発生しました" };
    }

    console.log("予約重複チェック結果:", { canConfirm });
    return { canConfirm };
  } catch (error) {
    console.error("予約重複チェック処理エラー:", error);
    return { canConfirm: false, error: "予約重複チェック処理中にエラーが発生しました" };
  }
};
