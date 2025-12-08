import { Resend } from "resend";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// 環境変数からResend APIキーを取得
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error("❌ RESEND_API_KEYが環境変数に設定されていません");
}

const resend = new Resend(resendApiKey);

// メールアドレスの検証
const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// 時間フォーマット関数
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

// 日時フォーマット関数
const formatPreferredDateTime = (dateString: string, timeSlot: string) => {
  try {
    let dateOnly = dateString;
    if (dateString.includes('T')) {
      dateOnly = dateString.split('T')[0];
    }
    
    const dateParts = dateOnly.split('-');
    if (dateParts.length !== 3) {
      return `${dateOnly} ${timeSlot}`;
    }
    
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);
    
    const tempDate = new Date(year, month - 1, day);
    const weekday = tempDate.toLocaleDateString('ja-JP', { weekday: 'long' });
    
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
    
    return `${year}年${month}月${day}日（${weekday}）${timeFormatted}`;
  } catch (error) {
    console.error("日時フォーマットエラー:", error);
    return `${dateString} ${timeSlot}`;
  }
};

// 患者様への確認メール生成
const generatePatientConfirmationEmail = (data: any): string => {
  const { patientName, patientEmail, phone, treatmentName, fee, preferredDates, notes } = data;

  const preferredDatesHtml = preferredDates.map((pref: any, index: number) => 
    `<p style="margin: 5px 0;"><strong>第${index + 1}希望:</strong> ${formatPreferredDateTime(pref.date, pref.timeSlot)}</p>`
  ).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">予約を受け付けました</h2>
      <p>${patientName}様</p>
      <p>この度は当歯科クリニックをご利用いただき、誠にありがとうございます。</p>
      <p>以下の内容で予約を受け付けいたしました。</p>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <h3 style="margin-top: 0; color: #1e40af;">予約内容</h3>
        <p><strong>お名前:</strong> ${patientName}様</p>
        <p><strong>電話番号:</strong> ${phone}</p>
        <p><strong>メールアドレス:</strong> ${patientEmail}</p>
        <p><strong>診療内容:</strong> ${treatmentName}</p>
        <p><strong>料金:</strong> ¥${fee.toLocaleString()}</p>
        ${notes ? `<p><strong>ご要望・備考:</strong> ${notes}</p>` : ''}
      </div>
      
      <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #d97706;">ご希望日時</h4>
        ${preferredDatesHtml}
      </div>
      
      <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #059669;">今後の流れ</h4>
        <ol style="margin: 10px 0; padding-left: 20px;">
          <li>管理者がスケジュールを確認いたします</li>
          <li>予約が確定次第、確定メールをお送りいたします</li>
          <li>確定メールに記載された日時にご来院ください</li>
        </ol>
      </div>
      
      <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #dc2626;">重要なお知らせ</h4>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>この段階ではまだ予約は確定しておりません</li>
          <li>確定メールが届くまでお待ちください</li>
          <li>ご質問等がございましたら、お電話にてお問い合わせください</li>
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
};

