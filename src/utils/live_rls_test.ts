// src/utils/live_rls_test.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceSecretKey = process.env.SUPABASE_SECRET_KEY || '';
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || '';

async function executeLivePostgresRlsQuery() {
  console.log('=== EXECUTING LIVE POSTGRESQL RLS QUERY AGAINST SUPABASE INSTANCE ===\n');

  // 1. Service Role Client (bypasses RLS to seed a test record owned by User B)
  const serviceAdmin = createClient(supabaseUrl, serviceSecretKey);

  const testUserIdB = 'clerk_test_user_B_999';
  const testUserIdA = 'clerk_test_user_A_111';

  console.log(`1. Admin seeding record into public.daily_logs for clerk_user_id = "${testUserIdB}"...`);
  const { data: seedData, error: seedError } = await serviceAdmin
    .from('daily_logs')
    .upsert({
      clerk_user_id: testUserIdB,
      log_date: '2026-09-19',
      flow: 'medium',
      symptoms: ['headache', 'cramps'],
      notes: 'User B confidential health record',
    }, { onConflict: 'clerk_user_id, log_date' })
    .select();

  if (seedError) {
    console.error('Seed Error:', seedError);
    return;
  }
  console.log('Postgres Admin Seed Output:', JSON.stringify(seedData, null, 2));

  // 2. Query as Admin (Service Role) - SHOULD return the record
  console.log(`\n2. Querying database via Admin Service Role for clerk_user_id = "${testUserIdB}"...`);
  const { data: adminQueryData } = await serviceAdmin
    .from('daily_logs')
    .select('*')
    .eq('clerk_user_id', testUserIdB);

  console.log(`   Admin Result: ${adminQueryData?.length} row(s) returned.`);

  // 3. Query as Unauthenticated / Non-Owner (Anon Key - JWT sub is null/different)
  console.log(`\n3. Executing live PostgREST query with client anon key (where auth.jwt() ->> 'sub' != '${testUserIdB}')...`);
  const anonClient = createClient(supabaseUrl, publishableKey);

  const queryStartTime = Date.now();
  const { data: rlsQueryData, error: rlsQueryError, status, statusText } = await anonClient
    .from('daily_logs')
    .select('*')
    .eq('clerk_user_id', testUserIdB);
  const queryDurationMs = Date.now() - queryStartTime;

  console.log('\n================ LIVE POSTGRES RLS RESPONSE ================');
  console.log(`HTTP Status: ${status} ${statusText}`);
  console.log(`Query Latency: ${queryDurationMs}ms`);
  console.log('Error Object:', rlsQueryError);
  console.log('Data Returned:', JSON.stringify(rlsQueryData, null, 2));
  console.log('Row Count:', rlsQueryData?.length ?? 0);
  console.log('============================================================\n');

  // 4. Query with invalid/unmatched Bearer token
  const fakeJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbGVya190ZXN0X3VzZXJfQV8xMTEifQ.invalid_sig';
  const invalidTokenClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: `Bearer ${fakeJwt}` } },
  });

  console.log(`4. Executing query with invalid Bearer token:`);
  const { data: tokenData, error: tokenError, status: tokenStatus } = await invalidTokenClient
    .from('daily_logs')
    .select('*')
    .eq('clerk_user_id', testUserIdB);

  console.log(`   HTTP Status: ${tokenStatus}`);
  console.log('   Error:', tokenError);
  console.log('   Data Returned:', tokenData);

  // 5. Cleanup test data
  console.log('\n5. Cleaning up seeded test record from live database...');
  await serviceAdmin.from('daily_logs').delete().eq('clerk_user_id', testUserIdB);
  console.log('Cleanup complete.');
}

executeLivePostgresRlsQuery().catch(console.error);
