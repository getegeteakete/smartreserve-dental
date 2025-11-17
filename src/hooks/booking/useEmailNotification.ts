
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useEmailNotification = () => {
  const { toast } = useToast();

  const sendAppointmentEmail = async (formData: any, selectedTreatment: string, selectedTreatmentData: any, fee: number, preferredDates: any[], appointmentId?: string) => {
    const validPreferences = preferredDates.filter(dateSlot => 
      dateSlot && dateSlot.date && dateSlot.timeSlot
    );

    // 診療内容名を正しく取得
    const treatmentName = selectedTreatmentData?.name || selectedTreatment;
    
    const emailData = {
      patientName: formData.patient_name,
      patientEmail: formData.email,
      phone: formData.phone,
      age: formData.age,
      treatmentName: treatmentName, // IDではなく名前を送信
      treatmentDescription: selectedTreatmentData?.description || '',
      fee: fee,
      notes: formData.notes,
      preferredDates: validPreferences.map(dateSlot => ({
        date: dateSlot.date instanceof Date 
          ? `${dateSlot.date.getFullYear()}-${String(dateSlot.date.getMonth() + 1).padStart(2, '0')}-${String(dateSlot.date.getDate()).padStart(2, '0')}`
          : dateSlot.date,
        timeSlot: dateSlot.timeSlot
      }))
    };

    console.log("📧 予約申し込みメール送信開始:", {
      patientEmail: emailData.patientEmail,
      patientName: emailData.patientName,
      preferredDatesCount: emailData.preferredDates.length
    });

    const emailResponse = await supabase.functions.invoke('send-appointment-email', {
      body: emailData
    });

    console.log("📧 メール送信レスポンス:", emailResponse);

    // メール送信成功かつappointmentIdがある場合はトークンを生成
    if (!emailResponse.error && appointmentId) {
      try {
        // キャンセル用トークンを生成
        const { data: cancelToken, error: cancelError } = await supabase.rpc('generate_appointment_token', {
          p_email: formData.email,
          p_appointment_id: appointmentId,
          p_type: 'cancel'
        });

        // 再予約用トークンを生成
        const { data: rebookToken, error: rebookError } = await supabase.rpc('generate_appointment_token', {
          p_email: formData.email,
          p_appointment_id: appointmentId,
          p_type: 'rebook'
        });

        if (!cancelError && !rebookError) {
          console.log("トークン生成成功:", { cancelToken, rebookToken });
          // トークンをメールテンプレートに渡すためにここでメール再送は行わない
          // 実際の実装では、メールテンプレートにこれらのURLを含める必要がある
        }
      } catch (error) {
        console.error("トークン生成エラー:", error);
      }
    }

    // メール送信結果をチェック
    if (emailResponse.error) {
      console.error("❌ メール送信エラー:", emailResponse.error);
      console.error("❌ エラー詳細:", JSON.stringify(emailResponse.error, null, 2));
      const errorMessage = emailResponse.error.message || '不明なエラー';
      toast({
        variant: "destructive",
        title: "予約申し込み完了（メール送信失敗）",
        description: `予約を受け付けましたが、メール送信に失敗しました。エラー: ${errorMessage}`,
      });
      // エラーをスローして呼び出し元で処理できるようにする
      throw new Error(`メール送信に失敗しました: ${errorMessage}`);
    } 
    
    if (emailResponse.data?.success) {
      const data = emailResponse.data;
      console.log("✅ メール送信成功:", {
        patientEmailId: data.patientEmailId,
        adminEmailId: data.adminEmailId,
        patientSuccess: data.patientSuccess,
        adminSuccess: data.adminSuccess
      });

      if (!data.patientSuccess) {
        const errorMsg = data.errors?.patient ? JSON.stringify(data.errors.patient) : '不明なエラー';
        console.error("❌ 患者様メール送信失敗:", errorMsg);
        toast({
          variant: "destructive",
          title: "予約申し込み完了（メール送信失敗）",
          description: `予約を受け付けましたが、確認メールの送信に失敗しました。エラー: ${errorMsg}`,
        });
        throw new Error(`患者様へのメール送信に失敗しました: ${errorMsg}`);
      } else {
        console.log(`✅ メール送信完了: ${formData.email} に確認メールを送信しました`);
        toast({
          title: "予約申し込み完了",
          description: "予約を受け付けました。確認メールをお送りしましたのでご確認ください。",
        });
        return { success: true, patientEmailId: data.patientEmailId };
      }
    } else {
      console.warn("⚠️ メール送信レスポンスが不明:", emailResponse.data);
      const errorMsg = emailResponse.data?.error || 'メール送信の確認ができませんでした';
      toast({
        variant: "destructive",
        title: "予約申し込み完了（メール送信状況不明）",
        description: `予約を受け付けましたが、${errorMsg}。`,
      });
      throw new Error(`メール送信の確認ができませんでした: ${errorMsg}`);
    }
  };

  return {
    sendAppointmentEmail
  };
};
