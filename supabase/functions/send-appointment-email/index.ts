
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
    const requestData: AppointmentEmailRequest = await req.json();

    const emailResults = await sendAppointmentEmails(requestData);

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
    console.error("予約確認メール送信エラー:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
