
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generatePatientConfirmationEmail, generateAdminNotificationEmail } from "./emailTemplates.ts";
import { formatPreferredDateTime } from "./dateFormatter.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Supabaseクライアントの初期化
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface AppointmentEmailRequest {
  patientName: string;
  patientEmail: string;
  phone: string;
  treatmentName: string;
  fee: number;
  preferredDates: Array<{
    date: string;
    timeSlot: string;
  }>;
  notes?: string;
}

// システム設定からメール設定を取得
const getEmailSettings = async (type: 'patient' | 'admin') => {
  const prefix = type === 'patient' ? 'email_patient' : 'email_admin';
  
  try {
    const settings = await Promise.all([
      supabase.from('system_settings').select('*').eq('setting_key', `${prefix}_enabled`).single(),
      supabase.from('system_settings').select('*').eq('setting_key', `${prefix}_from_name`).single(),
      supabase.from('system_settings').select('*').eq('setting_key', `${prefix}_from_email`).single(),
      supabase.from('system_settings').select('*').eq('setting_key', `${prefix}_subject`).single(),
      supabase.from('system_settings').select('*').eq('setting_key', `${prefix}_content`).single(),
    ]);

    const enabled = settings[0].data?.setting_value?.enabled !== false && settings[0].data?.is_enabled !== false;
    const fromName = settings[1].data?.setting_value?.from_name || (type === 'patient' ? '六本松矯正歯科クリニックとよしま' : '六本松矯正歯科クリニックとよしま予約システム');
    const fromEmail = settings[2].data?.setting_value?.from_email || '489@489.toyoshima-do.com';
    const subjectTemplate = settings[3].data?.setting_value?.subject || (type === 'patient' ? '予約受付完了 - {patient_name}様の予約を受け付けました' : '新規予約 - {patient_name}様からの予約申込み');
    const contentTemplate = settings[4].data?.setting_value?.content || '';

    if (type === 'admin') {
      const toEmailResult = await supabase.from('system_settings').select('*').eq('setting_key', 'email_admin_to_email').single();
      const toEmail = toEmailResult.data?.setting_value?.to_email || '489@489.toyoshima-do.com';
      return { enabled, fromName, fromEmail, toEmail, subjectTemplate, contentTemplate };
    }

    return { enabled, fromName, fromEmail, subjectTemplate, contentTemplate };
  } catch (error) {
    console.warn('システム設定の読み込みに失敗しました。デフォルト値を使用します:', error);
    // デフォルト値を返す
    if (type === 'admin') {
      return {
        enabled: true,
        fromName: '六本松矯正歯科クリニックとよしま予約システム',
        fromEmail: '489@489.toyoshima-do.com',
        toEmail: '489@489.toyoshima-do.com',
        subjectTemplate: '新規予約 - {patient_name}様からの予約申込み',
        contentTemplate: '',
      };
    }
    return {
      enabled: true,
      fromName: '六本松矯正歯科クリニックとよしま',
      fromEmail: '489@489.toyoshima-do.com',
      subjectTemplate: '予約受付完了 - {patient_name}様の予約を受け付けました',
      contentTemplate: '',
    };
  }
};

// テンプレート変数を置換
const replaceTemplateVariables = (template: string, data: AppointmentEmailRequest & { cancelToken?: string; rebookToken?: string }, formatPreferredDateTime: (date: string, timeSlot: string) => string) => {
  const preferredDatesHtml = data.preferredDates.map((pref, index) => 
    `<p style="margin: 5px 0;"><strong>第${index + 1}希望:</strong> ${formatPreferredDateTime(pref.date, pref.timeSlot)}</p>`
  ).join('');

  return template
    .replace(/{patient_name}/g, data.patientName)
    .replace(/{patient_email}/g, data.patientEmail)
    .replace(/{phone}/g, data.phone)
    .replace(/{treatment_name}/g, data.treatmentName)
    .replace(/{fee}/g, data.fee.toLocaleString())
    .replace(/{preferred_dates}/g, preferredDatesHtml)
    .replace(/{notes}/g, data.notes || '')
    .replace(/{clinic_name}/g, '六本松矯正歯科クリニックとよしま')
    .replace(/{clinic_phone}/g, '092-406-2119')
    .replace(/{clinic_email}/g, '489@489.toyoshima-do.com');
};

