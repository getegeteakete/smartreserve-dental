
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  email: string;
  age: number;
  notes: string;
  treatment_name: string;
  fee: number;
  appointment_date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  confirmed_date: string | null;
  confirmed_time_slot: string | null;
  created_at: string;
}

export const sendConfirmationEmail = async (appointment: Appointment, toast: ReturnType<typeof useToast>['toast']) => {
  try {
    console.log("確定メール送信開始:", appointment);
    
    const emailData = {
      patientName: appointment.patient_name,
      patientEmail: appointment.email,
      phone: appointment.phone,
      treatmentName: appointment.treatment_name,
      fee: appointment.fee,
      confirmedDate: appointment.confirmed_date || appointment.appointment_date,
      confirmedTimeSlot: appointment.confirmed_time_slot || "確認中",
    };

    const emailResponse = await supabase.functions.invoke('send-confirmation-email', {
      body: emailData
    });

    if (emailResponse.error) {
      console.error("確定メール送信エラー:", emailResponse.error);
      throw emailResponse.error;
    }

    console.log("確定メール送信成功:", emailResponse.data);
  } catch (error: any) {
    console.error("確定メール送信処理エラー:", error);
    toast({
      variant: "destructive",
      title: "メール送信エラー",
      description: "確定メールの送信に失敗しました",
    });
  }
};
