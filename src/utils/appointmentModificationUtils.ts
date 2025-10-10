
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppointmentModification {
  patientName: string;
  patientEmail: string;
  phone: string;
  treatmentName: string;
  fee: number;
  originalDate: string;
  originalTimeSlot: string;
  newPreferredDates: Array<{
    date: string;
    timeSlot: string;
    order: number;
  }>;
  modificationReason?: string;
}

export const sendAppointmentModificationEmail = async (
  modification: AppointmentModification, 
  toast: ReturnType<typeof useToast>['toast']
) => {
  try {
    console.log("予約修正メール送信開始:", modification);

    const emailResponse = await supabase.functions.invoke('send-appointment-modification-email', {
      body: modification
    });

    if (emailResponse.error) {
      console.error("予約修正メール送信エラー:", emailResponse.error);
      throw emailResponse.error;
    }

    console.log("予約修正メール送信成功:", emailResponse.data);
    
    toast({
      title: "修正申請完了",
      description: "予約修正の申請を受け付けました。確認メールを送信しました。",
    });
  } catch (error: any) {
    console.error("予約修正メール送信処理エラー:", error);
    toast({
      variant: "destructive",
      title: "メール送信エラー",
      description: "修正申請メールの送信に失敗しました",
    });
  }
};
