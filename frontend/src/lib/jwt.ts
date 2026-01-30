import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.NEXT_PUBLIC_BETTER_AUTH_SECRET || "cd59cc947065b2348ff95725f0c8add04350c71efed518d9ba1f6cca3e320dba";
const ALGORITHM = "HS256";

export function createAccessToken(data: { user_id: string }): string {
  const payload = {
    user_id: data.user_id,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
  };
  return jwt.sign(payload, SECRET_KEY, { algorithm: ALGORITHM });
}
