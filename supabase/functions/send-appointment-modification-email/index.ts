
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ModificationEmailRequest {
  patientName: string;
  patientEmail: string;
  phone: string;
  treatmentName: string;
  fee: number;
  originalDate: string;
  originalTimeSlot: string;
  newPreferredDates: Array<{
    date: string;
    timeSlot: string;
    order: number;
  }>;
  modificationReason?: string;
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

const formatDateTime = (date: string, timeSlot: string) => {
  try {
    // タイムゾーン変換を避けるため、文字列を直接解析
    let dateOnly = date;
    if (date.includes('T')) {
      dateOnly = date.split('T')[0];
    }
    
    const dateParts = dateOnly.split('-');
    if (dateParts.length !== 3) {
      console.error("無効な日付形式:", dateOnly);
      return `${dateOnly} ${timeSlot}`;
    }
    
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);
    
    // 曜日を取得するために一時的にDateオブジェクトを作成（JST固定）
    const tempDate = new Date(year, month - 1, day);
    const weekday = tempDate.toLocaleDateString('ja-JP', { weekday: 'long' });
    
    let timeFormatted = '';
    if (timeSlot.includes('-')) {
      const parts = timeSlot.split('-');
      if (parts.length >= 4) {
        const timePart = parts[3];
        timeFormatted = formatTimeJapanese(timePart);
      }
    } else if (timeSlot.includes(':')) {
      timeFormatted = formatTimeJapanese(timeSlot);
    } else {
      timeFormatted = timeSlot;
    }
    
    return `${year}年${month}月${day}日（${weekday}）${timeFormatted}`;
  } catch (error) {
    console.error("日時フォーマットエラー:", error);
    return `${date} ${timeSlot}`;
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
      fee,
      originalDate,
      originalTimeSlot,
      newPreferredDates,
      modificationReason,
    }: ModificationEmailRequest = await req.json();

    console.log("予約修正メール送信開始:", { patientName, patientEmail });

    const originalDateTime = formatDateTime(originalDate, originalTimeSlot);

    // 患者様への修正確認メール
    const patientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">予約修正のご連絡</h2>
        <p>${patientName}様</p>
        <p>この度は予約の修正をお申し込みいただき、ありがとうございます。</p>
        <p>修正内容を確認し、管理者が新しい日程で対応可能か検討いたします。</p>
        
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #d97706;">修正前の予約内容</h3>
          <p><strong>お名前:</strong> ${patientName}様</p>
          <p><strong>電話番号:</strong> ${phone}</p>
          <p><strong>診療内容:</strong> ${treatmentName}</p>
          <p><strong>元の予約日時:</strong> ${originalDateTime}</p>
        </div>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
          <h3 style="margin-top: 0; color: #15803d;">新しい希望日時</h3>
          ${newPreferredDates.map((pref, index) => `
            <p><strong>第${pref.order}希望:</strong> ${formatDateTime(pref.date, pref.timeSlot)}</p>
          `).join('')}
          ${modificationReason ? `<p><strong>修正理由:</strong> ${modificationReason}</p>` : ''}
        </div>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
          <h4 style="margin-top: 0; color: #047857; text-align: center;">会員登録済みの方へ</h4>
          <p style="text-align: center; margin: 15px 0;">
            予約状況の確認は、マイページからご利用いただけます。
          </p>
          <div style="text-align: center;">
            <a href="${req.headers.get('origin') || 'https://489.toyoshima-do.com'}/mypage" 
               style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);">
              📱 マイページで予約を確認する
            </a>
          </div>
        </div>
        
        <div style="background-color: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0277bd;">今後の流れ</h4>
          <ul>
            <li>管理者が新しい日程の空き状況を確認いたします</li>
            <li>対応可能な場合、予約確定のメールをお送りします</li>
            <li>ご希望に添えない場合は、お電話にてご相談させていただきます</li>
            <li>通常1〜2診療日以内にご連絡いたします</li>
          </ul>
        </div>
        
        <p>ご不明な点がございましたら、お気軽にお電話にてお問い合わせください。</p>
        
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

    // 管理者への修正通知メール
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">予約修正のお知らせ</h2>
        
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #d97706;">修正前の予約内容</h3>
          <p><strong>患者名:</strong> ${patientName}様</p>
          <p><strong>電話番号:</strong> ${phone}</p>
          <p><strong>メールアドレス:</strong> ${patientEmail}</p>
          <p><strong>診療内容:</strong> ${treatmentName}</p>
          <p><strong>料金:</strong> ¥${fee.toLocaleString()}</p>
          <p><strong>元の予約日時:</strong> ${originalDateTime}</p>
        </div>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #15803d;">新しい希望日時</h3>
          ${newPreferredDates.map((pref, index) => `
            <p><strong>第${pref.order}希望:</strong> ${formatDateTime(pref.date, pref.timeSlot)}</p>
          `).join('')}
          ${modificationReason ? `<p><strong>修正理由:</strong> ${modificationReason}</p>` : ''}
        </div>
        
        <p>患者様に修正確認メールを送信済みです。</p>
        <p>新しい日程での対応をご検討ください。</p>
      </div>
    `;

    // 患者様への修正確認メール送信
    const patientEmailResponse = await resend.emails.send({
      from: "六本松矯正歯科クリニックとよしま <t@489.toyoshima-do.com>",
      to: [patientEmail],
      subject: `予約修正のご連絡 - ${patientName}様の予約修正を受け付けました`,
      html: patientEmailHtml,
    });

    console.log("患者様修正確認メール送信結果:", patientEmailResponse);

    const adminEmailResponse = await resend.emails.send({
      from: "六本松矯正歯科クリニックとよしま予約システム <t@489.toyoshima-do.com>",
      to: ["t@489.toyoshima-do.com"],
      subject: `予約修正 - ${patientName}様から予約修正の申し込みがありました`,
      html: adminEmailHtml,
    });

    console.log("管理者修正通知メール送信結果:", adminEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        patientEmailId: patientEmailResponse.data?.id,
        adminEmailId: adminEmailResponse.data?.id
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
    console.error("修正メール送信エラー:", error);
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
