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
    const {
      amount,
      currency = 'JPY',
      appointmentId,
      patientName,
      email,
      treatmentName,
      return_url,
      cancel_url,
    } = await req.json()

    console.log('Creating KOMOJU session:', {
      amount,
      currency,
      appointmentId,
      patientName,
      email,
      treatmentName,
    })

    // KOMOJUのシークレットキーを環境変数から取得
    const komojuSecretKey = Deno.env.get('KOMOJU_SECRET_KEY')
    if (!komojuSecretKey) {
      throw new Error('KOMOJU_SECRET_KEY is not configured')
    }

    // KOMOJU APIでセッションを作成
    const komojuResponse = await fetch('https://komoju.com/api/v1/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(komojuSecretKey + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        currency: currency,
        return_url: return_url,
        cancel_url: cancel_url,
        default_locale: 'ja',
        payment_methods: ['credit_card', 'konbini', 'bank_transfer'],
        metadata: {
          appointment_id: appointmentId,
          patient_name: patientName,
          treatment_name: treatmentName,
        },
        email: email,
      }),
    })

    if (!komojuResponse.ok) {
      const errorData = await komojuResponse.json()
      console.error('KOMOJU API error:', errorData)
      throw new Error(`KOMOJU API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const sessionData = await komojuResponse.json()
    console.log('KOMOJU session created:', sessionData.id)

    // Supabaseに決済セッション情報を保存
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: insertError } = await supabaseClient
      .from('payment_sessions')
      .insert({
        session_id: sessionData.id,
        appointment_id: appointmentId,
        amount: amount,
        currency: currency,
        status: 'pending',
        payment_method: null,
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('Error saving payment session:', insertError)
      // エラーをログに記録するが、処理は続行
    }

    return new Response(
      JSON.stringify({
        sessionId: sessionData.id,
        sessionUrl: sessionData.session_url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
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

