
import { supabase } from "@/integrations/supabase/client";

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

export const useAppointmentSubmission = () => {
  const submitAppointmentData = async (data: AppointmentData) => {
    // appointmentsテーブルに予約データを保存
    const appointmentData = {
      patient_name: data.patient_name,
      phone: data.phone,
      email: data.email,
      age: data.age,
      notes: data.notes || "",
      treatment_name: data.treatment_name,
      fee: data.fee,
      appointment_date: data.preferredDates[0].date,
      status: 'pending' as const
    };
    
    console.log("appointmentsテーブルに挿入するデータ:", appointmentData);

    const { data: insertedAppointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert(appointmentData)
      .select()
      .single();

    if (appointmentError) {
      console.error("予約データ挿入エラー:", appointmentError);
      throw appointmentError;
    }

    console.log("予約データ挿入成功:", insertedAppointment);
    return insertedAppointment;
  };

  const recordReservationLimit = async (email: string) => {
    console.log("予約制限を記録中...");
    const { error: recordError } = await supabase.rpc('record_reservation_limit', {
      p_email: email
    });

    if (recordError) {
      console.error("予約制限記録エラー:", recordError);
    } else {
      console.log("予約制限記録成功");
    }
  };

  const saveAppointmentPreferences = async (appointmentId: string, preferredDates: Array<{date: string, timeSlot: string}>) => {
    const preferencesData = preferredDates.map((preference, index) => ({
      appointment_id: appointmentId,
      preference_order: index + 1,
      preferred_date: preference.date,
      preferred_time_slot: preference.timeSlot
    }));

    console.log("予約希望日時データ:", preferencesData);

    const { error: preferencesError } = await supabase
      .from("appointment_preferences")
      .insert(preferencesData);

    if (preferencesError) {
      console.error("予約希望日時の挿入エラー:", preferencesError);
    } else {
      console.log("予約希望日時の挿入成功");
    }
  };

  return {
    submitAppointmentData,
    recordReservationLimit,
    saveAppointmentPreferences
  };
};
