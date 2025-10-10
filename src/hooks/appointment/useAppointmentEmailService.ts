
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

export const useAppointmentEmailService = () => {
  const { toast } = useToast();

  const sendConfirmationEmail = async (data: AppointmentData) => {
    try {
      console.log("予約確認メール送信を開始します...");
      
      const emailData = {
        patientName: data.patient_name,
        patientEmail: data.email,
        phone: data.phone,
        treatmentName: data.treatment_name,
        fee: data.fee,
        preferredDates: data.preferredDates.map(pd => ({
          date: pd.date,
          timeSlot: pd.timeSlot
        })),
        notes: data.notes || ""
      };

      console.log("Edge Function に送信するデータ:", emailData);

      const emailResponse = await supabase.functions.invoke('send-appointment-email', {
        body: emailData
      });

      if (emailResponse.error) {
        console.error("予約確認メール送信エラー:", emailResponse.error);
        toast({
          title: "予約完了（メール送信失敗）",
          description: "予約は完了しましたが、確認メールの送信に失敗しました。お電話でお問い合わせください。",
          variant: "destructive",
        });
      } else {
        console.log("予約確認メール送信成功:", emailResponse.data);
        toast({
          title: "予約完了",
          description: "予約が正常に完了し、確認メールを送信しました。管理者が確認後、予約確定のご連絡をいたします。",
        });
      }
    } catch (emailError: any) {
      console.error("予約確認メール送信処理エラー:", emailError);
      toast({
        title: "予約完了（メール送信失敗）",
        description: "予約は完了しましたが、確認メールの送信に失敗しました。お電話でお問い合わせください。",
        variant: "destructive",
      });
    }
  };

  return {
    sendConfirmationEmail
  };
};
