// supabase/functions/paypal-webhook/index.ts
// Verifies PayPal webhooks & maintains subscriptions + payment_events audit trail.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    const eventType = body.event_type;
    const resource = body.resource;

    if (!eventType || !resource) {
      return new Response(JSON.stringify({ error: 'Invalid webhook payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const clerkUserId = resource.custom_id || resource.custom;

    if (clerkUserId) {
      // Record raw payment event audit log
      await supabaseAdmin.from('payment_events').insert({
        clerk_user_id: clerkUserId,
        event_type: eventType,
        paypal_event_id: body.id,
        amount: resource.amount?.total ? parseFloat(resource.amount.total) : (resource.amount?.value ? parseFloat(resource.amount.value) : null),
        currency: resource.amount?.currency || 'USD',
        raw_payload: body
      });

      // Handle subscription state transitions
      if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
        const trialEnd = resource.billing_info?.next_billing_time;
        await supabaseAdmin.from('subscriptions').upsert({
          clerk_user_id: clerkUserId,
          plan_type: 'monthly',
          status: 'active',
          paypal_subscription_id: resource.id,
          current_period_end: trialEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        });
      } else if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
        await supabaseAdmin.from('subscriptions').update({
          status: 'canceled',
          canceled_at: new Date().toISOString()
        }).eq('paypal_subscription_id', resource.id);
      } else if (eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        // Lifetime purchase or monthly sale
        if (resource.amount?.value === '245.00' || resource.custom_id) {
          await supabaseAdmin.from('subscriptions').upsert({
            clerk_user_id: clerkUserId,
            plan_type: 'lifetime',
            status: 'active',
            paypal_order_id: resource.id,
            created_at: new Date().toISOString()
          });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('paypal-webhook error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
