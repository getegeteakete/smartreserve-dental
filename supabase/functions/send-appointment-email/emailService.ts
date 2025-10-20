
import { Resend } from "npm:resend@2.0.0";
import { generatePatientConfirmationEmail, generateAdminNotificationEmail } from "./emailTemplates.ts";
import { formatPreferredDateTime } from "./dateFormatter.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

export const sendAppointmentEmails = async (data: AppointmentEmailRequest & { cancelToken?: string; rebookToken?: string }) => {
  console.log("予約確認メール送信開始:", { patientName: data.patientName, patientEmail: data.patientEmail, preferredDates: data.preferredDates });

  // 患者様への確認メール
  const confirmationEmailHtml = generatePatientConfirmationEmail(data, formatPreferredDateTime);

  // 管理者への通知メール
  const adminNotificationHtml = generateAdminNotificationEmail(data, formatPreferredDateTime);

  // 患者様への確認メール送信
  const patientEmailResponse = await resend.emails.send({
    from: "六本松矯正歯科クリニックとよしま <489@489.toyoshima-do.com>",
    to: [data.patientEmail],
    subject: `予約受付完了 - ${data.patientName}様の予約を受け付けました`,
    html: confirmationEmailHtml,
  });

  console.log("患者様確認メール送信結果:", patientEmailResponse);

  // 管理者への通知メール送信
  const adminEmailResponse = await resend.emails.send({
    from: "六本松矯正歯科クリニックとよしま予約システム <489@489.toyoshima-do.com>",
    to: ["489@489.toyoshima-do.com"],
    subject: `新規予約 - ${data.patientName}様からの予約申込み`,
    html: adminNotificationHtml,
  });

  console.log("管理者通知メール送信結果:", adminEmailResponse);

  return {
    patientEmailId: patientEmailResponse.data?.id,
    adminEmailId: adminEmailResponse.data?.id
  };
};
