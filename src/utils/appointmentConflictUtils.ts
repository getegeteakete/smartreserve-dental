
import { supabase } from "@/integrations/supabase/client";

export const checkAppointmentTimeConflict = async (
  email: string,
  confirmedDate: string, // バグ修正: Date型ではなくstring型であることを明確化
  confirmedTimeSlot: string,
  excludeAppointmentId?: string
): Promise<{ canConfirm: boolean; error?: string }> => {
  try {
    console.log("🔍 予約重複チェック実行:", { email, confirmedDate, confirmedTimeSlot, excludeAppointmentId });
    
    // デバッグ: 実際の予約データを確認
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('id, email, confirmed_date, confirmed_time_slot, status, treatment_name')
      .eq('email', email)
      .in('status', ['pending', 'confirmed']);
    
    console.log("📊 既存の予約一覧:", existingAppointments);
    
    const { data: canConfirm, error } = await supabase.rpc('check_appointment_time_conflict', {
      p_email: email,
      p_confirmed_date: confirmedDate,
      p_confirmed_time_slot: confirmedTimeSlot,
      p_exclude_appointment_id: excludeAppointmentId || null
    });

    if (error) {
      console.error("❌ 予約重複チェックエラー:", error);
      return { canConfirm: false, error: "予約重複チェック中にエラーが発生しました" };
    }

    console.log("✅ 予約重複チェック結果:", { canConfirm, data型: typeof canConfirm });
    
    // データベース関数がtrueを返した場合、予約可能（重複なし）
    if (canConfirm === true) {
      console.log("✨ 重複なし: 予約可能です");
      return { canConfirm: true };
    } else {
      console.log("⚠️ 重複あり: 予約できません");
      return { canConfirm: false };
    }
  } catch (error) {
    console.error("❌ 予約重複チェック処理エラー:", error);
    return { canConfirm: false, error: "予約重複チェック処理中にエラーが発生しました" };
  }
};