export const sendAppointmentEmails = async (data: AppointmentEmailRequest & { cancelToken?: string; rebookToken?: string }) => {
  console.log("予約確認メール送信開始:", { patientName: data.patientName, patientEmail: data.patientEmail, preferredDates: data.preferredDates });

  // Resend APIキーの確認
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("❌ RESEND_API_KEYが設定されていません");
    throw new Error("メール送信の設定が完了していません。管理者にお問い合わせください。");
  }

  // システム設定からメール設定を取得
  const patientSettings = await getEmailSettings('patient');
  const adminSettings = await getEmailSettings('admin');

  // 患者様への確認メール生成
  let confirmationEmailHtml: string;
  if (patientSettings.contentTemplate) {
    confirmationEmailHtml = replaceTemplateVariables(patientSettings.contentTemplate, data, formatPreferredDateTime);
  } else {
    // デフォルトテンプレートを使用
    confirmationEmailHtml = generatePatientConfirmationEmail(data, formatPreferredDateTime);
  }

  // 管理者への通知メール生成
  let adminNotificationHtml: string;
  if (adminSettings.contentTemplate) {
    adminNotificationHtml = replaceTemplateVariables(adminSettings.contentTemplate, data, formatPreferredDateTime);
  } else {
    // デフォルトテンプレートを使用
    adminNotificationHtml = generateAdminNotificationEmail(data, formatPreferredDateTime);
  }

  // 件名の変数置換
  const patientSubject = patientSettings.subjectTemplate
    .replace(/{patient_name}/g, data.patientName)
    .replace(/{treatment_name}/g, data.treatmentName);
  const adminSubject = adminSettings.subjectTemplate
    .replace(/{patient_name}/g, data.patientName)
    .replace(/{treatment_name}/g, data.treatmentName);

  // 患者様への確認メール送信（設定で有効な場合のみ）
  let patientEmailResponse = null;
  if (patientSettings.enabled) {
    console.log(`📧 患者様メール送信開始: ${data.patientEmail}`);
    patientEmailResponse = await resend.emails.send({
      from: `${patientSettings.fromName} <${patientSettings.fromEmail}>`,
      to: [data.patientEmail],
      subject: patientSubject,
      html: confirmationEmailHtml,
    });

    console.log("患者様確認メール送信結果:", {
      success: !!patientEmailResponse.data?.id,
      emailId: patientEmailResponse.data?.id,
      error: patientEmailResponse.error
    });

    // 患者様メール送信エラーチェック
    if (patientEmailResponse.error) {
      console.error("❌ 患者様メール送信エラー:", patientEmailResponse.error);
      throw new Error(`患者様へのメール送信に失敗しました: ${JSON.stringify(patientEmailResponse.error)}`);
    }

    if (!patientEmailResponse.data?.id) {
      console.error("❌ 患者様メール送信失敗: レスポンスにIDがありません");
      throw new Error("患者様へのメール送信に失敗しました");
    }
  } else {
    console.log("⚠️ 患者様への自動返信メールは無効になっています");
  }

  // 管理者への通知メール送信（設定で有効な場合のみ）
  let adminEmailResponse = null;
  if (adminSettings.enabled) {
    console.log(`📧 管理者メール送信開始: ${adminSettings.toEmail}`);
    adminEmailResponse = await resend.emails.send({
      from: `${adminSettings.fromName} <${adminSettings.fromEmail}>`,
      to: [adminSettings.toEmail],
      subject: adminSubject,
      html: adminNotificationHtml,
    });

    console.log("管理者通知メール送信結果:", {
      success: !!adminEmailResponse.data?.id,
      emailId: adminEmailResponse.data?.id,
      error: adminEmailResponse.error
    });

    // 管理者メール送信エラーチェック（警告のみ、患者様メールが成功していれば続行）
    if (adminEmailResponse.error) {
      console.warn("⚠️ 管理者メール送信エラー:", adminEmailResponse.error);
    }
  } else {
    console.log("⚠️ 管理者への通知メールは無効になっています");
  }

  return {
    patientEmailId: patientEmailResponse?.data?.id || null,
    adminEmailId: adminEmailResponse?.data?.id || null,
    patientSuccess: !!patientEmailResponse?.data?.id,
    adminSuccess: !!adminEmailResponse?.data?.id,
    errors: {
      patient: patientEmailResponse?.error || null,
      admin: adminEmailResponse?.error || null
    }
  };
};
