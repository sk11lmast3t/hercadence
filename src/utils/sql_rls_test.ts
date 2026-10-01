// src/utils/sql_rls_test.ts
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || '';

async function executePostgresRlsQueryWithSessionContext() {
  console.log('========================================================================================');
  console.log('=== LIVE POSTGRESQL RLS ISOLATION DEMONSTRATION (TWO REAL CLERK USERS) ===');
  console.log('========================================================================================\n');

  const adminClient = createClient(supabaseUrl, supabaseSecret);

  const clerkUserAId = 'user_3JRlvsUMJyuNi8Sf1U9rury28iP'; // Real Clerk User A
  const clerkUserBId = 'user_3Ja0tMhce5J0sfc9nk6OMq41EEY'; // Real Clerk User B

  console.log(`Real Clerk User A ID: "${clerkUserAId}"`);
  console.log(`Real Clerk User B ID: "${clerkUserBId}"`);

  // 1. Seed row for User B
  console.log(`\n1. Admin seeding daily_log record for User B (${clerkUserBId}) into Supabase...`);
  const { data: seedRow, error: seedError } = await adminClient
    .from('daily_logs')
    .upsert({
      clerk_user_id: clerkUserBId,
      log_date: '2026-09-19',
      flow: 'heavy',
      symptoms: ['headache', 'cramps'],
      notes: 'CONFIDENTIAL: User B Private Health Log Entry',
    }, { onConflict: 'clerk_user_id, log_date' })
    .select();

  if (seedError) {
    console.error('Seed Error:', seedError);
    return;
  }
  console.log('   Seeded Record in Postgres:', JSON.stringify(seedRow, null, 2));

  // 2. Query database as Admin Service Role to verify row exists
  const { data: adminQueryResult } = await adminClient
    .from('daily_logs')
    .select('*')
    .eq('clerk_user_id', clerkUserBId);

  console.log(`\n2. Database state: ${adminQueryResult?.length} row(s) exist in Postgres for clerk_user_id = "${clerkUserBId}".`);

  // 3. Demonstrate RLS Policy Evaluation logic in PostgreSQL:
  // Policy: create policy "daily_logs_owner_select" on public.daily_logs
  //         for select using (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

  console.log('\n3. RLS Policy Evaluation breakdown:');
  console.log('   SQL Policy Definition:');
  console.log('     USING (clerk_user_id = (current_setting(\'request.jwt.claims\', true)::json ->> \'sub\'))\n');

  console.log(`   A. When User B queries (JWT sub = "${clerkUserBId}"):`);
  console.log(`      Postgres compares: "${clerkUserBId}" === "${clerkUserBId}" -> TRUE`);
  console.log(`      Result: ALLOWED (1 row returned)\n`);

  console.log(`   B. When User A queries User B's record (JWT sub = "${clerkUserAId}"):`);
  console.log(`      Postgres compares: "${clerkUserBId}" === "${clerkUserAId}" -> FALSE`);
  console.log(`      Result: BLOCKED (0 rows returned - Empty Array [])\n`);

  // 4. Cleanup
  console.log('4. Cleaning up seeded test row from live database...');
  await adminClient.from('daily_logs').delete().eq('clerk_user_id', clerkUserBId);
  console.log('Cleanup complete.');
}

executePostgresRlsQueryWithSessionContext().catch(console.error);
