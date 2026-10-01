// supabase/functions/delete-account/index.ts
// Hard-deletes all user data across every table, then deletes the Clerk user.
// This is a real, audited deletion — not a soft flag.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyClerkToken } from '../_shared/clerkAuth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// All user-owned tables in deletion order (respects FK constraints)
const USER_TABLES = [
  'medication_logs',
  'medications',
  'supplements',
  'ovulation_observations',
  'daily_logs',
  'cycles',
  'body_metrics',
  'sleep_logs',
  'hydration_logs',
  'activity_logs',
  'pregnancies',
  'appointments',
  'custom_tags',
  'notification_logs',
  'reminder_queue',
  'device_tokens',
  'notification_preferences',
  'payment_events',
  'subscriptions',
  'payment_customers',
  'community_reactions',
  'community_comments',
  'community_reports',
  'community_posts',
  'group_memberships',
  'saved_content',
  'saved_doctors',
  'consent_records',
  'partner_permissions',
  'partner_connections',
  'profiles',
];

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

    // Verify the Clerk JWT and extract clerk_user_id (sub claim).
    // Platform verify_jwt is disabled — Clerk tokens are not Supabase JWTs.
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

    const body = await req.json();
    const { confirmation } = body;

    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return new Response(
        JSON.stringify({ error: 'Must send confirmation: "DELETE_MY_ACCOUNT"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Log the deletion to non-cascading deletion_audit_logs table before wiping user tables
    await supabaseAdmin.from('deletion_audit_logs').insert({
      clerk_user_id: clerkUserId,
      details: { timestamp: new Date().toISOString() },
    });

    // Delete all user data from every table
    const errors: string[] = [];
    for (const table of USER_TABLES) {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq('clerk_user_id', clerkUserId);

      if (error) {
        console.error(`Error deleting from ${table}:`, error);
        errors.push(`${table}: ${error.message}`);
      }
    }

    // Delete partner connections where user is the partner (not owner)
    await supabaseAdmin
      .from('partner_connections')
      .delete()
      .eq('partner_user_id', clerkUserId);

    // Delete Clerk user via Clerk Backend API
    const clerkSecretKey = Deno.env.get('CLERK_SECRET_KEY');
    if (clerkSecretKey) {
      const clerkResponse = await fetch(
        `https://api.clerk.com/v1/users/${clerkUserId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${clerkSecretKey}` },
        }
      );
      if (!clerkResponse.ok) {
        const clerkErr = await clerkResponse.text();
        console.error('Clerk user deletion failed:', clerkErr);
        errors.push(`clerk: ${clerkErr}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        message: errors.length === 0
          ? 'Account and all data permanently deleted'
          : 'Account deleted with some warnings',
        warnings: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('delete-account error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
