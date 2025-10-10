
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  patientName: string;
  patientEmail: string;
  phone: string;
  treatmentName: string;
  fee: number;
  confirmedDate: string;
  confirmedTimeSlot: string;
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

const formatConfirmedDateTime = (date: string, timeSlot: string) => {
  try {
    console.log("フォーマット前の日付:", date, "時間:", timeSlot);
    
    // 日付文字列を直接解析して時差問題を完全に回避
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
    
    // タイムスロットのフォーマット処理を改善
    let timeFormatted = '';
    if (timeSlot && timeSlot.trim()) {
      if (timeSlot.includes('-')) {
        const parts = timeSlot.split('-');
        if (parts.length >= 4) {
          const timePart = parts[3];
          timeFormatted = formatTimeJapanese(timePart);
        } else {
          timeFormatted = timeSlot;
        }
      } else if (timeSlot.includes(':')) {
        timeFormatted = formatTimeJapanese(timeSlot);
      } else {
        timeFormatted = timeSlot;
      }
    } else {
      timeFormatted = "時間未定";
    }
    
    const formattedResult = `${year}年${month}月${day}日（${weekday}）${timeFormatted}`;
    console.log("フォーマット後の結果:", formattedResult);
    
    return formattedResult;
  } catch (error) {
    console.error("日時フォーマットエラー:", error);
    return `${dateOnly} ${timeSlot}`;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔍 確定メール関数実行開始 - リクエスト受信");
    console.log("🔍 リクエストヘッダー:", Object.fromEntries(req.headers.entries()));
    
    const rawBody = await req.text();
    console.log("🔍 受信した生データ:", rawBody);
    
    const requestData: ConfirmationEmailRequest = JSON.parse(rawBody);
    console.log("🔍 パース済みリクエストデータ:", requestData);
    
    const {
      patientName,
      patientEmail,
      phone,
      treatmentName,
      fee,
      confirmedDate,
      confirmedTimeSlot,
    } = requestData;

    console.log("予約確定メール送信開始:", { patientName, patientEmail, confirmedDate, confirmedTimeSlot });

    const formattedConfirmedDateTime = formatConfirmedDateTime(confirmedDate, confirmedTimeSlot);
    console.log("フォーマット後の日時:", formattedConfirmedDateTime);

    // 患者様への確定メール
    const confirmationEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">予約が確定いたしました</h2>
        <p>${patientName}様</p>
        <p>この度は当歯科クリニックをご利用いただき、誠にありがとうございます。</p>
        <p>ご予約が確定いたしましたので、詳細をお知らせいたします。</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
          <h3 style="margin-top: 0; color: #15803d;">確定予約内容</h3>
          <p><strong>お名前:</strong> ${patientName}様</p>
          <p><strong>電話番号:</strong> ${phone}</p>
          <p><strong>メールアドレス:</strong> ${patientEmail}</p>
          <p><strong>診療内容:</strong> ${treatmentName}</p>
          
          <div style="background-color: #22c55e; color: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h4 style="margin: 0 0 10px 0; font-size: 18px;">確定日時</h4>
            <p style="margin: 0; font-size: 16px; font-weight: bold;">
              ${formattedConfirmedDateTime}
            </p>
          </div>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #d97706;">ご来院について</h4>
          <ul>
            <li>予約時間の<strong>10分前</strong>にはお越しください</li>
            <li>初診の方は保険証かマイナンバーカードをご持参ください</li>
            <li>現在服用されているお薬がある場合は、お薬手帳をお持ちください</li>
            <li>駐車場は3台分ご用意しております</li>
          </ul>
        </div>
        
        <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #dc2626;">変更・キャンセルについて</h4>
          <ul>
            <li>予約の変更・キャンセルは予約日の<strong>24時間前までにお電話にて</strong>ご連絡ください</li>
            <li>当日キャンセルの場合、キャンセル料が発生する場合があります</li>
            <li>無断キャンセルの場合、今後のご予約をお断りする場合があります</li>
          </ul>
        </div>
        
        <p>ご不明な点がございましたら、お気軽にお電話にてお問い合わせください。</p>
        <p>スタッフ一同、${patientName}様のご来院を心よりお待ちしております。</p>
        
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

    // 管理者への通知メール
    const adminNotificationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">予約が確定されました</h2>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #15803d;">確定予約詳細</h3>
          <p><strong>患者名:</strong> ${patientName}様</p>
          <p><strong>電話番号:</strong> ${phone}</p>
          <p><strong>メールアドレス:</strong> ${patientEmail}</p>
          <p><strong>診療内容:</strong> ${treatmentName}</p>
          <p><strong>料金:</strong> ¥${fee.toLocaleString()}</p>
          <p><strong>確定日時:</strong> ${formattedConfirmedDateTime}</p>
        </div>
        
        <p>患者様に確定メールを送信済みです。</p>
        <p>カルテの準備をお願いします。</p>
      </div>
    `;

    // 患者様への確定メール送信
    console.log("患者様メール送信開始:", { to: patientEmail, from: "六本松矯正歯科クリニックとよしま <info@489.toyoshima-do.com>" });
    const patientEmailResponse = await resend.emails.send({
      from: "六本松矯正歯科クリニックとよしま <info@489.toyoshima-do.com>",
      to: [patientEmail],
      subject: `予約確定 - ${patientName}様の予約が確定いたしました`,
      html: confirmationEmailHtml,
    });

    console.log("患者様確定メール送信結果:", {
      success: !!patientEmailResponse.data,
      emailId: patientEmailResponse.data?.id,
      error: patientEmailResponse.error
    });

    // 管理者への確定メール送信
    console.log("管理者メール送信開始:", { to: "info@489.toyoshima-do.com", from: "六本松矯正歯科クリニックとよしま予約システム <info@489.toyoshima-do.com>" });
    const adminEmailResponse = await resend.emails.send({
      from: "六本松矯正歯科クリニックとよしま予約システム <info@489.toyoshima-do.com>",
      to: ["info@489.toyoshima-do.com"],
      subject: `予約確定 - ${patientName}様の予約が確定されました`,
      html: adminNotificationHtml,
    });

    console.log("管理者通知メール送信結果:", {
      success: !!adminEmailResponse.data,
      emailId: adminEmailResponse.data?.id,
      error: adminEmailResponse.error
    });

    // エラーチェック
    const patientSuccess = !!patientEmailResponse.data?.id;
    const adminSuccess = !!adminEmailResponse.data?.id;
    
    if (!patientSuccess && !adminSuccess) {
      throw new Error("患者様・管理者共にメール送信に失敗しました");
    } else if (!patientSuccess) {
      console.warn("患者様メール送信に失敗:", patientEmailResponse.error);
    } else if (!adminSuccess) {
      console.warn("管理者メール送信に失敗:", adminEmailResponse.error);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        patientEmailId: patientEmailResponse.data?.id,
        adminEmailId: adminEmailResponse.data?.id,
        patientSuccess,
        adminSuccess,
        warnings: {
          patient: !patientSuccess ? patientEmailResponse.error : null,
          admin: !adminSuccess ? adminEmailResponse.error : null
        }
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
    console.error("確定メール送信エラー:", error);
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
