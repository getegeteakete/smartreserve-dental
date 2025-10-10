import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CancellationEmailRequest {
  patientName: string;
  patientEmail: string;
  phone: string;
  treatmentName: string;
  appointmentDate: string;
  cancelledAt: string;
  cancelReason: string;
}

const formatTimeJapanese = (timeString: string): string => {
  try {
    let hours = 0;
    let minutes = 0;
    
    if (timeString.includes(':')) {
      const timeParts = timeString.split(':');
      if (timeParts.length >= 2) {
        hours = parseInt(timeParts[0], 10);
        minutes = parseInt(timeParts[1], 10);
      }
    }
    
    // 0分の場合は「分」を省略
    if (minutes === 0) {
      return `${hours}時`;
    } else {
      return `${hours}時${minutes}分`;
    }
  } catch (error) {
    console.error("時間フォーマットエラー:", error);
    return timeString;
  }
};

const formatDateTime = (dateTimeString: string): string => {
  try {
    // 日時文字列から時間部分を抽出してフォーマット
    if (dateTimeString.includes('時') && dateTimeString.includes('分')) {
      // 既にフォーマット済みの場合はそのまま返す
      return dateTimeString;
    }
    
    // ISO形式や他の形式の場合の処理
    const date = new Date(dateTimeString);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekday = date.toLocaleDateString('ja-JP', { weekday: 'long' });
      const hours = date.getHours();
      const minutes = date.getMinutes();
      
      const timeFormatted = formatTimeJapanese(`${hours}:${minutes}`);
      return `${year}年${month}月${day}日（${weekday}）${timeFormatted}`;
    }
    
    return dateTimeString;
  } catch (error) {
    console.error("日時フォーマットエラー:", error);
    return dateTimeString;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      patientName, 
      patientEmail, 
      phone, 
      treatmentName, 
      appointmentDate,
      cancelledAt,
      cancelReason
    }: CancellationEmailRequest = await req.json();

    console.log("キャンセルメール送信開始:", { patientName, patientEmail, treatmentName });

    const formattedAppointmentDate = formatDateTime(appointmentDate);
    const formattedCancelledAt = formatDateTime(cancelledAt);

    // 管理者宛てのキャンセル通知メール
    const adminNotificationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">予約がキャンセルされました</h2>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #dc2626;">キャンセル予約詳細</h3>
          <p><strong>患者名:</strong> ${patientName}様</p>
          <p><strong>電話番号:</strong> ${phone}</p>
          <p><strong>メールアドレス:</strong> ${patientEmail}</p>
          <p><strong>診療内容:</strong> ${treatmentName}</p>
          <p><strong>予約日時:</strong> ${formattedAppointmentDate}</p>
          <p><strong>キャンセル日時:</strong> ${formattedCancelledAt}</p>
          <p><strong>キャンセル理由:</strong> ${cancelReason}</p>
        </div>
        
        <p>患者様にキャンセル確認メールを送信済みです。</p>
        <p>必要に応じて患者様にご連絡ください。</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          六本松矯正歯科クリニックとよしま<br>
          所在地：〒810-0044 福岡県福岡市中央区六本松４丁目１１−２６ ビバーチェ・ハシモト 1F<br>
          電話番号：092-406-2119<br>
          診療時間<br>
          月曜日：午前中休診/15:00〜19:00<br>
          火・水・金：10:00〜13:30/15:00〜19:00<br>
          土：9:00〜12:30/14:00〜17:30<br>
          月一度日曜も診療しております<br>
          休診日：月曜午前・木・日・祝日<br>
          祝日がある週の木曜日は診療します
        </p>
      </div>
    `;

    // 患者宛てのキャンセル確認メール
    const patientConfirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">予約をキャンセルいたしました</h2>
        <p>${patientName}様</p>
        <p>この度はご予約をキャンセルしていただき、承知いたしました。</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #dc2626;">キャンセル予約内容</h3>
          <p><strong>お名前:</strong> ${patientName}様</p>
          <p><strong>電話番号:</strong> ${phone}</p>
          <p><strong>メールアドレス:</strong> ${patientEmail}</p>
          <p><strong>診療内容:</strong> ${treatmentName}</p>
          <p><strong>予約日時:</strong> ${formattedAppointmentDate}</p>
          <p><strong>キャンセル日時:</strong> ${formattedCancelledAt}</p>
          <p><strong>キャンセル理由:</strong> ${cancelReason}</p>
        </div>
        
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #15803d;">今後のご予約について</h4>
          <ul>
            <li>再度ご予約をご希望の場合は、お電話またはウェブサイトからお申し込みください</li>
            <li>緊急時やお急ぎの場合は、直接お電話にてご相談ください</li>
            <li>ご不明な点がございましたら、お気軽にお問い合わせください</li>
          </ul>
        </div>
        
        <p>またのご利用を心よりお待ちしております。</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          六本松矯正歯科クリニックとよしま<br>
          所在地：〒810-0044 福岡県福岡市中央区六本松４丁目１１−２６ ビバーチェ・ハシモト 1F<br>
          電話番号：092-406-2119<br>
          診療時間<br>
          月曜日：午前中休診/15:00〜19:00<br>
          火・水・金：10:00〜13:30/15:00〜19:00<br>
          土：9:00〜12:30/14:00〜17:30<br>
          月一度日曜も診療しております<br>
          休診日：月曜午前・木・日・祝日<br>
          祝日がある週の木曜日は診療します
        </p>
      </div>
    `;

    const adminEmailResponse = await resend.emails.send({
      from: "六本松矯正歯科クリニックとよしま予約システム <info@489.toyoshima-do.com>",
      to: ["info@489.toyoshima-do.com"],
      subject: `予約キャンセル - ${patientName}様の予約がキャンセルされました`,
      html: adminNotificationHtml,
    });

    const patientEmailResponse = await resend.emails.send({
      from: "六本松矯正歯科クリニックとよしま <info@489.toyoshima-do.com>",
      to: [patientEmail],
      subject: `予約キャンセル確認 - ${patientName}様の予約をキャンセルいたしました`,
      html: patientConfirmationHtml,
    });

    console.log("キャンセルメール送信成功:", { adminEmailResponse, patientEmailResponse });

    return new Response(
      JSON.stringify({ 
        success: true,
        adminEmailId: adminEmailResponse.data?.id,
        patientEmailId: patientEmailResponse.data?.id
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
    console.error("キャンセルメール送信エラー:", error);
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
