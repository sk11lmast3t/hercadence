// supabase/functions/paypal-create-subscription/index.ts
// Creates a PayPal recurring subscription for $5.00/month.
// Called ONLY when the user actively chooses to pay — NEVER during onboarding/trial.
// Trial is granted by complete-onboarding (status='trialing', trial_end = now()+1month).
// This function never starts a PayPal trial billing cycle.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyClerkToken } from '../_shared/clerkAuth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const secret = Deno.env.get('PAYPAL_SECRET');
  const environment = Deno.env.get('PAYPAL_ENV') || 'sandbox';

  const baseUrl = environment === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

  const auth = btoa(`${clientId}:${secret}`);
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    throw new Error(`Failed to get PayPal token: ${res.statusText}`);
  }

  const data = await res.json();
  return data.access_token;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let clerkUserId: string;
    try {
      const verified = await verifyClerkToken(authHeader);
      clerkUserId = verified.clerkUserId;
    } catch (e) {
      return new Response(JSON.stringify({ error: (e as Error).message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Standard $5/month plan — no trial billing cycle ever goes through PayPal.
    // The free trial is handled entirely by complete-onboarding + trial_end column.
    const planId = Deno.env.get('PAYPAL_MONTHLY_PLAN_ID');
    if (!planId) {
      return new Response(
        JSON.stringify({ error: 'PAYPAL_MONTHLY_PLAN_ID env var not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paypalToken = await getPayPalAccessToken();
    const environment = Deno.env.get('PAYPAL_ENV') || 'sandbox';
    const baseUrl = environment === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    // Create PayPal subscription — no trial cycle, immediate billing start
    const subRes = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paypalToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: clerkUserId, // echoed back in webhooks for user identification
        subscriber: {
          name: { given_name: 'HerCadence', surname: 'User' },
        },
        application_context: {
          brand_name: 'HerCadence Period Tracker',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: 'https://hercadence.app/billing/success',
          cancel_url: 'https://hercadence.app/billing/cancel',
        },
      }),
    });

    const subData = await subRes.json();

    if (!subRes.ok) {
      console.error('PayPal subscription creation failed:', subData);
      return new Response(
        JSON.stringify({ error: subData.message || 'PayPal subscription creation failed' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record pending subscription in database.
    // Status stays 'pending' until BILLING.SUBSCRIPTION.ACTIVATED webhook fires.
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await supabaseAdmin.from('subscriptions').insert({
      clerk_user_id: clerkUserId,
      plan_type: 'monthly',
      status: 'pending',
      paypal_subscription_id: subData.id,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    });

    return new Response(
      JSON.stringify({
        subscriptionId: subData.id,
        approvalUrl: subData.links?.find((l: any) => l.rel === 'approve')?.href,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('paypal-create-subscription error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
