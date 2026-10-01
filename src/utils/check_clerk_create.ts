// src/utils/check_clerk_create.ts
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const clerkSecret = process.env.CLERK_SECRET_KEY || '';

async function createSecondUserInClerk() {
  console.log('Testing creating User 2 in Clerk...');

  const res = await fetch('https://api.clerk.com/v1/users', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${clerkSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name: 'TestUserTwo',
      last_name: 'HerCadence',
      skip_password_requirement: true,
    }),
  });

  const status = res.status;
  const data = await res.json();
  console.log('Create User 2 Status:', status);
  console.log('User 2 Data:', JSON.stringify(data, null, 2));
}

createSecondUserInClerk();
