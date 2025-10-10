
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Appointment {
  id: string;
  patient_name: string;
  email: string;
  phone: string;
  treatment_name: string;
  fee: number;
  confirmed_date: string;
  confirmed_time_slot: string;
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

const formatDateJapanese = (dateString: string): string => {
  try {
    // タイムゾーン変換を避けるため、文字列を直接解析
    let dateOnly = dateString;
    if (dateString.includes('T')) {
      dateOnly = dateString.split('T')[0];
    }
    
    const dateParts = dateOnly.split('-');
    if (dateParts.length !== 3) {
      console.error("無効な日付形式:", dateOnly);
      return dateString;
    }
    
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);
    
    // 曜日を取得するために一時的にDateオブジェクトを作成（JST固定）
    const tempDate = new Date(year, month - 1, day);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[tempDate.getDay()];
    
    return `${year}年${month}月${day}日（${weekday}）`;
  } catch (error) {
    console.error("日付フォーマットエラー:", error);
    return dateString;
  }
};

const sendReminderEmail = async (appointment: Appointment, reminderType: 'day_before' | 'morning_of') => {
  const formattedDate = formatDateJapanese(appointment.confirmed_date);
  const formattedTime = formatTimeJapanese(appointment.confirmed_time_slot);
  
  let subject = "";
  let htmlContent = "";
  
  if (reminderType === 'day_before') {
    subject = "【六本松矯正歯科クリニックとよしま】明日のご予約についてお知らせいたします";
    htmlContent = `
      <div style="font-family: 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ Pro W3', Meiryo, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">明日のご予約についてお知らせ</h2>
        
        <p>${appointment.patient_name}様</p>
        
        <p>いつも六本松矯正歯科クリニックとよしまをご利用いただき、ありがとうございます。</p>
        
        <p>明日のご予約についてお知らせいたします。</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2563eb; margin-top: 0;">ご予約詳細</h3>
          <p><strong>患者様名：</strong>${appointment.patient_name}様</p>
          <p><strong>予約日時：</strong>${formattedDate} ${formattedTime}</p>
          <p><strong>診療内容：</strong>${appointment.treatment_name}</p>
          <p><strong>料金：</strong>${appointment.fee.toLocaleString()}円</p>
        </div>
        
        <p>ご来院の際は、以下の点にご注意ください：</p>
        <ul>
          <li>予約時間の10分前にはお越しください</li>
          <li>保険証をお持ちください</li>
          <li>お薬手帳をお持ちの方はご持参ください</li>
          <li>体調に不安がある場合は事前にお電話ください</li>
        </ul>
        
        <p>ご不明な点やご質問がございましたら、お気軽にお電話ください。</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p><strong>六本松矯正歯科クリニックとよしま</strong></p>
          <p>TEL: 03-1234-5678</p>
          <p>診療時間: 9:00-18:30（土曜 9:00-17:00）</p>
          <p>定休日: 日曜・祝日</p>
        </div>
        
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          ※このメールは自動送信されています。返信はできませんので、お問い合わせはお電話にてお願いいたします。
        </p>
      </div>
    `;
  } else {
    subject = "【六本松矯正歯科クリニックとよしま】本日のご予約についてお知らせいたします";
    htmlContent = `
      <div style="font-family: 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ Pro W3', Meiryo, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">本日のご予約について</h2>
        
        <p>${appointment.patient_name}様</p>
        
        <p>おはようございます。六本松矯正歯科クリニックとよしまです。</p>
        
        <p>本日のご予約についてお知らせいたします。</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2563eb; margin-top: 0;">本日のご予約詳細</h3>
          <p><strong>患者様名：</strong>${appointment.patient_name}様</p>
          <p><strong>予約日時：</strong>${formattedDate} ${formattedTime}</p>
          <p><strong>診療内容：</strong>${appointment.treatment_name}</p>
          <p><strong>料金：</strong>${appointment.fee.toLocaleString()}円</p>
        </div>
        
        <p style="color: #dc2626; font-weight: bold;">お忘れ物はございませんか？</p>
        <ul>
          <li>保険証</li>
          <li>お薬手帳（お持ちの方）</li>
          <li>診察券</li>
        </ul>
        
        <p>予約時間の10分前にはお越しください。</p>
        
        <p>万が一体調不良等でキャンセルが必要な場合は、お早めにお電話ください。</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p><strong>六本松矯正歯科クリニックとよしま</strong></p>
          <p>TEL: 03-1234-5678</p>
          <p>診療時間: 9:00-18:30（土曜 9:00-17:00）</p>
          <p>定休日: 日曜・祝日</p>
        </div>
        
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          ※このメールは自動送信されています。返信はできませんので、お問い合わせはお電話にてお願いいたします。
        </p>
      </div>
    `;
  }

  const emailResponse = await resend.emails.send({
    from: "六本松矯正歯科クリニックとよしま <noreply@haru-sora-dental.com>",
    to: [appointment.email],
    subject: subject,
    html: htmlContent,
  });

  return emailResponse;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { reminderType } = await req.json();
    
    console.log(`リマインダーメール送信開始: ${reminderType}`);

    const today = new Date();
    let targetDate: string;

    if (reminderType === 'day_before') {
      // 明日の予約を取得
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      targetDate = tomorrow.toISOString().split('T')[0];
    } else if (reminderType === 'morning_of') {
      // 今日の予約を取得
      targetDate = today.toISOString().split('T')[0];
    } else {
      // 後方互換性のため day_of も morning_of として扱う
      targetDate = today.toISOString().split('T')[0];
    }

    console.log(`対象日付: ${targetDate}`);

    // 確定済み予約を取得
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("status", "confirmed")
      .eq("confirmed_date", targetDate);

    if (error) {
      console.error("予約取得エラー:", error);
      throw error;
    }

    console.log(`対象予約数: ${appointments?.length || 0}`);

    let successCount = 0;
    let errorCount = 0;

    if (appointments && appointments.length > 0) {
      for (const appointment of appointments) {
        try {
          await sendReminderEmail(appointment, reminderType);
          successCount++;
          console.log(`リマインダーメール送信成功: ${appointment.patient_name}様`);
        } catch (error) {
          errorCount++;
          console.error(`リマインダーメール送信失敗: ${appointment.patient_name}様`, error);
        }
      }
    }

    const result = {
      success: true,
      reminderType,
      targetDate,
      totalAppointments: appointments?.length || 0,
      successCount,
      errorCount,
      message: `${reminderType === 'day_before' ? '前日' : '当日'}リマインダーメール送信完了: 成功${successCount}件、失敗${errorCount}件`
    };

    console.log("リマインダーメール送信結果:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("リマインダーメール送信処理エラー:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
