
import { supabase } from "@/integrations/supabase/client";

export const checkTreatmentReservationLimit = async (
  email: string,
  treatmentName: string
): Promise<{ canReserve: boolean; error?: string }> => {
  try {
    const { data: canReserve, error } = await supabase.rpc('check_treatment_reservation_limit', {
      p_email: email,
      p_treatment_name: treatmentName
    });

    if (error) {
      console.error("診療内容別予約制限チェックエラー:", error);
      return { canReserve: false, error: "予約制限チェック中にエラーが発生しました" };
    }

    return { canReserve };
  } catch (error) {
    console.error("診療内容別予約制限チェック処理エラー:", error);
    return { canReserve: false, error: "予約制限チェック処理中にエラーが発生しました" };
  }
};

export const checkConfirmedTimeConflict = async (
  email: string,
  date: string,
  timeSlot: string,
  excludeAppointmentId?: string
): Promise<{ canConfirm: boolean; error?: string }> => {
  try {
    const { data: canConfirm, error } = await supabase.rpc('check_confirmed_time_conflict', {
      p_email: email,
      p_date: date,
      p_time_slot: timeSlot,
      p_exclude_appointment_id: excludeAppointmentId || null
    });

    if (error) {
      console.error("確定済み予約重複チェックエラー:", error);
      return { canConfirm: false, error: "予約重複チェック中にエラーが発生しました" };
    }

    return { canConfirm };
  } catch (error) {
    console.error("確定済み予約重複チェック処理エラー:", error);
    return { canConfirm: false, error: "予約重複チェック処理中にエラーが発生しました" };
  }
};

// 強化版：時間枠での診療内容別予約数チェック
export const checkTimeSlotCapacity = async (
  treatmentName: string,  
  date: string,
  timeSlot: string,
  excludeAppointmentId?: string
): Promise<{ canReserve: boolean; currentCount: number; maxCapacity: number; error?: string }> => {
  try {
    console.log("時間枠容量チェック開始:", { treatmentName, date, timeSlot });

    // 診療内容別の最大収容人数を決定（強化版）
    let maxCapacity = 99; // デフォルトは制限なし
    
    // より正確な診療内容判定
    const normalizedTreatmentName = treatmentName.toLowerCase();
    
    if (normalizedTreatmentName.includes('初診') || 
        normalizedTreatmentName.includes('精密検査') ||
        normalizedTreatmentName.includes('カウンセリング')) {
      maxCapacity = 1; // 初診・精密検査・カウンセリングは1件まで
    } else if (normalizedTreatmentName.includes('ホワイトニング') || 
               normalizedTreatmentName.includes('pmtc') ||
               normalizedTreatmentName.includes('クリーニング')) {
      maxCapacity = 4; // ホワイトニング・PMTCは4件まで
    }

    // 確定済み予約と承認待ち予約の両方をチェック
    const { data: confirmedAppointments, error: confirmedError } = await supabase
      .from('appointments')
      .select('id, treatment_name, status')
      .eq('confirmed_date', date)
      .eq('confirmed_time_slot', timeSlot)
      .eq('treatment_name', treatmentName)
      .in('status', ['confirmed', 'pending']);

    if (confirmedError) {
      console.error("確定済み予約数取得エラー:", confirmedError);
      return { 
        canReserve: false, 
        currentCount: 0, 
        maxCapacity, 
        error: "予約数の確認中にエラーが発生しました" 
      };
    }

    // 同一時間枠での希望日時も考慮（pendingの場合）
    const { data: pendingPreferences, error: preferencesError } = await supabase
      .from('appointment_preferences')
      .select(`
        appointment_id,
        appointments!inner(
          id,
          treatment_name,
          status
        )
      `)
      .eq('preferred_date', date)
      .eq('preferred_time_slot', timeSlot);

    if (preferencesError) {
      console.error("希望日時予約数取得エラー:", preferencesError);
    }

    // 同じ診療内容の希望日時数をカウント
    const matchingPreferences = pendingPreferences?.filter(pref => 
      pref.appointments?.treatment_name === treatmentName &&
      pref.appointments?.status === 'pending'
    ) || [];

    // 除外する予約IDがある場合はフィルタリング
    let confirmedCount = confirmedAppointments.length;
    let preferenceCount = matchingPreferences.length;
    
    if (excludeAppointmentId) {
      confirmedCount = confirmedAppointments.filter(apt => apt.id !== excludeAppointmentId).length;
      preferenceCount = matchingPreferences.filter(pref => 
        pref.appointments?.id !== excludeAppointmentId
      ).length;
    }

    // 総予約数（確定 + 希望日時）
    const totalCount = confirmedCount + preferenceCount;

    console.log("強化版時間枠容量チェック結果:", { 
      confirmedCount,
      preferenceCount,
      totalCount,
      maxCapacity, 
      canReserve: totalCount < maxCapacity,
      treatmentName
    });

    return {
      canReserve: totalCount < maxCapacity,
      currentCount: totalCount,
      maxCapacity
    };
  } catch (error) {
    console.error("時間枠容量チェック処理エラー:", error);
    return { 
      canReserve: false, 
      currentCount: 0, 
      maxCapacity: 1, 
      error: "時間枠容量チェック処理中にエラーが発生しました" 
    };
  }
};
