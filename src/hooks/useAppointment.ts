
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAppointmentValidation } from "./appointment/useAppointmentValidation";
import { useAppointmentConflictCheck } from "./appointment/useAppointmentConflictCheck";
import { useAppointmentSubmission } from "./appointment/useAppointmentSubmission";
import { useAppointmentEmailService } from "./appointment/useAppointmentEmailService";

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

export const useAppointment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { validateAppointmentData, getTreatmentType, getReservationLimitMessage } = useAppointmentValidation();
  const { checkTreatmentLimits, checkTimeConflicts, checkSpamLimits } = useAppointmentConflictCheck();
  const { submitAppointmentData, recordReservationLimit, saveAppointmentPreferences } = useAppointmentSubmission();
  const { sendConfirmationEmail } = useAppointmentEmailService();

  const createAppointment = async (data: AppointmentData) => {
    if (isLoading) {
      console.log("既に処理中のため、重複実行を防止");
      return false;
    }
    
    setIsLoading(true);
    try {
      // バリデーション
      validateAppointmentData(data);

      // 診療内容別の予約制限チェック
      const canReserveTreatment = await checkTreatmentLimits(data.email, data.treatment_name);
      if (!canReserveTreatment) {
        const treatmentType = getTreatmentType(data.treatment_name);
        const errorMessage = getReservationLimitMessage(treatmentType);
        
        toast({
          variant: "destructive",
          title: "予約制限",
          description: errorMessage,
        });
        return false;
      }

      // 予約時間の重複チェック
      const hasNoTimeConflict = await checkTimeConflicts(data);
      if (!hasNoTimeConflict) {
        return false;
      }

      // スパム防止: 予約制限チェック
      const canReserveSpam = await checkSpamLimits(data.email);
      if (!canReserveSpam) {
        return false;
      }

      // 予約データを保存
      const insertedAppointment = await submitAppointmentData(data);

      // 予約制限を記録
      await recordReservationLimit(data.email);

      // 予約希望日時を保存
      await saveAppointmentPreferences(insertedAppointment.id, data.preferredDates);

      // 予約確認メールを送信
      await sendConfirmationEmail(data);

      return true;
    } catch (error: any) {
      console.error("予約作成エラー:", error);
      
      toast({
        variant: "destructive",
        title: "エラー",
        description: `予約に失敗しました: ${error.message || 'もう一度お試しください。'}`,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { createAppointment, isLoading };
};
