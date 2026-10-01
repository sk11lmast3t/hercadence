// supabase/functions/send-reminders/index.ts
// Invoked via pg_cron to process pending reminder_queue entries.
// Dispatches push notifications via FCM HTTP v1 API to native device tokens
// stored in device_tokens (platform: 'ios' | 'android').
//
// Required env vars:
//   FCM_SERVER_KEY  — Firebase Cloud Messaging server key (from Firebase project settings)
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FCM_URL = 'https://fcm.googleapis.com/fcm/send';

/** Sends a single FCM push notification to a device token. */
async function sendFcmNotification(
  fcmKey: string,
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  const payload = {
    to: token,
    notification: { title, body, sound: 'default' },
    data: data ?? {},
    priority: 'high',
  };

  const res = await fetch(FCM_URL, {
    method: 'POST',
    headers: {
      'Authorization': `key=${fcmKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || json.failure > 0) {
    const errMsg = json.results?.[0]?.error ?? res.statusText;
    return { success: false, error: errMsg };
  }
  return { success: true };
}

/** Build notification text based on reminder type. */
function buildNotificationText(reminderType: string, payload?: Record<string, unknown>): {
  title: string;
  body: string;
} {
  switch (reminderType) {
    case 'period_reminder':
      return {
        title: 'Period Reminder 🌸',
        body: "Your period is estimated to start soon. Log how you're feeling today.",
      };
    case 'fertile_window':
      return {
        title: 'Fertile Window 🌿',
        body: 'Your estimated fertile window is beginning. Tap to see your cycle details.',
      };
    case 'daily_log_prompt':
      return {
        title: 'Daily Check-In 💜',
        body: "Take a moment to log today's symptoms, moods, and energy levels.",
      };
    case 'medication':
      return {
        title: 'Medication Reminder 💊',
        body: `Time to take ${(payload as any)?.medicationName ?? 'your medication'}.`,
      };
    case 'hydration':
      return {
        title: 'Hydration Reminder 💧',
        body: 'Time to hydrate! Drink a glass of water.',
      };
    default:
      return {
        title: 'HerCadence Reminder',
        body: (payload as any)?.message ?? 'You have a reminder from HerCadence.',
      };
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const fcmKey = Deno.env.get('FCM_SERVER_KEY');

    // Query pending reminders scheduled for now or in the past (batch of 50)
    const { data: reminders, error: remErr } = await supabaseAdmin
      .from('reminder_queue')
      .select('id, clerk_user_id, reminder_type, payload')
      .eq('is_sent', false)
      .lte('scheduled_for', new Date().toISOString())
      .limit(50);

    if (remErr) throw remErr;

    let processedCount = 0;
    let dispatchedCount = 0;

    for (const rem of reminders || []) {
      // Lookup active device push tokens for user (native only)
      const { data: tokens } = await supabaseAdmin
        .from('device_tokens')
        .select('token, platform')
        .eq('clerk_user_id', rem.clerk_user_id)
        .in('platform', ['ios', 'android']);

      const { title, body } = buildNotificationText(rem.reminder_type, rem.payload);
      const dispatchResults: Array<{ token: string; platform: string; success: boolean; error?: string }> = [];

      if (fcmKey && tokens && tokens.length > 0) {
        for (const deviceToken of tokens) {
          const result = await sendFcmNotification(
            fcmKey,
            deviceToken.token,
            title,
            body,
            { reminderType: rem.reminder_type }
          );
          dispatchResults.push({
            token: deviceToken.token.slice(0, 12) + '…', // truncate for log privacy
            platform: deviceToken.platform,
            ...result,
          });
          if (result.success) dispatchedCount++;
        }
      } else if (!fcmKey) {
        console.warn('FCM_SERVER_KEY not set — skipping actual push dispatch (dev mode)');
      }

      // Log dispatch attempt (whether or not FCM key is configured)
      await supabaseAdmin.from('notification_logs').insert({
        clerk_user_id: rem.clerk_user_id,
        reminder_id: rem.id,
        reminder_type: rem.reminder_type,
        tokens_count: tokens?.length ?? 0,
        dispatch_results: dispatchResults,
        sent_at: new Date().toISOString(),
      });

      // Mark reminder as processed regardless of dispatch result
      await supabaseAdmin
        .from('reminder_queue')
        .update({ is_sent: true })
        .eq('id', rem.id);

      processedCount++;
    }

    return new Response(
      JSON.stringify({ success: true, processed: processedCount, dispatched: dispatchedCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('send-reminders error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
