
import { useState } from "react";

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
  const [formData, setFormData] = useState<FormData>({
    patient_name: "",
    phone: "",
    email: "",
    age: "",
    notes: "",
    reservation_type: "self",
  });

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
