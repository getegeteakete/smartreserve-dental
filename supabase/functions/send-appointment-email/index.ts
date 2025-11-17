
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { sendAppointmentEmails, AppointmentEmailRequest } from "./emailService.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
      name: error.name
    });
    return new Response(
      JSON.stringify({ 
        error: error.message || "メール送信に失敗しました",
        details: error.stack
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
