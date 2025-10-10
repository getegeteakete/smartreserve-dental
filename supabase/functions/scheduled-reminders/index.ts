import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  email: string | null;
  confirmed_date: string | null;
  confirmed_time_slot: string | null;
  treatment_name: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 有効なリマインダー設定を取得
    const { data: reminderSettings, error: settingsError } = await supabase
      .from('reminder_settings')
      .select('*')
      .eq('enabled', true)
      .order('days_before', { ascending: false });

    if (settingsError) {
      throw settingsError;
    }

    if (!reminderSettings || reminderSettings.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active reminder settings found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    let totalEmailsSent = 0;
    let totalSmsSent = 0;
    let totalErrors = 0;

    // 各リマインダー設定について処理
    for (const setting of reminderSettings) {
      // 対象日を計算
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + setting.days_before);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      console.log(`Processing reminders for ${targetDateStr} (${setting.days_before} days before)`);

      // 対象の予約を取得
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'confirmed')
        .eq('confirmed_date', targetDateStr) as { data: Appointment[] | null; error: any };

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        totalErrors++;
        continue;
      }

      if (!appointments || appointments.length === 0) {
        console.log(`No appointments found for ${targetDateStr}`);
        continue;
      }

      console.log(`Found ${appointments.length} appointments for ${targetDateStr}`);

      // 各予約に対してリマインダーを送信
      for (const appointment of appointments) {
        // すでに送信済みかチェック
        const { data: existingReminders } = await supabase
          .from('sent_reminders')
          .select('id, reminder_type')
          .eq('appointment_id', appointment.id)
          .eq('reminder_setting_id', setting.id);

        const alreadySentEmail = existingReminders?.some(r => r.reminder_type === 'email');
        const alreadySentSms = existingReminders?.some(r => r.reminder_type === 'sms');

        // メッセージをカスタマイズ
        const message = (setting.message_template || 'ご予約のリマインダーです。')
          .replace('{name}', appointment.patient_name)
          .replace('{date}', appointment.confirmed_date || '')
          .replace('{time}', appointment.confirmed_time_slot || '')
          .replace('{treatment}', appointment.treatment_name || '診察');

        // メール送信
        if ((setting.reminder_type === 'email' || setting.reminder_type === 'both') && 
            !alreadySentEmail && 
            appointment.email) {
          try {
            const emailResponse = await fetch(
              `${supabaseUrl}/functions/v1/send-reminder-emails`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                },
                body: JSON.stringify({
                  appointmentId: appointment.id,
                  customMessage: message,
                }),
              }
            );

            if (emailResponse.ok) {
              await supabase.from('sent_reminders').insert({
                appointment_id: appointment.id,
                reminder_setting_id: setting.id,
                reminder_type: 'email',
                status: 'sent',
              });
              totalEmailsSent++;
              console.log(`Email reminder sent for appointment ${appointment.id}`);
            } else {
              const errorData = await emailResponse.text();
              await supabase.from('sent_reminders').insert({
                appointment_id: appointment.id,
                reminder_setting_id: setting.id,
                reminder_type: 'email',
                status: 'failed',
                error_message: errorData,
              });
              totalErrors++;
              console.error(`Failed to send email for appointment ${appointment.id}`);
            }
          } catch (error) {
            console.error(`Error sending email for appointment ${appointment.id}:`, error);
            totalErrors++;
          }
        }

        // SMS送信
        if ((setting.reminder_type === 'sms' || setting.reminder_type === 'both') && 
            !alreadySentSms) {
          try {
            const smsResponse = await fetch(
              `${supabaseUrl}/functions/v1/send-sms`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                },
                body: JSON.stringify({
                  phoneNumber: appointment.phone,
                  message: message,
                  appointmentId: appointment.id,
                  purpose: 'reminder',
                }),
              }
            );

            if (smsResponse.ok) {
              await supabase.from('sent_reminders').insert({
                appointment_id: appointment.id,
                reminder_setting_id: setting.id,
                reminder_type: 'sms',
                status: 'sent',
              });
              totalSmsSent++;
              console.log(`SMS reminder sent for appointment ${appointment.id}`);
            } else {
              const errorData = await smsResponse.text();
              await supabase.from('sent_reminders').insert({
                appointment_id: appointment.id,
                reminder_setting_id: setting.id,
                reminder_type: 'sms',
                status: 'failed',
                error_message: errorData,
              });
              totalErrors++;
              console.error(`Failed to send SMS for appointment ${appointment.id}`);
            }
          } catch (error) {
            console.error(`Error sending SMS for appointment ${appointment.id}:`, error);
            totalErrors++;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Reminders processed successfully`,
        emailsSent: totalEmailsSent,
        smsSent: totalSmsSent,
        errors: totalErrors,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in scheduled-reminders:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});



