// supabase/functions/complete-onboarding/index.ts
// Atomic onboarding sync: creates profile + first cycle + trial subscription row.
// Called once immediately after Clerk sign-up. Idempotent — safe to call again on retry.
// HARD RULE: trial_end is set here (server-side), never via PayPal trial billing.

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

    // Verify Clerk JWT (platform verify_jwt is disabled — Clerk tokens are not Supabase JWTs).
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

    // Service-role client bypasses RLS for the initial atomic insert
    // (user has no profiles row yet, so RLS would block a regular-client write)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ── Idempotency check ─────────────────────────────────────────────────────
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id, onboarding_completed')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (existing?.onboarding_completed) {
      return new Response(JSON.stringify({ success: true, message: 'Already onboarded' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const pendingData = body.pendingData;
    const {
      userName = '',
      email = '',
      cycleLengthDays = 28,
      periodLengthDays = 5,
      lutealPhaseDays = 14,
      lastPeriodStartDate,
      temperatureUnit = 'Celsius',
      weightUnit = 'kg',
      selectedGoal = 'PERIOD',
      baselineHealth = {},
    } = pendingData ?? {};

    // ── 1. Upsert profile ─────────────────────────────────────────────────────
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          clerk_user_id: clerkUserId,
          user_name: userName,
          email,
          onboarding_completed: true,
          cycle_length_days: cycleLengthDays,
          period_length_days: periodLengthDays,
          luteal_phase_days: lutealPhaseDays,
          last_period_start: lastPeriodStartDate || null,
          temperature_unit: temperatureUnit,
          weight_unit: weightUnit,
          selected_goal: selectedGoal,
          weight: baselineHealth.weight || null,
          height_cm: baselineHealth.heightCm || null,
          height_feet: baselineHealth.heightFeet || null,
          height_inches: baselineHealth.heightInches || null,
          height_unit: baselineHealth.heightUnit || 'cm',
          age: baselineHealth.age || null,
          cycle_regularity: baselineHealth.cycleRegularity || 'Regular',
          primary_goals: baselineHealth.primaryGoals || [],
          typical_symptoms: baselineHealth.typicalSymptoms || [],
          sleep_hours_baseline: baselineHealth.sleepHoursBaseline || null,
          activity_level: baselineHealth.activityLevel || 'Moderately Active',
          birth_control_method: baselineHealth.birthControlMethod || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'clerk_user_id' }
      );

    if (profileError) throw profileError;

    // ── 2. Create initial cycle record if we have a last period date ───────────
    if (lastPeriodStartDate) {
      const { error: cycleError } = await supabaseAdmin
        .from('cycles')
        .upsert(
          {
            clerk_user_id: clerkUserId,
            cycle_number: 1,
            start_date: lastPeriodStartDate,
            period_length: periodLengthDays,
          },
          { onConflict: 'clerk_user_id, cycle_number', ignoreDuplicates: true }
        );

      // Non-fatal: cycle insert failure shouldn't block onboarding
      if (cycleError) console.error('Cycle insert warning:', cycleError);
    }

    // ── 3. Create trial subscription (ONE PER USER — never overwrite) ─────────
    // trial_end = exactly 1 calendar month from now.
    const trialEnd = new Date();
    trialEnd.setMonth(trialEnd.getMonth() + 1);

    // Only insert if no subscription row exists yet (guards against re-onboarding).
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .limit(1);

    if (!existingSub || existingSub.length === 0) {
      const { error: subError } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          clerk_user_id: clerkUserId,
          plan_type: 'monthly',      // placeholder until user picks a plan
          status: 'trialing',
          trial_end: trialEnd.toISOString(),
        });
      if (subError) console.error('Subscription trial insert warning:', subError);
    }

    // ── 4. Default notification preferences ────────────────────────────────────
    await supabaseAdmin
      .from('notification_preferences')
      .upsert(
        {
          clerk_user_id: clerkUserId,
          period_reminders: true,
          fertile_window_alerts: true,
          daily_log_prompt: true,
        },
        { onConflict: 'clerk_user_id', ignoreDuplicates: true }
      );

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('complete-onboarding error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
