import { Router } from 'express';
import passport from 'passport';
import { User } from '../../models/User.js';
import { hashPassword } from '../../utils/hash.js';
import { requireRole } from '../../middleware/auth.js';

const r = Router();

r.use(passport.authenticate('jwt', { session: false }));

r.get('/', requireRole('admin'), async (_req, res) => {
  const users = await User.find().populate('cart');
  res.json({ status: 'success', payload: users });
});

r.get('/me', async (req, res) => {
  res.json({ status: 'success', payload: req.user });
});

r.post('/', requireRole('admin'), async (req, res) => {
  try {
    const data = req.body;
    if (data.password) data.password = hashPassword(data.password);
    const created = await User.create(data);
    res.status(201).json({ status: 'success', payload: created });
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 'error', error: 'No se pudo crear el usuario' });
  }
});

r.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({ status: 'error', error: 'No autorizado' });
    }
    const data = req.body;
    if (data.password) data.password = hashPassword(data.password);
    const updated = await User.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return res.status(404).json({ status: 'error', error: 'Usuario no encontrado' });
    res.json({ status: 'success', payload: updated });
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 'error', error: 'No se pudo actualizar' });
  }
});

r.delete('/:id', requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ status: 'error', error: 'Usuario no encontrado' });
  res.json({ status: 'success' });
});

export default r;