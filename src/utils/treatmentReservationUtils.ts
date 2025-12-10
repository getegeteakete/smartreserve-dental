
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
    console.log("確定済み予約重複チェック開始:", {
      email,
      date,
      timeSlot,
      excludeAppointmentId
    });

    const { data: canConfirm, error } = await supabase.rpc('check_confirmed_time_conflict', {
      p_email: email,
      p_date: date,
      p_time_slot: timeSlot,
      p_exclude_appointment_id: excludeAppointmentId || null
    });

    if (error) {
      console.error("確定済み予約重複チェックエラー:", error);
      console.error("エラー詳細:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { 
        canConfirm: false, 
        error: `予約重複チェック中にエラーが発生しました: ${error.message || '不明なエラー'}` 
      };
    }

    // dataがnullやundefinedの場合の処理
    if (canConfirm === null || canConfirm === undefined) {
      console.warn("確定済み予約重複チェック: 結果がnull/undefinedです。デフォルトでfalseを返します。");
      return { canConfirm: false, error: "予約重複チェックの結果が取得できませんでした" };
    }

    console.log("確定済み予約重複チェック結果:", { canConfirm, data型: typeof canConfirm });
    return { canConfirm: Boolean(canConfirm) };
  } catch (error: any) {
    console.error("確定済み予約重複チェック処理エラー:", error);
    console.error("エラー詳細:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    return { 
      canConfirm: false, 
      error: `予約重複チェック処理中にエラーが発生しました: ${error?.message || '不明なエラー'}` 
    };
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

    // 確定済み予約のみをチェック（pending予約は希望日時であり確定ではないため除外）
    const { data: confirmedAppointments, error: confirmedError } = await supabase
      .from('appointments')
      .select('id, treatment_name, status')
      .eq('confirmed_date', date)
      .eq('confirmed_time_slot', timeSlot)
      .eq('treatment_name', treatmentName)
      .in('status', ['confirmed']); // pendingを除外して、確定済み予約のみカウント

    if (confirmedError) {
      console.error("確定済み予約数取得エラー:", confirmedError);
      return { 
        canReserve: false, 
        currentCount: 0, 
        maxCapacity, 
        error: "予約数の確認中にエラーが発生しました" 
      };
    }

    // 同一時間枠での希望日時は参考程度にカウント（確定ではないため厳格にチェックしない）
    // 注: 希望日時は複数の候補の1つであり、実際にその時間に予約されるとは限らない
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

    // 同じ診療内容の希望日時数をカウント（参考値）
    const matchingPreferences = pendingPreferences?.filter(pref => 
      pref.appointments?.treatment_name === treatmentName &&
      pref.appointments?.status === 'pending'
    ) || [];
    
    console.log("📊 時間枠チェック詳細:", {
      date,
      timeSlot,
      treatmentName,
      confirmedCount: confirmedAppointments?.length || 0,
      pendingPreferencesCount: matchingPreferences.length
    });

    // 除外する予約IDがある場合はフィルタリング
    let confirmedCount = confirmedAppointments.length;
    let preferenceCount = matchingPreferences.length;
    
    if (excludeAppointmentId) {
      confirmedCount = confirmedAppointments.filter(apt => apt.id !== excludeAppointmentId).length;
      preferenceCount = matchingPreferences.filter(pref => 
        pref.appointments?.id !== excludeAppointmentId
      ).length;
    }

    // 新規予約の場合は、確定済み予約のみをカウント
    // 希望日時は参考値としてログに出力するが、容量チェックには含めない
    // （希望日時は複数の候補の1つで、実際にその時間に確定するとは限らないため）
    const totalCount = confirmedCount;

    console.log("✅ 時間枠容量チェック結果:", { 
      confirmedCount,
      preferenceCount: `${preferenceCount}（参考値、カウントに含めない）`,
      totalCount,
      maxCapacity, 
      canReserve: totalCount < maxCapacity,
      treatmentName,
      判定: totalCount < maxCapacity ? "予約可能" : "満員"
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
