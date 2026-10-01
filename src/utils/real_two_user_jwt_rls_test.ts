// src/utils/real_two_user_jwt_rls_test.ts
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || '';
const supabaseAnon = process.env.SUPABASE_PUBLISHABLE_KEY || '';

function signSupabaseJwt(sub: string, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub,
    role: 'authenticated',
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function executeTwoUserAuthenticatedRlsTest() {
  console.log('========================================================================================');
  console.log('=== REAL TWO-USER AUTHENTICATED POSTGRESQL RLS ISOLATION TEST (LIVE SUPABASE) ===');
  console.log('========================================================================================\n');

  const clerkUserAId = 'user_3JRlvsUMJyuNi8Sf1U9rury28iP'; // User A Clerk ID
  const clerkUserBId = 'user_3Ja0tMhce5J0sfc9nk6OMq41EEY'; // User B Clerk ID

  console.log(`1. Target User IDs:`);
  console.log(`   User A ID: "${clerkUserAId}"`);
  console.log(`   User B ID: "${clerkUserBId}"`);

  // Sign valid JWT tokens for User A and User B
  const jwtUserA = signSupabaseJwt(clerkUserAId, supabaseSecret);
  const jwtUserB = signSupabaseJwt(clerkUserBId, supabaseSecret);

  console.log('\n2. Signed valid authenticated JWTs with sub claims:');
  console.log(`   User A JWT sub claim: "${clerkUserAId}"`);
  console.log(`   User B JWT sub claim: "${clerkUserBId}"`);

  // 3. Admin seeds confidential data for User B into Supabase PostgreSQL
  console.log(`\n3. Admin seeding confidential daily health log for User B (${clerkUserBId}) into Supabase...`);
  const adminClient = createClient(supabaseUrl, supabaseSecret);
  const { data: seedData, error: seedError } = await adminClient
    .from('daily_logs')
    .upsert({
      clerk_user_id: clerkUserBId,
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

  // 4. TEST 1: User B queries User B's own data using User B's authenticated JWT
  console.log(`\n4. TEST 1: User B querying User B's data using User B's authenticated JWT (sub: "${clerkUserBId}")...`);
  const clientUserB = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${jwtUserB}` } },
  });
  const { data: userBOwnData, error: userBOwnErr, status: userBOwnStatus } = await clientUserB
    .from('daily_logs')
    .select('*')
    .eq('clerk_user_id', clerkUserBId);

  console.log(`   HTTP Status: ${userBOwnStatus} | Rows Returned: ${userBOwnData?.length ?? 0}`);
  console.log('   User B Data Returned:', JSON.stringify(userBOwnData, null, 2));

  // 5. TEST 2: User A (authenticated User A) attempts to query User B's record using User A's authenticated JWT
  console.log(`\n5. TEST 2: User A (authenticated sub: "${clerkUserAId}") attempting to query User B's record ("${clerkUserBId}") with User A's JWT...`);
  const clientUserA = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${jwtUserA}` } },
  });

  const startTime = Date.now();
  const { data: crossUserData, error: crossUserErr, status: crossUserStatus, statusText } = await clientUserA
    .from('daily_logs')
    .select('*')
    .eq('clerk_user_id', clerkUserBId);
  const latencyMs = Date.now() - startTime;

  console.log('\n================ RAW POSTGRESQL RLS CROSS-USER RESPONSE ================');
  console.log(`Authenticated Requesting User: User A (sub = "${clerkUserAId}")`);
  console.log(`Target Requested User Data: User B (clerk_user_id = "${clerkUserBId}")`);
  console.log(`HTTP Status: ${crossUserStatus} ${statusText}`);
  console.log(`Database Latency: ${latencyMs}ms`);
  console.log('Postgres Error Object:', crossUserErr);
  console.log('Data Array Returned from Postgres:', JSON.stringify(crossUserData, null, 2));
  console.log('Total Rows Returned:', crossUserData?.length ?? 0);
  console.log('========================================================================\n');

  // 6. Cleanup test row
  console.log('6. Cleanup: Deleting test seed row from Postgres database...');
  await adminClient.from('daily_logs').delete().eq('clerk_user_id', clerkUserBId);
  console.log('Cleanup complete.');
}

executeTwoUserAuthenticatedRlsTest().catch(console.error);
