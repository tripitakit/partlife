const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 4000;

// Database setup
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./worlds.db', (err) => {
	if (err) {
		console.error('Error opening database', err.message);
	} else {
		console.log('Connected to the worlds database.');
		db.run(`CREATE TABLE IF NOT EXISTS worlds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
	}
});

// Security middleware
app.use(helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			scriptSrc: ["'self'", "'unsafe-inline'"],
			imgSrc: ["'self'", "data:", "https:"],
			upgradeInsecureRequests: null, // Disable upgrade-insecure-requests for HTTP-only
		},
	},
	crossOriginEmbedderPolicy: false,
	crossOriginOpenerPolicy: false,
	hsts: false, // Disable HSTS for HTTP-only production
}));

// Compression middleware
app.use(compression());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Main route
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).json({ status: 'ok' });
});

// API Endpoints
app.use(express.json());

// Save a world
app.post('/api/worlds', (req, res) => {
	console.log('POST /api/worlds - Request received');
	console.log('Request body:', req.body);
	const { config } = req.body;
	if (!config) {
		console.log('Error: Config is missing');
		return res.status(400).json({ error: 'Config is required' });
	}
	const sql = `INSERT INTO worlds (config) VALUES (?)`;
	db.run(sql, [JSON.stringify(config)], function (err) {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		res.json({ id: this.lastID, message: 'World saved successfully' });
	});
});

// Get all worlds
app.get('/api/worlds', (req, res) => {
	const sql = `SELECT id, created_at FROM worlds ORDER BY created_at DESC`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		res.json({ worlds: rows });
	});
});

// Get a specific world
app.get('/api/worlds/:id', (req, res) => {
	const sql = `SELECT config FROM worlds WHERE id = ?`;
	db.get(sql, [req.params.id], (err, row) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		if (!row) {
			return res.status(404).json({ error: 'World not found' });
		}
		res.json({ config: JSON.parse(row.config) });
	});
});

// 404 handler
app.use((req, res) => {
	res.status(404).send('Page not found');
});

// Error handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
	console.log(`Particle Life server running on port ${PORT}`);
	console.log(`Visit http://localhost:${PORT} to view the simulation`);
});


