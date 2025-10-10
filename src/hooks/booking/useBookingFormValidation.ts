
import { useState, useEffect, useCallback } from "react";

interface PreferredDate {
  date: Date | undefined;
  timeSlot: string | undefined;
}

interface FormData {
  patient_name: string;
  phone: string;
  email: string;
  age: string;
  notes: string;
  reservation_type: string;
}

interface ValidationProps {
  formData: FormData;
  preferredDates: PreferredDate[];
  selectedTreatment: string | undefined;
}

export const useBookingFormValidation = ({ formData, preferredDates, selectedTreatment }: ValidationProps) => {
  const [isValid, setIsValid] = useState(false);

  // 検証ロジックを useCallback でメモ化して安定化
  const isFormValid = useCallback(() => {
    // 基本項目の検証
    const basicValidation = (
      formData.patient_name.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.age.trim() !== "" &&
      formData.reservation_type.trim() !== "" &&
      selectedTreatment !== undefined
    );

    if (!basicValidation) {
      return false;
    }

    // 第1希望日時の必須チェック
    const firstPreferenceComplete = preferredDates[0]?.date && preferredDates[0]?.timeSlot;
    if (!firstPreferenceComplete) {
      return false;
    }

    // 第2希望日時の必須チェック
    const secondPreferenceComplete = preferredDates[1]?.date && preferredDates[1]?.timeSlot;
    if (!secondPreferenceComplete) {
      return false;
    }

    // 第3希望日時の検証ロジック（任意だが、部分入力は不可）
    const thirdPreference = preferredDates[2];
    if (thirdPreference && (thirdPreference.date || thirdPreference.timeSlot)) {
      if (!thirdPreference.date || !thirdPreference.timeSlot) {
        return false;
      }
    }

    return true;
  }, [formData, preferredDates, selectedTreatment]);

  useEffect(() => {
    const validStatus = isFormValid();
    setIsValid(validStatus);
  }, [isFormValid]);

  return {
    isValid,
    isFormValid: isFormValid()
  };
};
