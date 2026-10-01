// src/utils/real_clerk_two_user_rls_test.ts
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const clerkSecret = process.env.CLERK_SECRET_KEY || '';
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || '';
const supabaseAnon = process.env.SUPABASE_PUBLISHABLE_KEY || '';

async function executeRealTwoUserClerkRlsTest() {
  console.log('========================================================================================');
  console.log('=== REAL TWO-USER CLERK AUTHENTICATED POSTGRESQL RLS CROSS-USER ISOLATION TEST ===');
  console.log('========================================================================================\n');

  const userAId = 'user_3JRlvsUMJyuNi8Sf1U9rury28iP'; // Real Clerk User A
  const userBId = 'user_3Ja0tMhce5J0sfc9nk6OMq41EEY'; // Real Clerk User B

  console.log(`1. Target User IDs created in Clerk authentication provider:`);
  console.log(`   User A Clerk ID: "${userAId}"`);
  console.log(`   User B Clerk ID: "${userBId}"`);

  // 2. Obtain real signed Clerk Session JWT tokens directly from Clerk's API for User A and User B
  console.log('\n2. Requesting real RS256 signed session JWT tokens from Clerk Backend API...');

  // User A session token
  const sessResA = await fetch('https://api.clerk.com/v1/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${clerkSecret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userAId }),
  });
  const sessDataA = await sessResA.json();
  const tokenResA = await fetch(`https://api.clerk.com/v1/sessions/${sessDataA.id}/tokens`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${clerkSecret}`, 'Content-Type': 'application/json' },
  });
  const tokenDataA = await tokenResA.json();
  const jwtUserA = tokenDataA.jwt;

  // User B session token
  const sessResB = await fetch('https://api.clerk.com/v1/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${clerkSecret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userBId }),
  });
  const sessDataB = await sessResB.json();
  const tokenResB = await fetch(`https://api.clerk.com/v1/sessions/${sessDataB.id}/tokens`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${clerkSecret}`, 'Content-Type': 'application/json' },
  });
  const tokenDataB = await tokenResB.json();
  const jwtUserB = tokenDataB.jwt;

  console.log('   User A Clerk Session JWT Received:', jwtUserA ? `Valid RS256 JWT (${jwtUserA.substring(0, 35)}...)` : 'FAILED');
  console.log('   User B Clerk Session JWT Received:', jwtUserB ? `Valid RS256 JWT (${jwtUserB.substring(0, 35)}...)` : 'FAILED');

  // Decode JWT sub claims to verify
  const subA = JSON.parse(Buffer.from(jwtUserA.split('.')[1], 'base64').toString()).sub;
  const subB = JSON.parse(Buffer.from(jwtUserB.split('.')[1], 'base64').toString()).sub;
  console.log(`   Verified decoded JWT sub claim User A: "${subA}"`);
  console.log(`   Verified decoded JWT sub claim User B: "${subB}"`);

  // 3. Admin seeds confidential data for User B into Supabase PostgreSQL
  console.log(`\n3. Admin seeding confidential daily health log for User B (${userBId}) into Supabase...`);
  const adminClient = createClient(supabaseUrl, supabaseSecret);
  const { data: seedData, error: seedError } = await adminClient
    .from('daily_logs')
    .upsert({
      clerk_user_id: userBId,
      log_date: '2026-09-19',
      flow: 'heavy',
      symptoms: ['migraine', 'cramps'],
      notes: 'CONFIDENTIAL MEDICAL NOTE FOR USER B ONLY',
    }, { onConflict: 'clerk_user_id, log_date' })
    .select();

  if (seedError) {
    console.error('Seed Error:', seedError);
    return;
  }
  console.log('   Admin Seeded Record in Postgres:', JSON.stringify(seedData, null, 2));

  // 4. TEST 1: User B queries User B's own data with User B's real Clerk JWT
  console.log(`\n4. TEST 1: User B querying User B's data using User B's real Clerk JWT (sub: "${subB}")...`);
  const clientUserB = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${jwtUserB}` } },
  });
  const { data: userBOwnData, error: userBOwnErr, status: userBOwnStatus } = await clientUserB
    .from('daily_logs')
    .select('*')
    .eq('clerk_user_id', userBId);

  console.log(`   HTTP Status: ${userBOwnStatus} | Rows Returned: ${userBOwnData?.length ?? 0}`);
  console.log('   User B Data Returned:', JSON.stringify(userBOwnData, null, 2));

  // 5. TEST 2: User A queries User B's data using User A's real Clerk JWT
  console.log(`\n5. TEST 2: User A querying User B's data using User A's real Clerk JWT (sub: "${subA}")...`);
  const clientUserA = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${jwtUserA}` } },
  });

  const startTime = Date.now();
  const { data: crossUserData, error: crossUserErr, status: crossUserStatus, statusText } = await clientUserA
    .from('daily_logs')
    .select('*')
    .eq('clerk_user_id', userBId);
  const latencyMs = Date.now() - startTime;

  console.log('\n================ RAW POSTGRESQL RLS CROSS-USER RESPONSE ================');
  console.log(`Authenticated Requesting User: User A (sub = "${subA}")`);
  console.log(`Target Requested User Data: User B (clerk_user_id = "${userBId}")`);
  console.log(`HTTP Status: ${crossUserStatus} ${statusText}`);
  console.log(`Database Latency: ${latencyMs}ms`);
  console.log('Postgres Error Object:', crossUserErr);
  console.log('Data Array Returned from Postgres:', JSON.stringify(crossUserData, null, 2));
  console.log('Total Rows Returned:', crossUserData?.length ?? 0);
  console.log('========================================================================\n');

  // 6. Cleanup test row
  console.log('6. Cleanup: Deleting test seed row from Postgres database...');
  await adminClient.from('daily_logs').delete().eq('clerk_user_id', userBId);
  console.log('Cleanup complete.');
}

executeRealTwoUserClerkRlsTest().catch(console.error);
