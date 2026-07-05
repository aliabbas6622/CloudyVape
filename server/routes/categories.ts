import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/categories — list all categories
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM categories ORDER BY id ASC').all();
  res.json(rows);
});

// POST /api/categories — create category (admin only)
router.post('/', (req, res) => {
  if (!(req.session as any)?.admin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name.trim());
    const newCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newCategory);
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Category already exists' });
    }
    throw err;
  }
});

// DELETE /api/categories/:id — delete category (admin only)
router.delete('/:id', (req, res) => {
  if (!(req.session as any)?.admin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const id = Number(req.params.id);

  // Check if category has products
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE categoryId = ?').get(id) as { count: number };
  if (productCount.count > 0) {
    return res.status(400).json({ error: 'Cannot delete category that has products' });
  }

  const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Category not found' });
  }

  res.json({ success: true });
});

export default router;
