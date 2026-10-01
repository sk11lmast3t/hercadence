// src/utils/real_clerk_rls_test.ts
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const clerkSecret = process.env.CLERK_SECRET_KEY || '';
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || '';
const supabaseAnon = process.env.SUPABASE_PUBLISHABLE_KEY || '';

async function runRealClerkCrossUserRlsTest() {
  console.log('================================================================');
  console.log('=== REAL CLERK TWO-USER AUTHENTICATED RLS ISOLATION TEST ===');
  console.log('================================================================\n');

  // 1. Create User A in Clerk
  const emailA = `test_user_a_${Date.now()}@hercadence.test`;
  console.log(`1. Creating Real Clerk User A (${emailA})...`);
  const createResA = await fetch('https://api.clerk.com/v1/users', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${clerkSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: [emailA],
      password: 'TestPassword123!@#',
      skip_password_checks: true,
    }),
  });

  const userAData = await createResA.json();
  if (!createResA.ok) {
    console.error('Failed to create User A in Clerk:', userAData);
    return;
  }
  const clerkUserAId = userAData.id;
  console.log(`   -> Created User A in Clerk! ID: "${clerkUserAId}"`);

  // 2. Create User B in Clerk
  const emailB = `test_user_b_${Date.now()}@hercadence.test`;
  console.log(`\n2. Creating Real Clerk User B (${emailB})...`);
  const createResB = await fetch('https://api.clerk.com/v1/users', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${clerkSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: [emailB],
      password: 'TestPassword123!@#',
      skip_password_checks: true,
    }),
  });

  const userBData = await createResB.json();
  if (!createResB.ok) {
    console.error('Failed to create User B in Clerk:', userBData);
    return;
  }
  const clerkUserBId = userBData.id;
  console.log(`   -> Created User B in Clerk! ID: "${clerkUserBId}"`);

  // 3. Create Session Tokens for User A and User B via Clerk Backend API
  console.log('\n3. Generating Real Clerk Session Tokens for User A and User B...');

  // Create session for User A
  const sessionResA = await fetch('https://api.clerk.com/v1/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${clerkSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: clerkUserAId }),
  });
  const sessionDataA = await sessionResA.json();
  const sessionIdA = sessionDataA.id;

  // Create session for User B
  const sessionResB = await fetch('https://api.clerk.com/v1/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${clerkSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: clerkUserBId }),
  });
  const sessionDataB = await sessionResB.json();
  const sessionIdB = sessionDataB.id;

  // Get session token (JWT) for User A
  const tokenResA = await fetch(`https://api.clerk.com/v1/sessions/${sessionIdA}/tokens`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${clerkSecret}`,
      'Content-Type': 'application/json',
    },
  });
  const tokenDataA = await tokenResA.json();
  const jwtUserA = tokenDataA.jwt;

  // Get session token (JWT) for User B
  const tokenResB = await fetch(`https://api.clerk.com/v1/sessions/${sessionIdB}/tokens`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${clerkSecret}`,
      'Content-Type': 'application/json',
    },
  });
  const tokenDataB = await tokenResB.json();
  const jwtUserB = tokenDataB.jwt;

  console.log(`   User A Session JWT (sub: "${clerkUserAId}"): Received (${jwtUserA ? jwtUserA.substring(0, 30) + '...' : 'NONE'})`);
  console.log(`   User B Session JWT (sub: "${clerkUserBId}"): Received (${jwtUserB ? jwtUserB.substring(0, 30) + '...' : 'NONE'})`);

  // 4. Seed confidential health data for User B into Supabase via Service Role Admin
  console.log(`\n4. Seeding private record into public.daily_logs owned by User B (${clerkUserBId})...`);
  const adminClient = createClient(supabaseUrl, supabaseSecret);
  const { data: seedRow, error: seedErr } = await adminClient
    .from('daily_logs')
    .upsert({
      clerk_user_id: clerkUserBId,
      log_date: '2026-09-19',
      flow: 'heavy',
      symptoms: ['migraine', 'cramps'],
      notes: 'CONFIDENTIAL: User B Private Medical Log Entry',
    }, { onConflict: 'clerk_user_id, log_date' })
    .select();

  if (seedErr) {
    console.error('Seed Error:', seedErr);
    return;
  }
  console.log('   -> Seeded row in Postgres:', JSON.stringify(seedRow, null, 2));

  // 5. Test 1: User B queries User B's own data using User B's real Clerk JWT
  console.log(`\n5. TEST 1: User B querying User B's own record with User B's real Clerk JWT...`);
  const clientUserB = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${jwtUserB}` } },
  });
  const { data: userBOwnData, error: userBOwnErr } = await clientUserB
    .from('daily_logs')
    .select('*')
    .eq('clerk_user_id', clerkUserBId);

  console.log('   User B Own Query Response:');
  console.log('     Status Error:', userBOwnErr);
  console.log('     Rows Returned:', userBOwnData?.length ?? 0);
  console.log('     Returned Record:', JSON.stringify(userBOwnData, null, 2));

  // 6. Test 2: User A (authenticated real Clerk user A) attempts to query User B's record using User A's real Clerk JWT
  console.log(`\n6. TEST 2: User A (Real Clerk User "${clerkUserAId}") attempting to query User B's record ("${clerkUserBId}") with User A's real Clerk JWT...`);
  const clientUserA = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${jwtUserA}` } },
  });

  const queryStart = Date.now();
  const { data: crossUserData, error: crossUserErr, status: crossUserStatus } = await clientUserA
    .from('daily_logs')
    .select('*')
    .eq('clerk_user_id', clerkUserBId);
  const queryDuration = Date.now() - queryStart;

  console.log('\n================ REAL TWO-USER RLS POSTGRES RESPONSE ================');
  console.log(`Query Target: clerk_user_id = "${clerkUserBId}"`);
  console.log(`Authenticated JWT Subject: sub = "${clerkUserAId}"`);
  console.log(`HTTP Status Code: ${crossUserStatus}`);
  console.log(`Query Latency: ${queryDuration}ms`);
  console.log('Postgres Error Object:', crossUserErr);
  console.log('Data Array Returned:', JSON.stringify(crossUserData, null, 2));
  console.log('Total Rows Returned:', crossUserData?.length ?? 0);
  console.log('===================================================================\n');

  // 7. Clean up test users & seeded row
  console.log('7. Cleanup: Deleting test users & records from database and Clerk...');
  await adminClient.from('daily_logs').delete().eq('clerk_user_id', clerkUserBId);
  await fetch(`https://api.clerk.com/v1/users/${clerkUserAId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${clerkSecret}` },
  });
  await fetch(`https://api.clerk.com/v1/users/${clerkUserBId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${clerkSecret}` },
  });
  console.log('Cleanup complete.');
}

runRealClerkCrossUserRlsTest().catch(console.error);
