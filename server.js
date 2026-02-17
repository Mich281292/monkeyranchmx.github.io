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
        // Contacts table (general contact form)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                telefono VARCHAR(50),
                mensaje TEXT NOT NULL,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Add telefono column if it doesn't exist
        await pool.query(`
            ALTER TABLE contacts 
            ADD COLUMN IF NOT EXISTS telefono VARCHAR(50)
        `);
        
        console.log('Contacts table ready');

        // VIP registrations table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vip_registrations (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                whatsapp VARCHAR(50) NOT NULL,
                boletos VARCHAR(50) NOT NULL,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('VIP registrations table ready');

        // Inscriptions table (motocross/trackday)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS inscriptions (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                telefono VARCHAR(50) NOT NULL,
                edad INT,
                numero_moto VARCHAR(100),
                numero_licencia VARCHAR(100),
                categoria VARCHAR(100),
                cantidad_personas VARCHAR(50),
                cantidad_vehiculos VARCHAR(50),
                mensaje TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Add new columns if they don't exist
        await pool.query(`
            ALTER TABLE inscriptions 
            ADD COLUMN IF NOT EXISTS edad INT,
            ADD COLUMN IF NOT EXISTS numero_moto VARCHAR(100),
            ADD COLUMN IF NOT EXISTS numero_licencia VARCHAR(100)
        `);
        console.log('Inscriptions table ready');
    } catch (err) {
        console.error('Error creating tables:', err);
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// POST endpoint for contact form
app.post('/api/contact', async (req, res) => {
    const { nombre, email, telefono, mensaje } = req.body;

    // Validation
    if (!nombre || !email || !telefono || !mensaje) {
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
            'INSERT INTO contacts (nombre, email, telefono, mensaje) VALUES ($1, $2, $3, $4) RETURNING id',
            [nombre, email, telefono, mensaje]
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

// POST endpoint for VIP registration
app.post('/api/vip', async (req, res) => {
    const { nombre, email, whatsapp, boletos } = req.body;

    // Validation
    if (!nombre || !email || !whatsapp || !boletos) {
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
            'INSERT INTO vip_registrations (nombre, email, whatsapp, boletos) VALUES ($1, $2, $3, $4) RETURNING id',
            [nombre, email, whatsapp, boletos]
        );

        res.status(201).json({
            success: true,
            message: '¡Gracias por tu registro VIP! Nos pondremos en contacto pronto.',
            id: result.rows[0].id
        });
    } catch (err) {
        console.error('Error inserting VIP registration:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al guardar el registro VIP'
        });
    }
});

// GET endpoint to fetch all VIP registrations
app.get('/api/vip', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vip_registrations ORDER BY fecha_creacion DESC');

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching VIP registrations:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener registros VIP'
        });
    }
});

// POST endpoint for inscriptions (motocross/trackday)
app.post('/api/inscripcion', async (req, res) => {
    const { nombre, email, telefono, edad, numero_moto, numero_licencia, categoria, cantidad_personas, cantidad_vehiculos, mensaje } = req.body;

    // Validation
    if (!nombre || !email || !telefono || !edad || !numero_moto || !numero_licencia) {
        return res.status(400).json({
            success: false,
            message: 'Por favor, completa todos los campos requeridos'
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
            'INSERT INTO inscriptions (nombre, email, telefono, edad, numero_moto, numero_licencia, categoria, cantidad_personas, cantidad_vehiculos, mensaje) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
            [nombre, email, telefono, parseInt(edad), numero_moto, numero_licencia, categoria || null, cantidad_personas || null, cantidad_vehiculos || null, mensaje || null]
        );

        res.status(201).json({
            success: true,
            message: '¡Inscripción completada! Te contactaremos pronto.',
            id: result.rows[0].id
        });
    } catch (err) {
        console.error('Error inserting inscription:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al guardar la inscripción'
        });
    }
});

// GET endpoint to fetch all inscriptions
app.get('/api/inscripciones', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inscriptions ORDER BY fecha_creacion DESC');

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching inscriptions:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener inscripciones'
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
