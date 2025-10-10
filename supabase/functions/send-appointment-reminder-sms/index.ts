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
  confirmed_date: string | null;
  confirmed_time_slot: string | null;
  treatment_name: string | null;
  email: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // リマインダー設定を取得
    const { data: reminderSettings, error: settingsError } = await supabase
      .from('reminder_settings')
      .select('*')
      .eq('enabled', true)
      .in('reminder_type', ['sms', 'both']);

    if (settingsError) {
      throw settingsError;
    }

    if (!reminderSettings || reminderSettings.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active SMS reminder settings found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    let totalSent = 0;
    let totalErrors = 0;

    // 各リマインダー設定について処理
    for (const setting of reminderSettings) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + setting.days_before);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      // 対象の予約を取得
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'confirmed')
        .eq('confirmed_date', targetDateStr) as { data: Appointment[] | null; error: any };

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        continue;
      }

      if (!appointments || appointments.length === 0) {
        continue;
      }

      // 各予約に対してリマインダーを送信
      for (const appointment of appointments) {
        // すでにこの設定でリマインダーを送信済みかチェック
        const { data: existingReminder } = await supabase
          .from('sent_reminders')
          .select('id')
          .eq('appointment_id', appointment.id)
          .eq('reminder_setting_id', setting.id)
          .eq('reminder_type', 'sms')
          .single();

        if (existingReminder) {
          console.log(`SMS reminder already sent for appointment ${appointment.id}`);
          continue;
        }

        // メッセージをカスタマイズ
        const message = (setting.message_template || 'ご予約のリマインダーです。')
          .replace('{name}', appointment.patient_name)
          .replace('{date}', appointment.confirmed_date || '')
          .replace('{time}', appointment.confirmed_time_slot || '')
          .replace('{treatment}', appointment.treatment_name || '診察');

        // SMS送信
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
            // 送信履歴を記録
            await supabase.from('sent_reminders').insert({
              appointment_id: appointment.id,
              reminder_setting_id: setting.id,
              reminder_type: 'sms',
              status: 'sent',
            });
            totalSent++;
          } else {
            const errorData = await smsResponse.json();
            await supabase.from('sent_reminders').insert({
              appointment_id: appointment.id,
              reminder_setting_id: setting.id,
              reminder_type: 'sms',
              status: 'failed',
              error_message: errorData.error || 'Unknown error',
            });
            totalErrors++;
          }
        } catch (error) {
          console.error(`Error sending SMS for appointment ${appointment.id}:`, error);
          await supabase.from('sent_reminders').insert({
            appointment_id: appointment.id,
            reminder_setting_id: setting.id,
            reminder_type: 'sms',
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          });
          totalErrors++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `SMS reminders processed. Sent: ${totalSent}, Errors: ${totalErrors}`,
        sent: totalSent,
        errors: totalErrors,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-appointment-reminder-sms:', error);
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



