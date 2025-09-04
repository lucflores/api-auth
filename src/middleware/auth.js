import jwt from "jsonwebtoken";

const ACCESS_TOKEN_TTL = process.env.JWT_EXPIRES_IN || "1h";

export function signToken(user) {
  const sub = user?._id?.toString?.() ?? String(user?._id);
  return jwt.sign(
    { sub, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL, algorithm: "HS256" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
}

export function getJwtFromReq(req) {
  return req?.cookies?.jwt || (req?.headers?.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null);
}
