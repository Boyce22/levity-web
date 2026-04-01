import { jwtVerify, SignJWT } from 'jose';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'antigravity-secret-key-for-jwt-token';
  return new TextEncoder().encode(secret);
};

export async function verifyJwtToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload;
  } catch (error) {
    return null;
  }
}

export async function signJwtToken(payload: { id: string, user: string }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getJwtSecretKey());
  return token;
}
