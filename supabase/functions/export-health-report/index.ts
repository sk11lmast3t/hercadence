// supabase/functions/export-health-report/index.ts
// Gathers user health data into a structured JSON report with clinical disclaimer.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DISCLAIMER =
  'This report is generated from self-reported data and statistical estimates. ' +
  'It is not a medical document. Consult your healthcare provider for clinical decisions.';

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

    const token = authHeader.replace('Bearer ', '');
    const payload = JSON.parse(atob(token.split('.')[1]));
    const clerkUserId = payload.sub;

    if (!clerkUserId) {
      return new Response(JSON.stringify({ error: 'Invalid JWT' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const {
      includeCycleHistory = true,
      includeSymptoms = true,
      includeMedications = true,
      includeDoctorsNotes = false,
    } = body;

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const report: Record<string, unknown> = {
      generatedAt: new Date().toISOString(),
      disclaimer: DISCLAIMER,
    };

    // Profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('user_name, cycle_length_days, period_length_days, luteal_phase_days, last_period_start, temperature_unit, weight, height_cm, age, birth_date, cycle_regularity, activity_level')
      .eq('clerk_user_id', clerkUserId)
      .single();
    report.profile = profile;

    // Cycle history
    if (includeCycleHistory) {
      const { data: cycles } = await supabaseAdmin
        .from('cycles')
        .select('start_date, end_date, cycle_length, period_length, ovulation_date, notes')
        .eq('clerk_user_id', clerkUserId)
        .order('start_date', { ascending: false })
        .limit(24);
      report.cycleHistory = cycles;
    }

    // Symptoms / daily logs
    if (includeSymptoms) {
      const { data: logs } = await supabaseAdmin
        .from('daily_logs')
        .select('log_date, flow_level, moods, symptoms, bbt_celsius, cervical_mucus, intimacy, notes')
        .eq('clerk_user_id', clerkUserId)
        .order('log_date', { ascending: false })
        .limit(180);
      report.dailyLogs = logs;

      const { data: observations } = await supabaseAdmin
        .from('ovulation_observations')
        .select('observed_date, test_type, result')
        .eq('clerk_user_id', clerkUserId)
        .order('observed_date', { ascending: false })
        .limit(60);
      report.ovulationObservations = observations;
    }

    // Medications
    if (includeMedications) {
      const { data: meds } = await supabaseAdmin
        .from('medications')
        .select('name, dosage, frequency, is_active')
        .eq('clerk_user_id', clerkUserId);
      report.medications = meds;

      const { data: supplements } = await supabaseAdmin
        .from('supplements')
        .select('name, dosage, is_active')
        .eq('clerk_user_id', clerkUserId);
      report.supplements = supplements;
    }

    // Body metrics
    const { data: bodyMetrics } = await supabaseAdmin
      .from('body_metrics')
      .select('measured_date, weight, waist_cm, hip_cm, body_fat_pct')
      .eq('clerk_user_id', clerkUserId)
      .order('measured_date', { ascending: false })
      .limit(90);
    report.bodyMetrics = bodyMetrics;

    // Doctors notes (appointments)
    if (includeDoctorsNotes) {
      const { data: appointments } = await supabaseAdmin
        .from('appointments')
        .select('appointment_date, doctor_name, specialty, notes, status')
        .eq('clerk_user_id', clerkUserId)
        .order('appointment_date', { ascending: false })
        .limit(20);
      report.appointments = appointments;
    }

    return new Response(
      JSON.stringify({ report }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('export-health-report error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
