import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // イベントタイプに応じた処理
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // 決済情報の更新
        await fetch(`${supabaseUrl}/rest/v1/payments?stripe_payment_intent_id=eq.${paymentIntent.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            status: 'succeeded',
            stripe_charge_id: paymentIntent.latest_charge,
            receipt_url: paymentIntent.charges?.data[0]?.receipt_url || null,
            updated_at: new Date().toISOString(),
          }),
        });

        // 予約のステータスをconfirmedに更新
        const appointmentId = paymentIntent.metadata.appointmentId;
        if (appointmentId) {
          await fetch(`${supabaseUrl}/rest/v1/appointments?id=eq.${appointmentId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              status: 'confirmed',
            }),
          });

          // 決済完了通知メールを送信
          await fetch(`${supabaseUrl}/functions/v1/send-payment-confirmation-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              appointmentId,
              paymentIntentId: paymentIntent.id,
            }),
          });
        }
        
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // 決済情報の更新
        await fetch(`${supabaseUrl}/rest/v1/payments?stripe_payment_intent_id=eq.${paymentIntent.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            status: 'failed',
            error_message: paymentIntent.last_payment_error?.message || 'Payment failed',
            updated_at: new Date().toISOString(),
          }),
        });
        
        console.log('Payment failed:', paymentIntent.id);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        
        // 決済情報の更新
        await fetch(`${supabaseUrl}/rest/v1/payments?stripe_charge_id=eq.${charge.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            status: 'refunded',
            updated_at: new Date().toISOString(),
          }),
        });
        
        console.log('Charge refunded:', charge.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400 }
    );
  }
});



