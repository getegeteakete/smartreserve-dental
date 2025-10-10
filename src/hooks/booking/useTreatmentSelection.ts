
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTreatmentsWithCategories, TreatmentWithCategory } from "@/hooks/useTreatmentsWithCategories";

export const useTreatmentSelection = () => {
  const location = useLocation();
  const stateData = location.state;
  const { treatments = [] } = useTreatmentsWithCategories();
  
  const [selectedTreatment, setSelectedTreatment] = useState<string>();
  const [fee, setFee] = useState<number>(0);

  // Set treatment from state data
  useEffect(() => {
    if (stateData?.treatmentData) {
      setSelectedTreatment(stateData.treatmentData.id);
      setFee(stateData.treatmentData.fee);
    }
  }, [stateData]);

  // Set treatment after treatments are loaded
  useEffect(() => {
    if (stateData?.selectedTreatment && treatments && treatments.length > 0 && !selectedTreatment) {
      const treatment = treatments.find((t: TreatmentWithCategory) => t.id === stateData.selectedTreatment);
      if (treatment) {
        setSelectedTreatment(treatment.id);
        setFee(treatment.fee);
      }
    }
  }, [treatments, stateData, selectedTreatment]);

  // Update fee when treatment is selected
  useEffect(() => {
    if (selectedTreatment && treatments && treatments.length > 0) {
      const treatment = treatments.find((t: TreatmentWithCategory) => t.id === selectedTreatment);
      if (treatment) {
        setFee(treatment.fee);
      }
    }
  }, [selectedTreatment, treatments]);

  const resetTreatmentSelection = () => {
    setSelectedTreatment(undefined);
    setFee(0);
  };

  const selectedTreatmentData = stateData?.treatmentData || 
    (selectedTreatment && treatments.find((t: TreatmentWithCategory) => t.id === selectedTreatment));

  return {
    selectedTreatment,
    setSelectedTreatment,
    fee,
    selectedTreatmentData,
    resetTreatmentSelection,
    stateData,
    treatments
  };
};
