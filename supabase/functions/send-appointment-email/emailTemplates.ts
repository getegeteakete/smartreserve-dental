
interface AppointmentEmailData {
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
  cancelToken?: string;
  rebookToken?: string;
}

export const generatePatientConfirmationEmail = (data: AppointmentEmailData, formatPreferredDateTime: (date: string, timeSlot: string) => string): string => {
  const { patientName, patientEmail, phone, treatmentName, fee, preferredDates, notes, cancelToken, rebookToken } = data;

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
        ${preferredDates.map((pref, index) => `
          <p style="margin: 5px 0;"><strong>第${index + 1}希望:</strong> ${formatPreferredDateTime(pref.date, pref.timeSlot)}</p>
        `).join('')}
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
      
      ${cancelToken || rebookToken ? `
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #374151;">予約の変更・キャンセルについて</h4>
          <p style="margin: 10px 0;">予約の確定前であれば、以下のリンクから変更・キャンセルが可能です：</p>
          <div style="margin: 15px 0;">
            ${rebookToken ? `
              <a href="https://ebuweyxsblraqhesdmvd.supabase.co/rebook?token=${rebookToken}" 
                 style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin: 5px;">
                📅 再予約・日時変更
              </a>
            ` : ''}
            ${cancelToken ? `
              <a href="https://ebuweyxsblraqhesdmvd.supabase.co/cancel?token=${cancelToken}" 
                 style="display: inline-block; background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin: 5px;">
                ❌ 予約キャンセル
              </a>
            ` : ''}
          </div>
          <p style="font-size: 12px; color: #6b7280;">※ これらのリンクは24時間有効で、一度のみ使用可能です</p>
        </div>
      ` : ''}
      
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

export const generateAdminNotificationEmail = (data: AppointmentEmailData, formatPreferredDateTime: (date: string, timeSlot: string) => string): string => {
  const { patientName, patientEmail, phone, treatmentName, fee, preferredDates, notes } = data;

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
        ${preferredDates.map((pref, index) => `
          <p style="margin: 5px 0;"><strong>第${index + 1}希望:</strong> ${formatPreferredDateTime(pref.date, pref.timeSlot)}</p>
        `).join('')}
      </div>
      
      <p>スケジュールを確認し、予約を確定してください。</p>
      <p>確定後は患者様に確定メールを送信してください。</p>
    </div>
  `;
};
