// supabase/functions/_shared/clerkAuth.ts
//
// Shared Clerk JWT verification for Supabase Edge Functions.
//
// CRITICAL SECURITY NOTE:
// Platform-level verify_jwt is disabled for these functions because Clerk
// session tokens are signed by Clerk's keys, not Supabase's keys — the
// platform gateway cannot validate them. Each function verifies the token
// itself using Clerk's JWKS endpoint.
//
// The JWKS URL and expected issuer are derived from the CLERK_ISSUER_URL
// environment variable (set via Supabase dashboard secrets or CLI), NEVER from
// the incoming token. This prevents a signature-verification bypass: an
// attacker cannot forge a token with a fake iss claim pointing to their own
// JWKS server, because jwtVerify({ issuer: CLERK_ISSUER_URL }) will reject any
// token whose iss claim doesn't match.
//
// Usage in a function:
//   import { verifyClerkToken } from '../_shared/clerkAuth.ts';
//   const { clerkUserId } = await verifyClerkToken(req.headers.get('Authorization'));

import { jwtVerify, createRemoteJWKSet, type JWTPayload, type JWTHeaderParameters } from 'https://esm.sh/jose@5';

export interface ClerkVerifiedToken {
  clerkUserId: string;
  payload: JWTPayload;
  header: JWTHeaderParameters;
}

// Trusted issuer — read ONCE at module load from the environment.
// Falls back to AUTH_THIRD_PARTY_CLERK_DOMAIN for Supabase auto-naming compatibility.
const CLERK_ISSUER_URL = Deno.env.get('CLERK_ISSUER_URL') || Deno.env.get('AUTH_THIRD_PARTY_CLERK_DOMAIN');

if (!CLERK_ISSUER_URL) {
  console.error('[clerkAuth] CLERK_ISSUER_URL is not set — Clerk JWT verification will fail on every request');
}

const JWKS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — persists across warm invocations

interface CachedJWKSet {
  jwks: ReturnType<typeof createRemoteJWKSet>;
  fetchedAt: number;
}

// Cache key = trusted issuer URL (never derived from the token).
const jwksCache = new Map<string, CachedJWKSet>();

/**
 * Verify a Clerk session JWT from the Authorization header.
 *
 * Steps:
 *   1. Validate the Authorization header format.
 *   2. Fetch (and cache) the JWK set from the TRUSTED issuer URL
 *      (from CLERK_ISSUER_URL env var — never from the token).
 *   3. Call jose's jwtVerify with { issuer: CLERK_ISSUER_URL }, which
 *      cryptographically verifies the signature AND rejects any token whose
 *      iss claim doesn't match exactly.
 *   4. Extract clerkUserId from the sub claim.
 *
 * Throws an Error if the token is missing, malformed, or fails verification.
 * The caller is responsible for mapping the error to a 401 response.
 */
export async function verifyClerkToken(authHeader: string | null): Promise<ClerkVerifiedToken> {
  if (!CLERK_ISSUER_URL) {
    throw new Error('CLERK_ISSUER_URL is not configured — cannot verify Clerk tokens');
  }

  if (!authHeader) {
    throw new Error('Missing Authorization header');
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) {
    throw new Error('Invalid Authorization header format; expected "Bearer <token>"');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed JWT: expected 3 segments');
  }

  // Fetch (and cache) the JWK set from the TRUSTED issuer URL.
  let cached = jwksCache.get(CLERK_ISSUER_URL);
  if (!cached || Date.now() - cached.fetchedAt > JWKS_CACHE_TTL_MS) {
    const jwksUrl = `${CLERK_ISSUER_URL.replace(/\/$/, '')}/.well-known/jwks.json`;
    const jwksSet = createRemoteJWKSet(new URL(jwksUrl));
    cached = { jwks: jwksSet, fetchedAt: Date.now() };
    jwksCache.set(CLERK_ISSUER_URL, cached);
  }

  // Full cryptographic verification: signature, exp, nbf, iat, AND issuer.
  // Passing issuer: CLERK_ISSUER_URL ensures jose rejects any token whose iss
  // claim doesn't match our trusted Clerk domain.
  const { payload, protectedHeader } = await jwtVerify(token, cached.jwks, {
    issuer: CLERK_ISSUER_URL,
  });

  const clerkUserId = payload.sub;
  if (!clerkUserId) {
    throw new Error('JWT missing sub claim');
  }

  return {
    clerkUserId,
    payload,
    header: protectedHeader,
  };
}
