
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppointmentCancellationData {
  id: string;
  patient_name: string;
  phone: string;
  email: string;
  treatment_name: string;
  appointment_date: string;
  confirmed_date: string | null;
  confirmed_time_slot: string | null;
}

const formatAppointmentDateTime = (appointmentDate: string, confirmedDate?: string | null, confirmedTimeSlot?: string | null): string => {
  if (confirmedDate && confirmedTimeSlot) {
    // 確定済み予約の場合
    const date = new Date(confirmedDate);
    const dateFormatted = date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });

    // 時間スロットから時間部分を抽出
    let timeFormatted = '';
    if (confirmedTimeSlot.includes('-') && confirmedTimeSlot.includes(':')) {
      const parts = confirmedTimeSlot.split('-');
      if (parts.length >= 4) {
        const timePart = parts[parts.length - 1];
        const timeParts = timePart.split(':');
        if (timeParts.length >= 2) {
          const hours = parseInt(timeParts[0], 10);
          const minutes = parseInt(timeParts[1], 10);
          timeFormatted = `${hours}:${minutes.toString().padStart(2, '0')}`;
        }
      }
    } else if (confirmedTimeSlot.includes(':')) {
      const timeParts = confirmedTimeSlot.split(':');
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        timeFormatted = `${hours}:${minutes.toString().padStart(2, '0')}`;
      }
    }

    return `${dateFormatted} ${timeFormatted}`;
  } else {
    // 仮予約の場合
    const date = new Date(appointmentDate);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    });
  }
};

export const sendCancellationEmail = async (
  appointment: AppointmentCancellationData,
  cancelReason: string,
  toast: ReturnType<typeof useToast>['toast']
) => {
  try {
    console.log("キャンセルメール送信開始:", appointment);
    
    const appointmentDateString = formatAppointmentDateTime(
      appointment.appointment_date,
      appointment.confirmed_date,
      appointment.confirmed_time_slot
    );

    const emailData = {
      patientName: appointment.patient_name,
      patientEmail: appointment.email,
      phone: appointment.phone,
      treatmentName: appointment.treatment_name,
      appointmentDate: appointmentDateString,
      cancelledAt: new Date().toLocaleString('ja-JP'),
      cancelReason: cancelReason || "理由の記載なし",
    };

    const emailResponse = await supabase.functions.invoke('send-cancellation-email', {
      body: emailData
    });

    if (emailResponse.error) {
      console.error("キャンセルメール送信エラー:", emailResponse.error);
      throw emailResponse.error;
    }

    console.log("キャンセルメール送信成功:", emailResponse.data);
  } catch (error: any) {
    console.error("キャンセルメール送信処理エラー:", error);
    toast({
      variant: "destructive",
      title: "メール送信エラー",
      description: "キャンセルメールの送信に失敗しました",
    });
  }
};

export const checkIfNeedsPhoneContact = (appointmentDate: string, confirmedDate?: string | null): boolean => {
  const targetDate = confirmedDate ? new Date(confirmedDate) : new Date(appointmentDate);
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 3;
};
