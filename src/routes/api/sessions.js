import { Router } from 'express';
import passport from 'passport';
import { User } from '../../models/User.js';
import { Cart } from '../../models/Cart.js';
import { hashPassword, isValidPassword } from '../../utils/hash.js';
import { signToken } from '../../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ status: 'error', error: 'Campos obligatorios faltantes' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ status: 'error', error: 'Email ya registrado' });

    const cart = await Cart.create({ products: [] });
    const user = await User.create({
      first_name, last_name, email, age,
      password: hashPassword(password),
      cart: cart._id,
    });

    const token = signToken(user);
    res.cookie('jwt', token, { httpOnly: true, sameSite: 'lax', maxAge: 24*60*60*1000 });
    return res.status(201).json({ status: 'success', payload: user, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', error: 'Error en registro' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ status: 'error', error: 'Credenciales inválidas' });
    const ok = isValidPassword(password, user.password);
    if (!ok) return res.status(401).json({ status: 'error', error: 'Credenciales inválidas' });

    const token = signToken(user);
    res.cookie('jwt', token, { httpOnly: true, sameSite: 'lax', maxAge: 24*60*60*1000 });
    return res.json({ status: 'success', token, payload: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', error: 'Error en login' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  return res.json({ status: 'success' });
});

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  return res.json({ status: 'success', payload: req.user });
});

export default router;
