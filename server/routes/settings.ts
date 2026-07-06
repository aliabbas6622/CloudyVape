import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/settings
router.get('/', (_req, res) => {
  const rows = db.prepare("SELECT key, value FROM settings WHERE key != 'adminPassword'").all() as { key: string; value: string }[];

  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }

  res.json(settings);
});

// PUT /api/settings — update settings (admin only)
router.put('/', (req, res) => {
  if (!(req.session as any)?.admin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { whatsappNumber, adminPassword } = req.body;

  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

  const updateAll = db.transaction(() => {
    if (whatsappNumber !== undefined) {
      upsert.run('whatsappNumber', whatsappNumber);
    }
    if (adminPassword && adminPassword.trim().length > 0) {
      upsert.run('adminPassword', adminPassword.trim());
    }
  });

  updateAll();

  // Return updated settings (without password)
  const rows = db.prepare("SELECT key, value FROM settings WHERE key != 'adminPassword'").all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }

  res.json(settings);
});

export default router;
