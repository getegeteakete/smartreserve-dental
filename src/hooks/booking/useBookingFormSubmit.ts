
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useBookingValidation } from "./useBookingValidation";
import { useAppointmentCreation } from "./useAppointmentCreation";
import { useEmailNotification } from "./useEmailNotification";
import { useRebookingValidation } from "./useRebookingValidation";

interface UseBookingFormSubmitProps {
  formData: any;
  preferredDates: any[];
  selectedTreatment: string;
  selectedTreatmentData: any;
  treatments: any[];
  fee: number;
  isValid: boolean;
  isFormValid: boolean;
  onSuccess: () => void;
}

export const useBookingFormSubmit = ({
  formData,
  preferredDates,
  selectedTreatment,
  selectedTreatmentData,
  treatments,
  fee,
  isValid,
  isFormValid,
  onSuccess
}: UseBookingFormSubmitProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { validateBookingForm, validatePreferredDates, validateTreatmentLimit } = useBookingValidation();
  const { createAppointment, saveAppointmentPreferences } = useAppointmentCreation();
  const { sendAppointmentEmail } = useEmailNotification();
  const { checkRebookingEligibility, cancelExistingPendingAppointments } = useRebookingValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("=== 予約処理開始 ===");
    console.log("フォームデータ:", formData);
    console.log("希望日時:", preferredDates);
    console.log("選択された診療:", { selectedTreatment, selectedTreatmentData });
    console.log("バリデーション状態:", { isValid, isFormValid });
    
    setIsLoading(true);
    
    try {
      // 基本的なフォーム検証
      console.log("ステップ1: フォーム検証開始");
      if (!validateBookingForm({ formData, preferredDates, selectedTreatment, isValid, isFormValid })) {
        console.log("フォーム検証失敗");
        setIsLoading(false);
        return;
      }
      console.log("フォーム検証成功");

      // 再予約可否チェック（既存pending予約がある場合は自動キャンセル）
      console.log("ステップ2: 再予約可否チェック開始");
      const rebookingStatus = await checkRebookingEligibility(formData.email);
      if (!rebookingStatus) {
        console.log("再予約可否チェック失敗");
        setIsLoading(false);
        return;
      }
      console.log("再予約可否チェック成功:", rebookingStatus);

      // 既存のpending予約を自動キャンセル
      if (rebookingStatus.pending_count > 0) {
        console.log("ステップ3: 既存pending予約キャンセル開始");
        const cancelledCount = await cancelExistingPendingAppointments(formData.email);
        if (cancelledCount === 0 && rebookingStatus.pending_count > 0) {
          console.log("既存pending予約キャンセル失敗");
          setIsLoading(false);
          return;
        }
        console.log("既存pending予約キャンセル成功:", cancelledCount);
      }

      // 希望日時の重複・容量チェック
      console.log("ステップ4: 希望日時検証開始");
      const datesValid = await validatePreferredDates(preferredDates, formData, selectedTreatment);
      if (!datesValid) {
        console.log("希望日時検証失敗");
        setIsLoading(false);
        return;
      }
      console.log("希望日時検証成功");

      // 診療内容別予約制限チェック
      console.log("ステップ5: 診療制限チェック開始");
      const treatmentName = selectedTreatmentData?.name || selectedTreatment;
      const treatmentLimitValid = await validateTreatmentLimit(formData.email, treatmentName);
      if (!treatmentLimitValid) {
        console.log("診療制限チェック失敗");
        setIsLoading(false);
        return;
      }
      console.log("診療制限チェック成功");

      // 予約作成処理
      console.log("ステップ6: 予約作成開始");
      const appointmentData = await createAppointment(formData, selectedTreatment, selectedTreatmentData, fee, preferredDates);
      console.log("予約作成成功:", appointmentData);

      // 希望日時の保存
      console.log("ステップ7: 希望日時保存開始");
      await saveAppointmentPreferences(appointmentData.id, preferredDates);
      console.log("希望日時保存成功");

      // 予約申し込みメール送信（appointmentIdも渡してトークン生成）
      console.log("ステップ8: メール送信開始");
      await sendAppointmentEmail(formData, selectedTreatment, selectedTreatmentData, fee, preferredDates, appointmentData.id);
      console.log("メール送信成功");

      console.log("=== 予約処理完了 ===");
      
      toast({
        title: "予約申し込み完了",
        description: "予約を受け付けました。確認メールをお送りしましたのでご確認ください。",
      });

      onSuccess();
      navigate('/');
      
    } catch (error: any) {
      console.error("=== 予約処理エラー ===");
      console.error("エラー詳細:", error);
      console.error("エラーメッセージ:", error.message);
      console.error("エラースタック:", error.stack);
      
      let errorMessage = "予約の処理中にエラーが発生しました。";
      
      if (error.message) {
        errorMessage += ` 詳細: ${error.message}`;
      }
      
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSubmit,
    isLoading
  };
};
