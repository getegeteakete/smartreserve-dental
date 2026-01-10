
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { checkAppointmentTimeConflict } from "@/utils/appointmentConflictUtils";
import { checkTreatmentReservationLimit, checkTimeSlotCapacity } from "@/utils/treatmentReservationUtils";

interface ValidationProps {
  formData: any;
  preferredDates: any[];
  selectedTreatment: string;
  isValid: boolean;
  isFormValid: boolean;
}

export const useBookingValidation = () => {
  const { toast } = useToast();

  const validateBookingForm = ({ formData, preferredDates, selectedTreatment, isValid, isFormValid }: ValidationProps) => {
    if (!isValid || !isFormValid) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "必要な項目をすべて入力してください",
      });
      return false;
    }

    if (!preferredDates || preferredDates.length === 0) {
      throw new Error("希望日時が選択されていません");
    }

    if (!selectedTreatment) {
      throw new Error("診療内容が選択されていません");
    }

    return true;
  };

  const validatePreferredDates = async (preferredDates: any[], formData: any, selectedTreatment: string, selectedTreatmentData?: any) => {
    // 診療内容名を取得（UUIDではなく名前を使用）
    const treatmentName = selectedTreatmentData?.name || selectedTreatment;
    
    // UUIDの場合は警告ログを出力（診療内容名が取得できない場合）
    if (!selectedTreatmentData?.name && selectedTreatment.includes('-')) {
      console.warn("⚠️ 診療内容名が取得できません。UUIDを使用しますが、容量判定が正しく動作しない可能性があります:", selectedTreatment);
    }

    for (const dateSlot of preferredDates) {
      if (!dateSlot || !dateSlot.date || !dateSlot.timeSlot) {
        continue;
      }

      // タイムゾーン変換を避けるため、日付を直接文字列化
      const dateString = dateSlot.date instanceof Date 
        ? `${dateSlot.date.getFullYear()}-${String(dateSlot.date.getMonth() + 1).padStart(2, '0')}-${String(dateSlot.date.getDate()).padStart(2, '0')}`
        : format(dateSlot.date, 'yyyy-MM-dd');
      
      // 時間スロットIDから実際の開始時間を抽出
      const timeSlotParts = dateSlot.timeSlot.split('-');
      let actualTimeSlot = dateSlot.timeSlot;
      
      if (timeSlotParts.length >= 4) {
        actualTimeSlot = timeSlotParts.slice(3).join('-');
      }

      console.log("詳細チェック実行:", { 
        dateString, 
        actualTimeSlot, 
        email: formData.email,
        treatmentId: selectedTreatment,
        treatmentName: treatmentName
      });

      // 個人の重複チェック（新規予約の場合は希望日時のみチェック）
      console.log("🔍 重複チェック開始 - 希望日時:", { dateString, actualTimeSlot });
      
      // 既存の確定済み予約との重複をチェック
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: conflictingAppointments, error: queryError } = await supabase
        .from('appointments')
        .select('id, treatment_name, status, confirmed_date, confirmed_time_slot')
        .eq('email', formData.email)
        .eq('confirmed_date', dateString)
        .eq('confirmed_time_slot', actualTimeSlot)
        .in('status', ['confirmed']); // pendingは除外（まだ確定していないため）
      
      console.log("📋 重複チェック結果:", { 
        conflictingCount: conflictingAppointments?.length || 0,
        conflictingAppointments 
      });
      
      if (queryError) {
        console.error("❌ 重複チェッククエリエラー:", queryError);
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "予約の確認中にエラーが発生しました。もう一度お試しください。",
          duration: 5000,
        });
        return false;
      }
      
      // 確定済み予約との重複がある場合のみエラー
      if (conflictingAppointments && conflictingAppointments.length > 0) {
        console.error("⚠️ 確定済み予約との重複:", conflictingAppointments);
        toast({
          variant: "destructive",
          title: "予約が重複しています",
          description: `選択された日時に既に確定済みのご予約がございます。\n日時: ${dateString} ${actualTimeSlot}\n診療内容: ${conflictingAppointments[0].treatment_name}\n\n別の日時をご選択ください。`,
          duration: 7000,
        });
        return false;
      }
      
      console.log("✅ 重複なし: この日時は予約可能です");

      // 時間枠の容量チェック（診療内容名を使用）
      console.log("🔍 時間枠容量チェック開始:", { treatmentName, dateString, actualTimeSlot });
      const { canReserve: hasCapacity, currentCount, maxCapacity, error: capacityError } = await checkTimeSlotCapacity(
        treatmentName, // UUIDではなく診療内容名を使用
        dateString,
        actualTimeSlot
      );

      if (capacityError || !hasCapacity) {
        console.error("容量チェックエラー:", { capacityError, hasCapacity, currentCount, maxCapacity, treatmentName });
        toast({
          variant: "destructive",
          title: "予約枠が満員です",
          description: `選択された日時は予約枠が満員となっております。\n日時: ${dateString} ${actualTimeSlot}\n診療内容: ${treatmentName}\n現在の予約状況: ${currentCount}/${maxCapacity}名\n\nお手数ですが、別の日時をご選択ください。`,
          duration: 7000,
        });
        return false;
      }

      console.log(`✅ 時間枠容量OK: ${currentCount}/${maxCapacity}名 (診療内容: ${treatmentName})`);
    }

    return true;
  };

  const validateTreatmentLimit = async (email: string, treatmentName: string) => {
    // デバッグ: 既存の予約を確認（過去の予約は除外）
    const { supabase } = await import("@/integrations/supabase/client");
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // 現在日時以降の予約のみをチェック（過去の予約は除外）
    // confirmed_dateがある場合はそれを使い、なければappointment_dateを使う
    const { data: allAppointments, error: checkError } = await supabase
      .from("appointments")
      .select("id, treatment_name, status, appointment_date, confirmed_date, created_at")
      .eq("email", email)
      .eq("treatment_name", treatmentName)
      .in("status", ["pending", "confirmed"]);
    
    // フロントエンド側で過去の予約をフィルタリング
    const existingAppointments = (allAppointments || []).filter(apt => {
      const checkDate = apt.confirmed_date || apt.appointment_date;
      if (!checkDate) return true; // 日付が設定されていない場合は含める（pending予約など）
      return checkDate >= today; // 今日以降の予約のみ
    });
    
    const existingCount = existingAppointments?.length || 0;
    
    console.log("🔍 診療制限チェック - 既存予約（過去を除外）:", {
      email,
      treatmentName,
      existingCount,
      today,
      allAppointmentsCount: allAppointments?.length || 0,
      existingAppointments
    });

    // 初回予約（既存予約が0件）の場合は制限をスキップして許可
    if (existingCount === 0) {
      console.log("✅ 初回予約のため制限チェックをスキップ");
      return true;
    }

    // 過去の予約を除外した制限チェック（カスタム実装）
    // checkTreatmentReservationLimitは過去も含むため、ここでは既存のexistingAppointmentsを使用
    const { data: limitData, error: limitQueryError } = await supabase
      .from("treatment_limits")
      .select("max_reservations_per_slot")
      .eq("treatment_name", treatmentName)
      .single();
    
    const limitCount = limitData?.max_reservations_per_slot || 1;
    const canReserve = existingCount < limitCount;
    const limitError = limitQueryError ? "予約制限の確認中にエラーが発生しました" : null;

    if (limitError || !canReserve) {
      // より詳しいエラーメッセージを表示
      let errorMessage = "この診療内容は既に予約上限に達しています。";
      let suggestions = "";
      
      // 既存予約の情報を追加（未来の予約のみ）
      let existingInfo = "";
      if (existingAppointments && existingAppointments.length > 0) {
        existingInfo = `\n\n【既存の予約（未来の予約のみ）】\n`;
        existingAppointments.forEach((apt, index) => {
          const statusText = apt.status === 'pending' ? '承認待ち' : '確定済み';
          const dateText = apt.confirmed_date 
            ? new Date(apt.confirmed_date).toLocaleDateString('ja-JP')
            : apt.appointment_date 
            ? new Date(apt.appointment_date).toLocaleDateString('ja-JP')
            : '未定';
          existingInfo += `${index + 1}. ${apt.treatment_name} (${statusText}) - ${dateText}\n`;
        });
      }

      // 診療内容別に異なるメッセージを表示
      const normalizedTreatmentName = treatmentName.toLowerCase();
      
      if (normalizedTreatmentName.includes('初診') || normalizedTreatmentName.includes('相談')) {
        errorMessage = "初診・相談のご予約は、お一人様1回までとなっております。";
        suggestions = "既に初診予約がございます。既存の予約を→電話にてキャンセルしてから再度お申し込みください。";
      } else if (normalizedTreatmentName.includes('精密検査')) {
        errorMessage = "精密検査のご予約は、お一人様1回までとなっております。";
        suggestions = "既に精密検査の予約がございます。既存の予約を→電話にてキャンセルしてから再度お申し込みください。";
      } else if (normalizedTreatmentName.includes('pmtc') || normalizedTreatmentName.includes('クリーニング')) {
        errorMessage = "PMTC・クリーニングのご予約は、お一人様2件の予約申し込みまでとなっております。";
        suggestions = "既に2件の予約申し込みがございます。\n\n新しい予約を作成すると、既存の予約申し込み（承認待ち）が自動的にキャンセルされ、新しい内容で置き換えられます。\n\n※ 確定済み(confirmed)の予約は自動キャンセルされません。";
      } else if (normalizedTreatmentName.includes('ホワイトニング')) {
        errorMessage = "ホワイトニングのご予約は、お一人様2件の予約申し込みまでとなっております。";
        suggestions = "既に2件の予約申し込みがございます。\n\n新しい予約を作成すると、既存の予約申し込み（承認待ち）が自動的にキャンセルされ、新しい内容で置き換えられます。\n\n※ 確定済み(confirmed)の予約は自動キャンセルされません。";
      } else {
        suggestions = "新しい予約を作成すると、既存の予約申し込み（承認待ち）が自動的にキャンセルされ、新しい内容で置き換えられます。";
      }

      toast({
        variant: "destructive",
        title: "予約上限に達しています",
        description: `${errorMessage}\n\n${suggestions}${existingInfo}\n\n※ 第1希望・第2希望・第3希望は候補日時であり、予約は1件のみ作成されます`,
        duration: 10000, // 長めに表示
      });
      return false;
    }

    return true;
  };

  return {
    validateBookingForm,
    validatePreferredDates,
    validateTreatmentLimit
  };
};
