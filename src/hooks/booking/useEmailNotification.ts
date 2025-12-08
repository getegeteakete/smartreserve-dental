
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

    // Vercel API Routesを使用
    const apiUrl = import.meta.env.VITE_API_URL || '/api/send-appointment-email';
    console.log("📧 Vercel API呼び出し開始:", {
      apiUrl: apiUrl,
      patientEmail: emailData.patientEmail,
      patientName: emailData.patientName
    });

    const emailResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    const emailData_result = await emailResponse.json();
    
    // レスポンス形式をSupabase形式に変換
    const emailResponse_supabase = {
      data: emailData_result.success ? emailData_result : null,
      error: emailData_result.success ? null : emailData_result,
      status: emailResponse.status,
      statusText: emailResponse.statusText
    };

    console.log("📧 メール送信レスポンス:", emailResponse_supabase);
    console.log("📧 メール送信レスポンス詳細:", {
      error: emailResponse_supabase.error,
      data: emailResponse_supabase.data,
      status: emailResponse_supabase.status,
      statusText: emailResponse_supabase.statusText,
      errorDetails: emailResponse_supabase.error ? JSON.stringify(emailResponse_supabase.error, null, 2) : null
    });

    // メール送信成功かつappointmentIdがある場合はトークンを生成
    if (!emailResponse_supabase.error && appointmentId) {
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
    if (emailResponse_supabase.error) {
      console.error("❌ メール送信エラー:", emailResponse_supabase.error);
      console.error("❌ エラー詳細:", JSON.stringify(emailResponse_supabase.error, null, 2));
      console.error("❌ エラーオブジェクト全体:", emailResponse_supabase.error);
      
      // エラーの種類に応じたメッセージを生成
      let errorMessage = '不明なエラー';
      let userMessage = '予約を受け付けましたが、メール送信に失敗しました。';
      let detailedError = '';
      
      // エラーメッセージの取得
      if (typeof emailResponse_supabase.error === 'string') {
        errorMessage = emailResponse_supabase.error;
      } else if (emailResponse_supabase.error?.error) {
        errorMessage = emailResponse_supabase.error.error;
      } else if (emailResponse_supabase.error?.message) {
        errorMessage = emailResponse_supabase.error.message;
      }
      
      // 詳細エラー情報の取得
      if (emailResponse_supabase.error?.details) {
        detailedError = JSON.stringify(emailResponse_supabase.error.details);
      }
      
      console.error("🔍 解析されたエラーメッセージ:", errorMessage);
      console.error("🔍 詳細エラー:", detailedError);
      
      // CORSエラーの場合
      if (errorMessage.includes('CORS') || errorMessage.includes('blocked') || errorMessage.includes('preflight')) {
        userMessage = '予約を受け付けましたが、メール送信機能への接続に失敗しました（CORSエラー）。Edge FunctionのCORS設定を確認してください。';
        console.error("⚠️ CORSエラーが発生しています。Edge FunctionのCORS設定を確認してください。");
      }
      // Edge Functionが存在しない場合
      else if (errorMessage.includes('Function not found') || 
               errorMessage.includes('404') || 
               errorMessage.includes('not found') ||
               errorMessage.includes('Failed to send a request')) {
        userMessage = '予約を受け付けましたが、メール送信機能が設定されていません。管理者にご連絡ください。';
        console.error("⚠️ Edge Functionがデプロイされていない可能性があります。EDGE_FUNCTION_DEPLOY_GUIDE.mdを参照してデプロイしてください。");
      }
      // APIキーが設定されていない場合
      else if (errorMessage.includes('RESEND_API_KEY') || 
               errorMessage.includes('設定が完了していません') ||
               errorMessage.includes('API key')) {
        userMessage = '予約を受け付けましたが、メール送信の設定が完了していません。管理者にご連絡ください。';
        console.error("⚠️ RESEND_API_KEYがSupabaseのSecretsに設定されていない可能性があります。");
      }
      // ネットワークエラーの場合
      else if (errorMessage.includes('network') || 
               errorMessage.includes('fetch') || 
               errorMessage.includes('ERR_FAILED')) {
        userMessage = '予約を受け付けましたが、メール送信機能への接続に失敗しました。ネットワーク接続を確認してください。';
        console.error("⚠️ ネットワークエラーが発生しています。");
      }
      // その他のエラー
      else {
        userMessage = `予約を受け付けましたが、メール送信に失敗しました。エラー: ${errorMessage}`;
        console.error("⚠️ 不明なエラー:", errorMessage);
      }
      
      toast({
        variant: "destructive",
        title: "予約申し込み完了（メール送信失敗）",
        description: userMessage,
        duration: 10000, // 10秒間表示
      });
      
      // エラーをスローして呼び出し元で処理できるようにする
      throw new Error(`メール送信に失敗しました: ${errorMessage}${detailedError ? ' | 詳細: ' + detailedError : ''}`);
    } 
    
    if (emailResponse_supabase.data?.success) {
      const data = emailResponse_supabase.data;
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
      console.warn("⚠️ メール送信レスポンスが不明:", emailResponse_supabase.data);
      const errorMsg = emailResponse_supabase.data?.error || emailResponse_supabase.error?.error || 'メール送信の確認ができませんでした';
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
