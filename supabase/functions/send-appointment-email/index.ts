
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { sendAppointmentEmails, AppointmentEmailRequest } from "./emailService.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log("📥 予約メール送信リクエスト受信");
    const requestData: AppointmentEmailRequest = await req.json();
    console.log("📥 リクエストデータ:", {
      patientName: requestData.patientName,
      patientEmail: requestData.patientEmail,
      preferredDatesCount: requestData.preferredDates?.length || 0
    });

    const emailResults = await sendAppointmentEmails(requestData);

    console.log("✅ メール送信成功:", {
      patientEmailId: emailResults.patientEmailId,
      adminEmailId: emailResults.adminEmailId,
      patientSuccess: emailResults.patientSuccess,
      adminSuccess: emailResults.adminSuccess
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...emailResults
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("❌ 予約確認メール送信エラー:", error);
    console.error("❌ エラー詳細:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    
    // エラーメッセージの詳細化
    let errorMessage = error.message || "メール送信に失敗しました";
    let errorDetails: any = {
      message: errorMessage,
      name: error.name || "Error",
      stack: error.stack
    };
    
    // Resend APIのエラーの場合、詳細情報を追加
    if (error.message?.includes('RESEND') || error.message?.includes('API key')) {
      errorDetails.resendError = true;
      errorDetails.suggestion = "RESEND_API_KEYがSupabase Secretsに正しく設定されているか確認してください";
    }
    
    // ドメイン認証エラーの場合
    if (error.message?.includes('domain') || error.message?.includes('unverified')) {
      errorDetails.domainError = true;
      errorDetails.suggestion = "Resendでドメイン認証が完了しているか確認してください（RESEND_DOMAIN_SETUP.mdを参照）";
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        details: errorDetails
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
