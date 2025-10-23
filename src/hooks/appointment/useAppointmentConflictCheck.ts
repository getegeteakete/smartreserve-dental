
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { checkTreatmentReservationLimit } from "@/utils/treatmentReservationUtils";

interface AppointmentData {
  patient_name: string;
  phone: string;
  email: string;
  age: number;
  notes?: string;
  treatment_name: string;
  fee: number;
  reservation_type: string;
  preferredDates: Array<{
    date: string;
    timeSlot: string;
  }>;
}

export const useAppointmentConflictCheck = () => {
  const { toast } = useToast();

  const checkTreatmentLimits = async (email: string, treatmentName: string) => {
    console.log("診療内容別予約制限チェック中...");
    
    // 既存予約を確認
    const { data: existingAppointments } = await supabase
      .from("appointments")
      .select("id")
      .eq("email", email)
      .eq("treatment_name", treatmentName)
      .in("status", ["pending", "confirmed"]);
    
    const existingCount = existingAppointments?.length || 0;
    console.log(`既存予約数: ${existingCount}件`);
    
    // 初回予約（既存予約が0件）の場合は制限をスキップして許可
    if (existingCount === 0) {
      console.log("✅ 初回予約のため制限チェックをスキップ");
      return true;
    }
    
    const { canReserve, error: limitError } = await checkTreatmentReservationLimit(
      email,
      treatmentName
    );

    if (limitError || !canReserve) {
      console.log("診療内容別予約制限に引っかかりました");
      return false;
    }

    console.log("診療内容別予約制限チェック通過");
    return true;
  };

  const checkTimeConflicts = async (data: AppointmentData) => {
    console.log("予約時間重複チェック中...");
    const preferredDatesForCheck = data.preferredDates.map(pd => ({
      date: pd.date,
      timeSlot: pd.timeSlot
    }));

    const { data: hasConflict, error: conflictError } = await supabase.rpc('check_preferred_dates_conflict', {
      p_email: data.email,
      p_preferred_dates: preferredDatesForCheck
    });

    if (conflictError) {
      console.error("予約重複チェックエラー:", conflictError);
      throw new Error("予約重複チェック中にエラーが発生しました");
    }

    if (!hasConflict) {
      console.log("予約時間が重複しています");
      toast({
        variant: "destructive",
        title: "予約重複エラー",
        description: "選択された日時にすでに別の予約が入っています。別の日時をお選びください。",
      });
      return false;
    }

    console.log("予約時間重複チェック通過");
    return true;
  };

  const checkSpamLimits = async (email: string) => {
    console.log("予約制限チェック中...");
    const { data: canReserveSpam, error: spamError } = await supabase.rpc('check_reservation_limit', {
      p_email: email
    });

    if (spamError) {
      console.error("予約制限チェックエラー:", spamError);
      throw new Error("予約制限の確認中にエラーが発生しました");
    }

    if (!canReserveSpam) {
      console.log("予約制限に引っかかりました");
      toast({
        variant: "destructive",
        title: "予約制限",
        description: "前回の予約から10分以内のため、しばらくお待ちください。連続予約を防ぐため、10分間の制限を設けております。",
      });
      return false;
    }

    console.log("予約制限チェック通過");
    return true;
  };

  return {
    checkTreatmentLimits,
    checkTimeConflicts,
    checkSpamLimits
  };
};
