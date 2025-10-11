
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

  // 治療内容のエイリアス（別名）を取得
  const getTreatmentAliases = (treatmentName: string) => {
    const aliases: Record<string, string[]> = {
      '虫歯治療': ['むし歯', 'カリエス', '虫歯'],
      '定期検診': ['検診', 'チェックアップ'],
      'クリーニング': ['PMTC', '歯のクリーニング'],
      'ホワイトニング': ['漂白', '歯を白く'],
      '矯正': ['歯列矯正', '歯並び'],
      'インプラント': ['インプラント治療'],
      '入れ歯': ['義歯'],
      '根管治療': ['神経治療', '根っこの治療'],
      '抜歯': ['歯を抜く'],
    };
    
    return aliases[treatmentName] || [];
  };

  // Handle AI booking data
  useEffect(() => {
    if (stateData?.fromAI && stateData?.aiBookingData && treatments.length > 0) {
      const aiData = stateData.aiBookingData;
      
      // 治療内容のマッチング
      if (aiData.treatment) {
        const matchedTreatment = treatments.find((treatment: TreatmentWithCategory) => {
          const treatmentName = treatment.name.toLowerCase();
          const aiTreatment = aiData.treatment.toLowerCase();
          
          // 部分一致で治療内容を検索
          return treatmentName.includes(aiTreatment) || 
                 aiTreatment.includes(treatmentName) ||
                 getTreatmentAliases(treatmentName).some(alias => 
                   alias.includes(aiTreatment) || aiTreatment.includes(alias)
                 );
        });
        
        if (matchedTreatment) {
          setSelectedTreatment(matchedTreatment.id);
          setFee(matchedTreatment.fee);
          console.log('AI matched treatment:', matchedTreatment);
        } else {
          console.log('No matching treatment found for:', aiData.treatment);
          console.log('Available treatments:', treatments.map(t => t.name));
        }
      }
    }
  }, [stateData, treatments]);

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
