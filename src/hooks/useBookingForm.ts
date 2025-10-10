
import { useTreatmentSelection } from "./booking/useTreatmentSelection";
import { useBookingFormData } from "./booking/useBookingFormData";
import { usePreferredDates } from "./booking/usePreferredDates";
import { useBookingFormValidation } from "./booking/useBookingFormValidation";
import { useBookingFormSubmit } from "./booking/useBookingFormSubmit";

export const useBookingForm = () => {
  const { formData, setFormData, resetFormData } = useBookingFormData();
  const { preferredDates, handleDateSelect, handleTimeSlotSelect, resetPreferredDates } = usePreferredDates();
  const { 
    selectedTreatment, 
    setSelectedTreatment, 
    fee, 
    selectedTreatmentData, 
    resetTreatmentSelection,
    stateData,
    treatments 
  } = useTreatmentSelection();

  // バグ修正: isFormValidFunction の呼び出しを useBookingFormValidation 内で処理
  const { isValid, isFormValid } = useBookingFormValidation({
    formData,
    preferredDates,
    selectedTreatment
  });

  const onSuccess = () => {
    resetFormData();
    resetPreferredDates();
    resetTreatmentSelection();
  };

  const { handleSubmit, isLoading } = useBookingFormSubmit({
    formData,
    preferredDates,
    selectedTreatment,
    selectedTreatmentData,
    treatments,
    fee,
    isValid,
    isFormValid,
    onSuccess
  });

  return {
    formData,
    setFormData,
    preferredDates,
    selectedTreatment,
    setSelectedTreatment,
    fee,
    isValid,
    isLoading,
    handleDateSelect,
    handleTimeSlotSelect,
    handleSubmit,
    selectedTreatmentData,
    stateData,
    treatments
  };
};
