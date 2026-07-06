import express from 'express';
import session from 'express-session';
import cors from 'cors';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import adminRouter from './routes/admin.js';
import settingsRouter from './routes/settings.js';

const app = express();
const port = process.env.PORT || 3001;

// CORS setup
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'cloudy-vapours-secret-key-jauhar-karachi',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if running over HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/settings', settingsRouter);

// Start server
app.listen(port, () => {
  console.log(`[server] Backend listening on port ${port}`);
});
