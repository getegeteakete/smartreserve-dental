
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const useAppointmentCreation = () => {
  const createAppointment = async (formData: any, selectedTreatment: string, selectedTreatmentData: any, fee: number, preferredDates: any[]) => {
    console.log("📝 予約作成開始:", {
      email: formData.email,
      treatment: selectedTreatment,
      treatmentData: selectedTreatmentData?.name,
      preferredDatesCount: preferredDates.length
    });
    
    // 診療内容名を正しく取得
    const treatmentName = selectedTreatmentData?.name || selectedTreatment;
    
    // 第1希望の日付を取得してタイムゾーン変換を避ける
    let appointmentDate = new Date().toISOString(); // デフォルト値
    console.log("🔴 デバッグ: preferredDates:", preferredDates);
    if (preferredDates && preferredDates.length > 0 && preferredDates[0]?.date) {
      const firstDate = preferredDates[0].date;
      console.log("🔴 デバッグ: firstDate:", firstDate);
      console.log("🔴 デバッグ: firstDate type:", typeof firstDate);
      console.log("🔴 デバッグ: firstDate instanceof Date:", firstDate instanceof Date);
      
      if (firstDate instanceof Date) {
        // タイムゾーン変換を避けるため、ローカル日付を文字列化
        const year = firstDate.getFullYear();
        const month = String(firstDate.getMonth() + 1).padStart(2, '0');
        const day = String(firstDate.getDate()).padStart(2, '0');
        appointmentDate = `${year}-${month}-${day}T00:00:00.000Z`;
        console.log("🔴 デバッグ: 生成されたappointmentDate:", appointmentDate);
        console.log("🔴 デバッグ: 日付詳細 - year:", year, "month:", month, "day:", day);
      } else {
        appointmentDate = `${firstDate}T00:00:00.000Z`;
        console.log("🔴 デバッグ: 文字列として処理されたappointmentDate:", appointmentDate);
      }
    } else {
      console.log("🔴 デバッグ: preferredDatesが無効またはempty - デフォルト日付を使用");
    }
    
    const { data: appointmentData, error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        patient_name: formData.patient_name,
        phone: formData.phone,
        email: formData.email,
        age: parseInt(formData.age),
        notes: formData.notes,
        treatment_name: treatmentName, // IDではなく名前を保存
        fee: fee,
        appointment_date: appointmentDate,
        status: 'pending'
      })
      .select()
      .single();

    if (appointmentError) {
      throw appointmentError;
    }

    return appointmentData;
  };

  const saveAppointmentPreferences = async (appointmentId: string, preferredDates: any[]) => {
    const validPreferences = preferredDates.filter(dateSlot => 
      dateSlot && dateSlot.date && dateSlot.timeSlot
    );

    if (validPreferences.length > 0) {
      const preferencesData = validPreferences.map((dateSlot, index) => {
        // タイムゾーン変換を避けるため、日付を直接文字列化
        const dateString = dateSlot.date instanceof Date 
          ? `${dateSlot.date.getFullYear()}-${String(dateSlot.date.getMonth() + 1).padStart(2, '0')}-${String(dateSlot.date.getDate()).padStart(2, '0')}`
          : format(dateSlot.date, 'yyyy-MM-dd');
        
        const timeSlotParts = dateSlot.timeSlot.split('-');
        let actualTimeSlot = dateSlot.timeSlot;
        
        if (timeSlotParts.length >= 4) {
          actualTimeSlot = timeSlotParts.slice(3).join('-');
        }

        return {
          appointment_id: appointmentId,
          preference_order: index + 1,
          preferred_date: dateString,
          preferred_time_slot: actualTimeSlot
        };
      });

      console.log("希望日時データ保存:", preferencesData);

      const { error: preferencesError } = await supabase
        .from("appointment_preferences")
        .insert(preferencesData);

      if (preferencesError) {
        throw preferencesError;
      }
    }
  };

  return {
    createAppointment,
    saveAppointmentPreferences
  };
};
