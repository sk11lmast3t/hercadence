// supabase/functions/get-entitlement/index.ts
// Returns the user's premium entitlement status.
// Server-side truth — never trust a frontend boolean.
//
// Entitlement rules (per spec §4):
//   (status='trialing' AND trial_end > now())
//   OR (plan_type='lifetime' AND status='active')
//   OR (plan_type='monthly' AND status IN ('active','canceled') AND current_period_end > now())

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyClerkToken } from '../_shared/clerkAuth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { data: subscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('plan_type, status, trial_end, current_period_end, canceled_at')
      .eq('clerk_user_id', clerkUserId);

    let isPremium = false;
    let planType: string | null = null;
    let expiresAt: string | null = null;
    let currentStatus = 'none';
    const now = new Date();

    if (subscriptions && subscriptions.length > 0) {
      for (const sub of subscriptions) {
        currentStatus = sub.status;

        // ── Trial: server-managed, no PayPal required ──────────────────────────
        if (
          sub.status === 'trialing' &&
          sub.trial_end &&
          new Date(sub.trial_end) > now
        ) {
          isPremium = true;
          planType = 'trial';
          expiresAt = sub.trial_end;
          break; // trial takes priority — short-circuit
        }

        // ── Lifetime: never expires ────────────────────────────────────────────
        if (sub.plan_type === 'lifetime' && sub.status === 'active') {
          isPremium = true;
          planType = 'lifetime';
          expiresAt = null;
          break;
        }

        // ── Monthly active ────────────────────────────────────────────────────
        if (
          sub.plan_type === 'monthly' &&
          sub.status === 'active' &&
          sub.current_period_end &&
          new Date(sub.current_period_end) > now
        ) {
          isPremium = true;
          planType = 'monthly';
          expiresAt = sub.current_period_end;
        }

        // ── Monthly canceled — retains access until period end ─────────────────
        if (
          sub.plan_type === 'monthly' &&
          sub.status === 'canceled' &&
          sub.current_period_end &&
          new Date(sub.current_period_end) > now
        ) {
          isPremium = true;
          planType = 'monthly';
          expiresAt = sub.current_period_end;
        }
      }
    } else {
      // ── New User / Onboarding In-Progress Guard ────────────────────────────
      // If genuinely no subscription row exists at all, this is a fresh user
      // whose onboarding is in progress or who needs their 30-day trial.
      // Auto-provision trial row idempotently so they are never falsely blocked.
      const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await supabaseAdmin.from('subscriptions').upsert(
        {
          clerk_user_id: clerkUserId,
          status: 'trialing',
          trial_end: trialEnd.toISOString(),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'clerk_user_id', ignoreDuplicates: true }
      );
      isPremium = true;
      planType = 'trial';
      expiresAt = trialEnd.toISOString();
      currentStatus = 'trialing';
    }

    return new Response(
      JSON.stringify({ isPremium, planType, expiresAt, status: currentStatus }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('get-entitlement error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
