import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentIntentRequest {
  amount: number;
  appointmentId: string;
  patientName: string;
  email: string;
  treatmentName: string;
}

serve(async (req) => {
  // CORS対応
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount, appointmentId, patientName, email, treatmentName }: PaymentIntentRequest = await req.json();

    // 金額のバリデーション
    if (!amount || amount < 50) {
      throw new Error('金額は50円以上である必要があります');
    }

    // Payment Intentの作成
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'jpy',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        appointmentId,
        patientName,
        treatmentName,
      },
      description: `${treatmentName} - ${patientName}様`,
      receipt_email: email,
    });

    // Supabaseに決済情報を保存
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const paymentData = {
      appointment_id: appointmentId,
      stripe_payment_intent_id: paymentIntent.id,
      amount: amount,
      currency: 'jpy',
      status: paymentIntent.status,
      metadata: {
        patientName,
        treatmentName,
      },
    };

    const saveResponse = await fetch(`${supabaseUrl}/rest/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(paymentData),
    });

    if (!saveResponse.ok) {
      console.error('Failed to save payment:', await saveResponse.text());
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});



