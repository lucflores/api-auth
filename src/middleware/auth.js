import jwt from 'jsonwebtoken';

export function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '1d' },
  );
}

export function requireJWT(passport) {
  return passport.authenticate('jwt', { session: false });
}

export function requireRole(...roles) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ status: 'error', error: 'No autenticado' });
    if (!roles.includes(user.role)) return res.status(403).json({ status: 'error', error: 'No autorizado' });
    next();
  };
}