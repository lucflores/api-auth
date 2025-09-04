import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js';
function cookieExtractor(req) {
  return req?.cookies?.jwt ?? null;
}

export function initPassportJWT(passport) {
  const opts = {
    jwtFromRequest: ExtractJwt.fromExtractors([
      cookieExtractor,
      ExtractJwt.fromAuthHeaderAsBearerToken(),
    ]),
    secretOrKey: process.env.JWT_SECRET,
    algorithms: ['HS256'],
    ignoreExpiration: false,
  };

  passport.use(
    'jwt',
    new JwtStrategy(opts, async (payload, done) => {
      try {
        // payload.sub debe venir del token (signToken)
        const user = await User.findById(payload.sub)
          .select('-password')    
          .populate('cart')
          .lean({ virtuals: true }); 

        if (!user) return done(null, false, { message: 'Usuario no encontrado' });
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    })
  );
}
