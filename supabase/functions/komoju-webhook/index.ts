import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const event = await req.json()
    console.log('KOMOJU Webhook received:', event.type)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // イベントタイプに応じて処理
    switch (event.type) {
      case 'payment.captured':
      case 'payment.authorized': {
        // 決済成功
        const payment = event.data
        const sessionId = payment.session
        const appointmentId = payment.metadata?.appointment_id

        console.log('Payment successful:', {
          sessionId,
          appointmentId,
          amount: payment.amount,
          status: payment.status,
        })

        // payment_sessionsテーブルを更新
        const { error: updateSessionError } = await supabaseClient
          .from('payment_sessions')
          .update({
            status: 'completed',
            payment_method: payment.payment_method_type,
            payment_details: payment,
            updated_at: new Date().toISOString(),
          })
          .eq('session_id', sessionId)

        if (updateSessionError) {
          console.error('Error updating payment session:', updateSessionError)
        }

        // 予約を確定
        if (appointmentId) {
          const { error: updateAppointmentError } = await supabaseClient
            .from('appointments')
            .update({
              status: 'confirmed',
              payment_status: 'paid',
              updated_at: new Date().toISOString(),
            })
            .eq('id', appointmentId)

          if (updateAppointmentError) {
            console.error('Error updating appointment:', updateAppointmentError)
          } else {
            console.log('Appointment confirmed:', appointmentId)

            // 予約確定メールを送信（オプション）
            try {
              await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-confirmation-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                },
                body: JSON.stringify({
                  appointmentId: appointmentId,
                  type: 'payment_confirmed',
                }),
              })
            } catch (emailError) {
              console.error('Error sending confirmation email:', emailError)
            }
          }
        }
        break
      }

      case 'payment.failed':
      case 'payment.cancelled': {
        // 決済失敗・キャンセル
        const payment = event.data
        const sessionId = payment.session
        const appointmentId = payment.metadata?.appointment_id

        console.log('Payment failed/cancelled:', {
          sessionId,
          appointmentId,
          status: payment.status,
        })

        // payment_sessionsテーブルを更新
        const { error: updateSessionError } = await supabaseClient
          .from('payment_sessions')
          .update({
            status: event.type === 'payment.failed' ? 'failed' : 'cancelled',
            payment_details: payment,
            updated_at: new Date().toISOString(),
          })
          .eq('session_id', sessionId)

        if (updateSessionError) {
          console.error('Error updating payment session:', updateSessionError)
        }

        // 予約ステータスを更新
        if (appointmentId) {
          const { error: updateAppointmentError } = await supabaseClient
            .from('appointments')
            .update({
              payment_status: event.type === 'payment.failed' ? 'failed' : 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', appointmentId)

          if (updateAppointmentError) {
            console.error('Error updating appointment:', updateAppointmentError)
          }
        }
        break
      }

      case 'payment.refunded': {
        // 返金処理
        const payment = event.data
        const sessionId = payment.session
        const appointmentId = payment.metadata?.appointment_id

        console.log('Payment refunded:', {
          sessionId,
          appointmentId,
          amount: payment.amount,
        })

        // payment_sessionsテーブルを更新
        const { error: updateSessionError } = await supabaseClient
          .from('payment_sessions')
          .update({
            status: 'refunded',
            payment_details: payment,
            updated_at: new Date().toISOString(),
          })
          .eq('session_id', sessionId)

        if (updateSessionError) {
          console.error('Error updating payment session:', updateSessionError)
        }

        // 予約ステータスを更新
        if (appointmentId) {
          const { error: updateAppointmentError } = await supabaseClient
            .from('appointments')
            .update({
              payment_status: 'refunded',
              updated_at: new Date().toISOString(),
            })
            .eq('id', appointmentId)

          if (updateAppointmentError) {
            console.error('Error updating appointment:', updateAppointmentError)
          }
        }
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

