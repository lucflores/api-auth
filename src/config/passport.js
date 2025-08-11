import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../models/User.js';

function cookieExtractor(req) {
  let token = null;
  if (req && req.cookies && req.cookies['jwt']) token = req.cookies['jwt'];
  return token;
}

export function initPassportJWT(passport) {
  const opts = {
    jwtFromRequest: ExtractJwt.fromExtractors([
      cookieExtractor,
      ExtractJwt.fromAuthHeaderAsBearerToken(),
    ]),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use('jwt', new JwtStrategy(opts, async (payload, done) => {
    try {
      const user = await User.findById(payload.sub).populate('cart');
      if (!user) return done(null, false, { message: 'Usuario no encontrado' });
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }));
}