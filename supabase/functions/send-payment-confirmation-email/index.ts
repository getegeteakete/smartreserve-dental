import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  appointmentId: string;
  paymentIntentId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { appointmentId, paymentIntentId }: EmailRequest = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 予約情報の取得
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      throw new Error('予約情報が見つかりません');
    }

    // 決済情報の取得
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (paymentError || !payment) {
      throw new Error('決済情報が見つかりません');
    }

    // メール送信（Resend利用）
    if (resendApiKey && appointment.email) {
      const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5; }
            .amount { font-size: 24px; font-weight: bold; color: #4F46E5; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>決済完了のお知らせ</h1>
            </div>
            <div class="content">
              <p>${appointment.patient_name} 様</p>
              
              <p>ご予約の決済が完了いたしました。</p>
              
              <div class="info-box">
                <h3>決済情報</h3>
                <p><strong>決済金額:</strong> <span class="amount">¥${payment.amount.toLocaleString()}</span></p>
                <p><strong>治療内容:</strong> ${appointment.treatment_name || '未指定'}</p>
                <p><strong>予約日:</strong> ${appointment.confirmed_date || appointment.appointment_date}</p>
                ${appointment.confirmed_time_slot ? `<p><strong>予約時間:</strong> ${appointment.confirmed_time_slot}</p>` : ''}
              </div>
              
              ${payment.receipt_url ? `
              <div style="text-align: center; margin: 20px 0;">
                <a href="${payment.receipt_url}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  領収書を確認
                </a>
              </div>
              ` : ''}
              
              <div class="info-box">
                <h3>当日のご案内</h3>
                <p>・予約時間の10分前にご来院ください</p>
                <p>・保険証をお持ちください</p>
                <p>・体調が優れない場合は事前にご連絡ください</p>
              </div>
              
              <div class="footer">
                <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
                <p>このメールは自動送信されています。</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'デンタルクリニック <noreply@yourdomain.com>',
          to: [appointment.email],
          subject: '【決済完了】ご予約の決済が完了しました',
          html: emailContent,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('Resend API error:', errorText);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: '決済完了メールを送信しました' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});



