
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
    
    // リクエストボディの取得
    let requestData: AppointmentEmailRequest;
    try {
      const bodyText = await req.text();
      console.log("📥 リクエストボディ（生）:", bodyText);
      requestData = JSON.parse(bodyText);
    } catch (parseError: any) {
      console.error("❌ リクエストボディのパースエラー:", parseError);
      throw new Error(`リクエストデータの解析に失敗しました: ${parseError.message}`);
    }
    
    // 必須フィールドの検証
    if (!requestData.patientEmail || !requestData.patientName) {
      throw new Error("必須フィールド（patientEmail, patientName）が不足しています");
    }
    
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
      cause: error.cause,
      toString: error.toString()
    });
    
    // エラーメッセージの詳細化
    let errorMessage = error.message || error.toString() || "メール送信に失敗しました";
    let errorDetails: any = {
      message: errorMessage,
      name: error.name || "Error",
      type: error.constructor?.name || "UnknownError"
    };
    
    // スタックトレースは本番環境では含めない（セキュリティのため）
    if (Deno.env.get("ENVIRONMENT") === "development") {
      errorDetails.stack = error.stack;
    }
    
    // Resend APIのエラーの場合、詳細情報を追加
    if (errorMessage.includes('RESEND') || errorMessage.includes('API key') || errorMessage.includes('設定が完了していません')) {
      errorDetails.resendError = true;
      errorDetails.suggestion = "RESEND_API_KEYがSupabase Secretsに正しく設定されているか確認してください。コマンド: npx supabase secrets set RESEND_API_KEY=re_xxxxx";
    }
    
    // ドメイン認証エラーの場合
    if (errorMessage.includes('domain') || errorMessage.includes('unverified') || errorMessage.includes('Domain')) {
      errorDetails.domainError = true;
      errorDetails.suggestion = "Resendでドメイン認証が完了しているか確認してください（RESEND_DOMAIN_SETUP.mdを参照）";
    }
    
    // メールアドレスエラーの場合
    if (errorMessage.includes('無効なメールアドレス') || errorMessage.includes('invalid email')) {
      errorDetails.emailError = true;
      errorDetails.suggestion = "送信先メールアドレスが正しい形式か確認してください";
    }
    
    // HTTPステータスコードの決定
    let statusCode = 500;
    if (errorMessage.includes('無効な') || errorMessage.includes('必須フィールド')) {
      statusCode = 400; // Bad Request
    } else if (errorMessage.includes('RESEND_API_KEY') || errorMessage.includes('設定が完了していません')) {
      statusCode = 503; // Service Unavailable
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        details: errorDetails
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