// 管理者への通知メール生成
const generateAdminNotificationEmail = (data: any): string => {
  const { patientName, patientEmail, phone, treatmentName, fee, preferredDates, notes } = data;

  const preferredDatesHtml = preferredDates.map((pref: any, index: number) => 
    `<p style="margin: 5px 0;"><strong>第${index + 1}希望:</strong> ${formatPreferredDateTime(pref.date, pref.timeSlot)}</p>`
  ).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">新しい予約が入りました</h2>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e40af;">予約詳細</h3>
        <p><strong>患者名:</strong> ${patientName}様</p>
        <p><strong>電話番号:</strong> ${phone}</p>
        <p><strong>メールアドレス:</strong> ${patientEmail}</p>
        <p><strong>診療内容:</strong> ${treatmentName}</p>
        <p><strong>料金:</strong> ¥${fee.toLocaleString()}</p>
        ${notes ? `<p><strong>ご要望・備考:</strong> ${notes}</p>` : ''}
        
        <h4 style="color: #1e40af;">希望日時</h4>
        ${preferredDatesHtml}
      </div>
      
      <p>スケジュールを確認し、予約を確定してください。</p>
      <p>確定後は患者様に確定メールを送信してください。</p>
    </div>
  `;
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log("📥 予約メール送信リクエスト受信");
    
    const requestData = req.body;
    
    // 必須フィールドの検証
    if (!requestData.patientEmail || !requestData.patientName) {
      return res.status(400).json({ 
        success: false,
        error: "必須フィールド（patientEmail, patientName）が不足しています" 
      });
    }

    // メールアドレスの検証
    if (!isValidEmail(requestData.patientEmail)) {
      return res.status(400).json({ 
        success: false,
        error: `無効なメールアドレスです: ${requestData.patientEmail}` 
      });
    }

    // Resend APIキーの確認
    if (!resendApiKey) {
      return res.status(503).json({ 
        success: false,
        error: "メール送信の設定が完了していません。管理者にお問い合わせください。",
        details: { resendError: true }
      });
    }

    console.log("📧 メール送信開始:", {
      patientName: requestData.patientName,
      patientEmail: requestData.patientEmail,
      preferredDatesCount: requestData.preferredDates?.length || 0
    });

    // 患者様への確認メール生成
    const patientEmailHtml = generatePatientConfirmationEmail(requestData);
    const patientSubject = `予約受付完了 - ${requestData.patientName}様の予約を受け付けました`;

    // 管理者への通知メール生成
    const adminEmailHtml = generateAdminNotificationEmail(requestData);
    const adminSubject = `新規予約 - ${requestData.patientName}様からの予約申込み`;

    // 送信元メールアドレス（固定）
    const fromEmail = 't@489.toyoshima-do.com';
    const fromName = '六本松矯正歯科クリニックとよしま';
    const adminFromName = '六本松矯正歯科クリニックとよしま予約システム';
    const adminToEmail = 't@489.toyoshima-do.com';

    // 患者様への確認メール送信
    console.log(`📧 患者様メール送信開始: ${requestData.patientEmail}`);
    const patientEmailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [requestData.patientEmail],
      subject: patientSubject,
      html: patientEmailHtml,
    });

    console.log("患者様確認メール送信結果:", {
      success: !!patientEmailResponse.data?.id,
      emailId: patientEmailResponse.data?.id,
      error: patientEmailResponse.error
    });

    // 患者様メール送信エラーチェック
    if (patientEmailResponse.error) {
      console.error("❌ 患者様メール送信エラー:", patientEmailResponse.error);
      const errorDetails = patientEmailResponse.error;
      let errorMessage = `患者様へのメール送信に失敗しました`;
      
      if (typeof errorDetails === 'object') {
        if (errorDetails.message) {
          errorMessage += `: ${errorDetails.message}`;
        }
        if (errorDetails.name) {
          errorMessage += ` (${errorDetails.name})`;
        }
      } else {
        errorMessage += `: ${JSON.stringify(errorDetails)}`;
      }
      
      return res.status(500).json({ 
        success: false,
        error: errorMessage,
        details: { patientError: errorDetails }
      });
    }

    if (!patientEmailResponse.data?.id) {
      console.error("❌ 患者様メール送信失敗: レスポンスにIDがありません");
      return res.status(500).json({ 
        success: false,
        error: "患者様へのメール送信に失敗しました（レスポンスにIDがありません）" 
      });
    }

    // 管理者への通知メール送信
    console.log(`📧 管理者メール送信開始: ${adminToEmail}`);
    const adminEmailResponse = await resend.emails.send({
      from: `${adminFromName} <${fromEmail}>`,
      to: [adminToEmail],
      subject: adminSubject,
      html: adminEmailHtml,
    });

    console.log("管理者通知メール送信結果:", {
      success: !!adminEmailResponse.data?.id,
      emailId: adminEmailResponse.data?.id,
      error: adminEmailResponse.error
    });

    // 管理者メール送信エラーは警告のみ（患者様メールが成功していれば続行）
    if (adminEmailResponse.error) {
      console.warn("⚠️ 管理者メール送信エラー:", adminEmailResponse.error);
    }

    return res.status(200).json({
      success: true,
      patientEmailId: patientEmailResponse.data?.id || null,
      adminEmailId: adminEmailResponse.data?.id || null,
      patientSuccess: !!patientEmailResponse.data?.id,
      adminSuccess: !!adminEmailResponse.data?.id,
      errors: {
        patient: patientEmailResponse.error || null,
        admin: adminEmailResponse.error || null
      }
    });

  } catch (error: any) {
    console.error("❌ 予約確認メール送信エラー:", error);
    console.error("❌ エラー詳細:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    let errorMessage = error.message || error.toString() || "メール送信に失敗しました";
    let statusCode = 500;
    
    if (errorMessage.includes('無効な') || errorMessage.includes('必須フィールド')) {
      statusCode = 400;
    } else if (errorMessage.includes('RESEND_API_KEY') || errorMessage.includes('設定が完了していません')) {
      statusCode = 503;
    }
    
    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: {
        message: errorMessage,
        name: error.name || "Error",
        type: error.constructor?.name || "UnknownError"
      }
    });
  }
}

