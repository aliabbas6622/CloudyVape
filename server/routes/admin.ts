import { Router } from 'express';
import db from '../db.js';
import bcrypt from 'bcryptjs';

const router = Router();

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { password } = req.body;
  
  const storedPassword = db.prepare("SELECT value FROM settings WHERE key = 'adminPassword'").get() as { value: string } | undefined;
  
  if (!storedPassword || !password || !(await bcrypt.compare(password, storedPassword.value))) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  (req.session as any).admin = true;
  res.json({ authenticated: true });
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ authenticated: false });
  });
});

// GET /api/admin/me — check auth status
router.get('/me', (req, res) => {
  res.json({ authenticated: Boolean((req.session as any)?.admin) });
});

export default router;
