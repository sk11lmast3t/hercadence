// src/utils/test_clerk_auth_rls.ts
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const clerkSecretKey = process.env.CLERK_SECRET_KEY || '';

async function testClerkUserCreation() {
  console.log('Testing Clerk API authentication with key:', clerkSecretKey ? 'Present' : 'Missing');

  try {
    const res = await fetch('https://api.clerk.com/v1/users?limit=10', {
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
      },
    });

    const status = res.status;
    const data = await res.json();
    console.log('Clerk Users List Status:', status);
    console.log('Clerk Users:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error fetching Clerk users:', err);
  }
}

testClerkUserCreation();
