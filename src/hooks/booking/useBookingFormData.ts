
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

// バグ修正: データベーススキーマと一致するフィールド名に修正
interface FormData {
  patient_name: string; // patientName から patient_name に変更
  phone: string;
  email: string;
  age: string;
  notes: string;
  reservation_type: string;
}

export const useBookingFormData = () => {
  const location = useLocation();
  const [formData, setFormData] = useState<FormData>({
    patient_name: "",
    phone: "",
    email: "",
    age: "",
    notes: "",
    reservation_type: "self",
  });

  // Handle AI booking data for form fields
  useEffect(() => {
    if (location.state?.fromAI && location.state?.aiBookingData) {
      const aiData = location.state.aiBookingData;
      
      setFormData(prev => {
        const newData = { ...prev };
        
        // 患者名の設定
        if (aiData.patientName) {
          newData.patient_name = aiData.patientName;
          console.log('AI set patient name:', aiData.patientName);
        }
        
        // 電話番号の設定
        if (aiData.phone) {
          newData.phone = aiData.phone;
          console.log('AI set phone:', aiData.phone);
        }
        
        // メールアドレスの設定
        if (aiData.email) {
          newData.email = aiData.email;
          console.log('AI set email:', aiData.email);
        }
        
        // メモの設定（治療内容など）
        if (aiData.treatment) {
          newData.notes = `AI抽出: ${aiData.treatment}`;
          console.log('AI set notes:', aiData.treatment);
        }
        
        return newData;
      });
    }
  }, [location.state]);

  const resetFormData = () => {
    setFormData({
      patient_name: "",
      phone: "",
      email: "",
      age: "",
      notes: "",
      reservation_type: "self",
    });
  };

  return {
    formData,
    setFormData,
    resetFormData
  };
};
