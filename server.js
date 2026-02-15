require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// PostgreSQL Database setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/monkey_ranch',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Test connection and initialize
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err);
    } else {
        console.log('Connected to PostgreSQL database');
        release();
        initializeDatabase();
    }
});

// Initialize database tables
async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                mensaje TEXT NOT NULL,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Contacts table ready');
    } catch (err) {
        console.error('Error creating table:', err);
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// POST endpoint for contact form
app.post('/api/contact', async (req, res) => {
    const { nombre, email, mensaje } = req.body;

    // Validation
    if (!nombre || !email || !mensaje) {
        return res.status(400).json({
            success: false,
            message: 'Por favor, completa todos los campos'
        });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Por favor, ingresa un email válido'
        });
    }

    // Insert into database
    try {
        const result = await pool.query(
            'INSERT INTO contacts (nombre, email, mensaje) VALUES ($1, $2, $3) RETURNING id',
            [nombre, email, mensaje]
        );

        res.status(201).json({
            success: true,
            message: '¡Gracias por tu mensaje! Nos pondremos en contacto pronto.',
            id: result.rows[0].id
        });
    } catch (err) {
        console.error('Error inserting contact:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al guardar el contacto'
        });
    }
});

// GET endpoint to fetch all contacts (admin use)
app.get('/api/contacts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM contacts ORDER BY fecha_creacion DESC');

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching contacts:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener contactos'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🐵 Monkey Ranch server running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    try {
        await pool.end();
        console.log('Database connection closed');
    } catch (err) {
        console.error('Error closing database:', err);
    }
    process.exit(0);
});
