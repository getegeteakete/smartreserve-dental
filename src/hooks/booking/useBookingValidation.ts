
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

  const validatePreferredDates = async (preferredDates: any[], formData: any, selectedTreatment: string) => {
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
        treatmentName: selectedTreatment
      });

      // 個人の重複チェック
      const { canConfirm, error: conflictError } = await checkAppointmentTimeConflict(
        formData.email,
        dateString,
        actualTimeSlot
      );

      if (conflictError || !canConfirm) {
        console.error("個人重複チェックエラー:", { conflictError, canConfirm });
        toast({
          variant: "destructive",
          title: "予約重複エラー",
          description: `選択された日時（${dateString} ${actualTimeSlot}）は既に別の予約があります。別の日時を選択してください。`,
        });
        return false;
      }

      // 時間枠の容量チェック
      const { canReserve: hasCapacity, currentCount, maxCapacity, error: capacityError } = await checkTimeSlotCapacity(
        selectedTreatment,
        dateString,
        actualTimeSlot
      );

      if (capacityError || !hasCapacity) {
        console.error("容量チェックエラー:", { capacityError, hasCapacity, currentCount, maxCapacity });
        toast({
          variant: "destructive",
          title: "予約枠満員エラー",
          description: `選択された日時（${dateString} ${actualTimeSlot}）は予約枠が満員です（${currentCount}/${maxCapacity}名）。別の日時を選択してください。`,
        });
        return false;
      }

      console.log(`時間枠容量OK: ${currentCount}/${maxCapacity}名`);
    }

    return true;
  };

  const validateTreatmentLimit = async (email: string, treatmentName: string) => {
    const { canReserve, error: limitError } = await checkTreatmentReservationLimit(
      email,
      treatmentName
    );

    if (limitError || !canReserve) {
      toast({
        variant: "destructive",
        title: "予約制限エラー",
        description: "この診療内容は既に予約上限に達しています。",
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
