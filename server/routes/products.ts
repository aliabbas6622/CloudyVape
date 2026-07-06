import { Router } from 'express';
import db from '../db.js';

const router = Router();

interface ProductRow {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrls: string[];
  categoryId: number;
  featured: number;
  inStock: number;
  createdAt: string;
  categoryName?: string;
}

// Helper to format product row
function formatProduct(row: ProductRow) {
  return {
    ...row,
    featured: Boolean(row.featured),
    inStock: Boolean(row.inStock),
  };
}

// GET /api/products — list all products, optionally filter by categoryId
router.get('/', (req, res) => {
  const { categoryId } = req.query;

  let stmt;
  if (categoryId) {
    stmt = db.prepare(`
      SELECT p.*, c.name as categoryName
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE p.categoryId = ?
      ORDER BY p.id DESC
    `);
    const rows = stmt.all(Number(categoryId)) as ProductRow[];
    res.json(rows.map(formatProduct));
  } else {
    stmt = db.prepare(`
      SELECT p.*, c.name as categoryName
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      ORDER BY p.id DESC
    `);
    const rows = stmt.all() as ProductRow[];
    res.json(rows.map(formatProduct));
  }
});

// GET /api/products/featured — list featured products
router.get('/featured', (_req, res) => {
  const rows = db.prepare(`
    SELECT p.*, c.name as categoryName
    FROM products p
    LEFT JOIN categories c ON p.categoryId = c.id
    WHERE p.featured = 1
    ORDER BY p.id DESC
  `).all() as ProductRow[];
  res.json(rows.map(formatProduct));
});

// GET /api/products/stats — product statistics
router.get('/stats', (_req, res) => {
  const totalProducts = (db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }).count;
  const totalCategories = (db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }).count;
  const featuredCount = (db.prepare('SELECT COUNT(*) as count FROM products WHERE featured = 1').get() as { count: number }).count;
  const inStockCount = (db.prepare('SELECT COUNT(*) as count FROM products WHERE inStock = 1').get() as { count: number }).count;

  const byCategory = db.prepare(`
    SELECT c.id as categoryId, c.name as categoryName, COUNT(p.id) as count
    FROM categories c
    LEFT JOIN products p ON c.id = p.categoryId
    GROUP BY c.id
  `).all();

  res.json({ totalProducts, totalCategories, featuredCount, inStockCount, byCategory });
});

// GET /api/products/:id — get single product
router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT p.*, c.name as categoryName
    FROM products p
    LEFT JOIN categories c ON p.categoryId = c.id
    WHERE p.id = ?
  `).get(Number(req.params.id)) as ProductRow | undefined;

  if (!row) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(formatProduct(row));
});

// POST /api/products — create product (admin only)
router.post('/', (req, res) => {
  if (!(req.session as any)?.admin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { name, price, description, imageUrls, categoryId, featured, inStock } = req.body;

  const result = db.prepare(`
    INSERT INTO products (name, price, description, imageUrls, categoryId, featured, inStock)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(name, price, description || '', imageUrls || [], categoryId, featured ? 1 : 0, inStock !== false ? 1 : 0);

  const newProduct = db.prepare(`
    SELECT p.*, c.name as categoryName
    FROM products p
    LEFT JOIN categories c ON p.categoryId = c.id
    WHERE p.id = ?
  `).get(result.lastInsertRowid) as ProductRow;

  res.status(201).json(formatProduct(newProduct));
});

// PUT /api/products/:id — update product (admin only)
router.put('/:id', (req, res) => {
  if (!(req.session as any)?.admin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { name, price, description, imageUrls, categoryId, featured, inStock } = req.body;
  const id = Number(req.params.id);

  db.prepare(`
    UPDATE products
    SET name = ?, price = ?, description = ?, imageUrls = ?, categoryId = ?, featured = ?, inStock = ?
    WHERE id = ?
  `).run(name, price, description || '', imageUrls || [], categoryId, featured ? 1 : 0, inStock ? 1 : 0, id);

  const updated = db.prepare(`
    SELECT p.*, c.name as categoryName
    FROM products p
    LEFT JOIN categories c ON p.categoryId = c.id
    WHERE p.id = ?
  `).get(id) as ProductRow;

  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(formatProduct(updated));
});

// DELETE /api/products/:id — delete product (admin only)
router.delete('/:id', (req, res) => {
  if (!(req.session as any)?.admin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = db.prepare('DELETE FROM products WHERE id = ?').run(Number(req.params.id));

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json({ success: true });
});

export default router;
