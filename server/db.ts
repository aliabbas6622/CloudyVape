import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'cloudyvapours.json');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

interface Category {
  id: number;
  name: string;
  createdAt?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrls: string[];
  categoryId: number;
  featured: number;
  inStock: number;
  createdAt: string;
}

interface Setting {
  key: string;
  value: string;
}

interface DbSchema {
  categories: Category[];
  products: Product[];
  settings: Setting[];
}

// Load data
let data: DbSchema = { categories: [], products: [], settings: [] };

function load() {
  if (fs.existsSync(dbPath)) {
    try {
      data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } catch (err) {
      console.error('Failed to parse database file, resetting to empty', err);
    }
  }
}

function save() {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

load();

// Seed initial data if empty
if (data.categories.length === 0) {
  data.categories = [
    { id: 1, name: 'Pod Systems' },
    { id: 2, name: 'Box Mods' },
    { id: 3, name: 'Disposables' },
    { id: 4, name: 'E-Liquids' },
    { id: 5, name: 'Accessories' },
    { id: 6, name: 'Coils & Tanks' }
  ];

  data.products = [
    {
      id: 1,
      name: 'Vaporesso XROS 4',
      price: 5500,
      description: 'The Vaporesso XROS 4 pod system delivers exceptional flavor with its COREX 2.0 heating technology. Features adjustable airflow, 1000mAh battery, and sleek ergonomic design. Perfect for both MTL and RDL vaping.',
      imageUrls: [],
      categoryId: 1,
      featured: 1,
      inStock: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'SMOK Nord 5',
      price: 4800,
      description: 'Next-gen pod system with 2000mAh battery, 0.69" OLED screen, and 5ml pod capacity. Compatible with RPM 3 coils for unmatched cloud production and flavor.',
      imageUrls: [],
      categoryId: 1,
      featured: 1,
      inStock: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      name: 'GeekVape Aegis Legend 3',
      price: 14500,
      description: 'Triple-proof (water, dust, shock) box mod with dual 18650 batteries, 200W output, and the iconic Aegis durability. Features A-Lock safety system and 1.08" TFT color display.',
      imageUrls: [],
      categoryId: 2,
      featured: 1,
      inStock: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Voopoo Drag 4',
      price: 12000,
      description: 'Flagship dual-battery mod with GENE.TT 2.0 chip, 177W max output, and stunning resin panels. Lightning-fast 0.001s firing speed.',
      imageUrls: [],
      categoryId: 2,
      featured: 0,
      inStock: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 5,
      name: 'ELF Bar BC5000',
      price: 2800,
      description: 'Premium rechargeable disposable with 5000 puffs, 650mAh rechargeable battery, and 13ml pre-filled e-liquid. Available in 50+ flavors.',
      imageUrls: [],
      categoryId: 3,
      featured: 1,
      inStock: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 6,
      name: 'Lost Mary MO5000',
      price: 2500,
      description: 'Mesh coil disposable delivering rich, consistent flavor across 5000 puffs. Rechargeable USB-C with comfortable ergonomic grip.',
      imageUrls: [],
      categoryId: 3,
      featured: 0,
      inStock: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 7,
      name: 'Nasty Juice Cushman Series',
      price: 3200,
      description: 'Award-winning Malaysian e-liquid. The Cushman mango with its creamy, tropical notes is a global bestseller. 60ml bottle, available in 3mg and 6mg nicotine.',
      imageUrls: [],
      categoryId: 4,
      featured: 0,
      inStock: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 8,
      name: 'Dinner Lady Lemon Tart',
      price: 3500,
      description: "UK's #1 award-winning e-liquid. Rich lemon curd with buttery pastry base and light meringue finish. 60ml bottle in 3mg and 6mg options.",
      imageUrls: [],
      categoryId: 4,
      featured: 1,
      inStock: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 9,
      name: 'Uwell Caliburn G3 Pods (4-Pack)',
      price: 1800,
      description: 'Replacement pods for the Caliburn G3 system. 2.5ml capacity with built-in 0.6Ω and 0.9Ω coil options for versatile vaping.',
      imageUrls: [],
      categoryId: 5,
      featured: 0,
      inStock: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 10,
      name: 'SMOK RPM 3 Coils (5-Pack)',
      price: 1500,
      description: 'Mesh coil pack for RPM 3 series. 0.15Ω and 0.23Ω options for sub-ohm performance. Compatible with Nord 5, RPM 5, and RPM 5 Pro.',
      imageUrls: [],
      categoryId: 6,
      featured: 0,
      inStock: 1,
      createdAt: new Date().toISOString()
    }
  ];

  data.settings = [
    { key: 'whatsappNumber', value: '923432389520' },
    { key: 'adminPassword', value: '$2b$10$GD9U7e0Hzqn/U9t2E7eG2.6MXUTPXeKr8tCeqrrqLw8GCjkuPEiCS' }
  ];

  save();
}

class Statement {
  private sql: string;

  constructor(sql: string) {
    this.sql = sql.trim().replace(/\s+/g, ' ');
  }

  all(...args: any[]): any[] {
    const sql = this.sql;

    if (sql.includes('SELECT * FROM categories')) {
      return [...data.categories].sort((a, b) => a.id - b.id);
    }

    if (sql.includes('SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE p.categoryId = ?')) {
      const catId = Number(args[0]);
      return data.products
        .filter(p => p.categoryId === catId)
        .map(p => ({
          ...p,
          categoryName: data.categories.find(c => c.id === p.categoryId)?.name || ''
        }))
        .sort((a, b) => b.id - a.id);
    }

    if (sql.includes('SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.categoryId = c.id ORDER BY p.id DESC')) {
      return data.products
        .map(p => ({
          ...p,
          categoryName: data.categories.find(c => c.id === p.categoryId)?.name || ''
        }))
        .sort((a, b) => b.id - a.id);
    }

    if (sql.includes('SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE p.featured = 1')) {
      return data.products
        .filter(p => p.featured === 1)
        .map(p => ({
          ...p,
          categoryName: data.categories.find(c => c.id === p.categoryId)?.name || ''
        }))
        .sort((a, b) => b.id - a.id);
    }

    if (sql.includes('SELECT c.id as categoryId, c.name as categoryName, COUNT(p.id) as count FROM categories c')) {
      return data.categories.map(c => ({
        categoryId: c.id,
        categoryName: c.name,
        count: data.products.filter(p => p.categoryId === c.id).length
      }));
    }

    if (sql.includes("SELECT key, value FROM settings WHERE key != 'adminPassword'")) {
      return data.settings.filter(s => s.key !== 'adminPassword');
    }

    return [];
  }

  get(...args: any[]): any {
    const sql = this.sql;

    if (sql.includes('SELECT COUNT(*) as count FROM categories')) {
      return { count: data.categories.length };
    }

    if (sql.includes('SELECT COUNT(*) as count FROM products WHERE featured = 1')) {
      return { count: data.products.filter(p => p.featured === 1).length };
    }

    if (sql.includes('SELECT COUNT(*) as count FROM products WHERE inStock = 1')) {
      return { count: data.products.filter(p => p.inStock === 1).length };
    }

    if (sql.includes('SELECT COUNT(*) as count FROM products')) {
      return { count: data.products.length };
    }

    if (sql.includes('SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE p.id = ?')) {
      const id = Number(args[0]);
      const p = data.products.find(p => p.id === id);
      if (!p) return undefined;
      return {
        ...p,
        categoryName: data.categories.find(c => c.id === p.categoryId)?.name || ''
      };
    }

    if (sql.includes("SELECT value FROM settings WHERE key = 'adminPassword'")) {
      const s = data.settings.find(s => s.key === 'adminPassword');
      return s ? { value: s.value } : undefined;
    }

    if (sql.includes("SELECT COUNT(*) as count FROM products WHERE categoryId = ?")) {
      const catId = Number(args[0]);
      return { count: data.products.filter(p => p.categoryId === catId).length };
    }

    return undefined;
  }

  run(...args: any[]): { changes: number; lastInsertRowid: number } {
    const sql = this.sql;

    if (sql.includes('INSERT INTO categories')) {
      const name = args[0];
      const id = data.categories.length > 0 ? Math.max(...data.categories.map(c => c.id)) + 1 : 1;
      data.categories.push({ id, name });
      save();
      return { lastInsertRowid: id, changes: 1 };
    }

    if (sql.includes('DELETE FROM categories WHERE id = ?')) {
      const id = Number(args[0]);
      const prevLen = data.categories.length;
      data.categories = data.categories.filter(c => c.id !== id);
      save();
      return { changes: prevLen - data.categories.length, lastInsertRowid: 0 };
    }

    if (sql.includes('INSERT INTO products')) {
      const [name, price, description, imageUrls, categoryId, featured, inStock] = args;
      const id = data.products.length > 0 ? Math.max(...data.products.map(p => p.id)) + 1 : 1;
      data.products.push({
        id,
        name,
        price: Number(price),
        description: description || '',
        imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
        categoryId: Number(categoryId),
        featured: Number(featured),
        inStock: Number(inStock),
        createdAt: new Date().toISOString()
      });
      save();
      return { lastInsertRowid: id, changes: 1 };
    }

    if (sql.includes('UPDATE products')) {
      const [name, price, description, imageUrls, categoryId, featured, inStock, id] = args;
      const index = data.products.findIndex(p => p.id === Number(id));
      if (index !== -1) {
        data.products[index] = {
          ...data.products[index],
          name,
          price: Number(price),
          description: description || '',
          imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
          categoryId: Number(categoryId),
          featured: Number(featured),
          inStock: Number(inStock)
        };
        save();
        return { changes: 1, lastInsertRowid: Number(id) };
      }
      return { changes: 0, lastInsertRowid: 0 };
    }

    if (sql.includes('DELETE FROM products WHERE id = ?')) {
      const id = Number(args[0]);
      const prevLen = data.products.length;
      data.products = data.products.filter(p => p.id !== id);
      save();
      return { changes: prevLen - data.products.length, lastInsertRowid: 0 };
    }

    if (sql.includes('INSERT OR REPLACE INTO settings')) {
      const [key, value] = args;
      const index = data.settings.findIndex(s => s.key === key);
      if (index !== -1) {
        data.settings[index].value = String(value);
      } else {
        data.settings.push({ key, value: String(value) });
      }
      save();
      return { changes: 1, lastInsertRowid: 0 };
    }

    return { changes: 0, lastInsertRowid: 0 };
  }
}

const db = {
  prepare(sql: string) {
    return new Statement(sql);
  },
  transaction(fn: Function) {
    return (...args: any[]) => {
      const result = fn(...args);
      save();
      return result;
    };
  },
  pragma(pragmaStr: string) {
    // No-op
  }
};

export default db;
