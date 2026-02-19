require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Crear carpeta de uploads si no existe
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'));
        }
    }
});

// Middleware
app.use(cors({
    origin: '*',  // Permitir cualquier origen para debugging
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
}));
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware for API routes
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
            headers: req.headers,
            body: req.body
        });
    }
    next();
});

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static('uploads'));

// API routes should come BEFORE static file serving
// This ensures /api/* requests don't try to find static files first

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
                instagram VARCHAR(255),
                facebook VARCHAR(255),
                club_exclusivo VARCHAR(50),
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Add telefono column if it doesn't exist
        await pool.query(`
            ALTER TABLE contacts 
            ADD COLUMN IF NOT EXISTS telefono VARCHAR(50)
        `);
        
        // Add instagram column if it doesn't exist
        await pool.query(`
            ALTER TABLE contacts 
            ADD COLUMN IF NOT EXISTS instagram VARCHAR(255)
        `);
        
        // Add facebook column if it doesn't exist
        await pool.query(`
            ALTER TABLE contacts 
            ADD COLUMN IF NOT EXISTS facebook VARCHAR(255)
        `);

        // Add club_exclusivo column if it doesn't exist
        await pool.query(`
            ALTER TABLE contacts 
            ADD COLUMN IF NOT EXISTS club_exclusivo VARCHAR(50)
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
                instagram VARCHAR(255),
                facebook VARCHAR(255),
                club_exclusivo VARCHAR(50),
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
            ADD COLUMN IF NOT EXISTS numero_licencia VARCHAR(100),
            ADD COLUMN IF NOT EXISTS instagram VARCHAR(255),
            ADD COLUMN IF NOT EXISTS facebook VARCHAR(255),
            ADD COLUMN IF NOT EXISTS club_exclusivo VARCHAR(50)
        `);
        console.log('Inscriptions table ready');

        // Ticket purchases (General) table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ticket_purchases (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                telefono VARCHAR(50) NOT NULL,
                cantidad INT NOT NULL,
                fecha_evento DATE NOT NULL,
                precio VARCHAR(50) NOT NULL,
                comprobante VARCHAR(500),
                fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Add comprobante column if it doesn't exist
        await pool.query(`
            ALTER TABLE ticket_purchases 
            ADD COLUMN IF NOT EXISTS comprobante VARCHAR(500)
        `);
        console.log('Ticket purchases table ready');

        // VIP ticket purchases table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vip_purchases (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                telefono VARCHAR(50) NOT NULL,
                cantidad INT NOT NULL,
                duracion INT NOT NULL,
                fecha_evento DATE NOT NULL,
                precio VARCHAR(50) NOT NULL,
                comprobante VARCHAR(500),
                fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Add comprobante column if it doesn't exist
        await pool.query(`
            ALTER TABLE vip_purchases 
            ADD COLUMN IF NOT EXISTS comprobante VARCHAR(500)
        `);
        console.log('VIP purchases table ready');

        // Parking purchases table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS parking_purchases (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                telefono VARCHAR(50) NOT NULL,
                placas VARCHAR(50) NOT NULL,
                cantidad INT NOT NULL,
                fecha_evento DATE NOT NULL,
                precio VARCHAR(50) NOT NULL,
                comprobante VARCHAR(500),
                fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Add comprobante column if it doesn't exist
        await pool.query(`
            ALTER TABLE parking_purchases 
            ADD COLUMN IF NOT EXISTS comprobante VARCHAR(500)
        `);
        console.log('Parking purchases table ready');

        // Comprobantes Generales table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS comprobantes_generales (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                telefono VARCHAR(50) NOT NULL,
                cantidad INT NOT NULL,
                total VARCHAR(50) NOT NULL,
                fecha_evento DATE NOT NULL,
                comprobante_url VARCHAR(500) NOT NULL,
                fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Comprobantes Generales table ready');

        // Comprobantes VIP table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS comprobantes_vip (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                telefono VARCHAR(50) NOT NULL,
                cantidad INT NOT NULL,
                duracion INT NOT NULL,
                total VARCHAR(50) NOT NULL,
                fecha_evento DATE NOT NULL,
                comprobante_url VARCHAR(500) NOT NULL,
                fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Comprobantes VIP table ready');

        // Comprobantes Estacionamiento table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS comprobantes_estacionamiento (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                telefono VARCHAR(50) NOT NULL,
                placas VARCHAR(50) NOT NULL,
                cantidad INT NOT NULL,
                total VARCHAR(50) NOT NULL,
                fecha_evento DATE NOT NULL,
                comprobante_url VARCHAR(500) NOT NULL,
                fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Comprobantes Estacionamiento table ready');
    } catch (err) {
        console.error('Error creating tables:', err);
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/api/status', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Backend is running',
        timestamp: new Date().toISOString()
    });
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

    // Get optional social media fields
    const instagram = req.body.instagram || null;
    const facebook = req.body.facebook || null;
    const club_exclusivo = req.body.club_exclusivo || null;

    // Insert into database
    try {
        const result = await pool.query(
            'INSERT INTO contacts (nombre, email, telefono, mensaje, instagram, facebook, club_exclusivo) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [nombre, email, telefono, mensaje, instagram, facebook, club_exclusivo]
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
    const { nombre, email, telefono, instagram, facebook, club_exclusivo, edad, numero_moto, numero_licencia, categoria, cantidad_personas, cantidad_vehiculos, mensaje } = req.body;

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
            'INSERT INTO inscriptions (nombre, email, telefono, instagram, facebook, club_exclusivo, edad, numero_moto, numero_licencia, categoria, cantidad_personas, cantidad_vehiculos, mensaje) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id',
            [nombre, email, telefono, instagram || null, facebook || null, club_exclusivo || null, parseInt(edad), numero_moto, numero_licencia, categoria || null, cantidad_personas || null, cantidad_vehiculos || null, mensaje || null]
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

// POST endpoint for ticket purchases (General)
app.post('/api/ticket-purchase', async (req, res) => {
    const { nombre, email, telefono, cantidad, fecha_evento, precio, comprobante } = req.body;

    // Validation
    if (!nombre || !email || !telefono || !cantidad || !fecha_evento) {
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

    try {
        const result = await pool.query(
            'INSERT INTO ticket_purchases (nombre, email, telefono, cantidad, fecha_evento, precio, comprobante) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [nombre, email, telefono, parseInt(cantidad), fecha_evento, precio, comprobante || null]
        );

        res.status(201).json({
            success: true,
            message: '¡Compra de tickets procesada exitosamente! Nos contactaremos pronto.',
            id: result.rows[0].id
        });
    } catch (err) {
        console.error('Error inserting ticket purchase:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al guardar la compra'
        });
    }
});

// POST endpoint for uploading ticket proof
app.post('/api/ticket-purchase-proof', upload.single('comprobante'), async (req, res) => {
    try {
        const { nombre, email, telefono, cantidad, fecha_evento, total, compra_id } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Por favor, sube un comprobante'
            });
        }

        console.log('Ticket proof upload:', { filename: req.file.filename, size: req.file.size, mimetype: req.file.mimetype });
        
        const comprobanteUrl = `${process.env.BACKEND_URL || 'https://monkey-ranch-api.onrender.com'}/uploads/${req.file.filename}`;
        
        // Get the purchase ID from the latest ticket purchase if not provided
        let purchaseId = compra_id;
        if (!purchaseId) {
            const latestPurchase = await pool.query(
                'SELECT id FROM ticket_purchases WHERE nombre = $1 AND email = $2 ORDER BY fecha_compra DESC LIMIT 1',
                [nombre, email]
            );
            if (latestPurchase.rows.length > 0) {
                purchaseId = latestPurchase.rows[0].id;
            }
        }
        
        if (purchaseId) {
            // Update ticket purchase with proof
            await pool.query(
                'UPDATE ticket_purchases SET comprobante = $1 WHERE id = $2',
                [comprobanteUrl, purchaseId]
            );
        }
        
        // Also insert into comprobantes_generales table
        try {
            await pool.query(
                'INSERT INTO comprobantes_generales (nombre, email, telefono, cantidad, total, fecha_evento, comprobante_url) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [nombre, email, telefono, cantidad, total, fecha_evento, comprobanteUrl]
            );
            console.log('Inserted into comprobantes_generales for:', email);
        } catch (insertErr) {
            console.warn('Warning: Could not insert into comprobantes_generales:', insertErr.message);
            // Don't fail the request if comprobantes_generales insert fails
        }

        res.json({
            success: true,
            message: '¡Comprobante recibido! Verificaremos tu pago pronto.',
            comprobante_url: comprobanteUrl
        });
    } catch (err) {
        console.error('Error uploading ticket proof:', err.message, err.stack);
        return res.status(500).json({
            success: false,
            message: 'Error al guardar el comprobante: ' + err.message
        });
    }
});

// GET endpoint to fetch all ticket purchases
app.get('/api/ticket-purchases', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ticket_purchases ORDER BY fecha_compra DESC');

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching ticket purchases:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener compras de tickets'
        });
    }
});

// POST endpoint for VIP ticket purchases
app.post('/api/vip-purchase', async (req, res) => {
    const { nombre, email, telefono, cantidad, duracion, fecha_evento, precio, comprobante } = req.body;

    // Validation
    if (!nombre || !email || !telefono || !cantidad || !duracion || !fecha_evento) {
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

    try {
        const result = await pool.query(
            'INSERT INTO vip_purchases (nombre, email, telefono, cantidad, duracion, fecha_evento, precio, comprobante) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [nombre, email, telefono, parseInt(cantidad), parseInt(duracion), fecha_evento, precio, comprobante || null]
        );

        res.status(201).json({
            success: true,
            message: '¡Compra VIP procesada exitosamente! Nos contactaremos pronto.',
            id: result.rows[0].id
        });
    } catch (err) {
        console.error('Error inserting VIP purchase:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al guardar la compra VIP'
        });
    }
});

// POST endpoint for uploading VIP ticket proof
app.post('/api/vip-purchase-proof', upload.single('comprobante'), async (req, res) => {
    try {
        const { nombre, email, telefono, cantidad, duracion, fecha_evento, total, compra_id } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Por favor, sube un comprobante'
            });
        }

        console.log('VIP proof upload:', { filename: req.file.filename, size: req.file.size, mimetype: req.file.mimetype });
        
        const comprobanteUrl = `${process.env.BACKEND_URL || 'https://monkey-ranch-api.onrender.com'}/uploads/${req.file.filename}`;
        
        // Get the purchase ID from the latest VIP purchase if not provided
        let purchaseId = compra_id;
        if (!purchaseId) {
            const latestPurchase = await pool.query(
                'SELECT id FROM vip_purchases WHERE nombre = $1 AND email = $2 ORDER BY fecha_compra DESC LIMIT 1',
                [nombre, email]
            );
            if (latestPurchase.rows.length > 0) {
                purchaseId = latestPurchase.rows[0].id;
            }
        }
        
        if (purchaseId) {
            // Update VIP purchase with proof
            await pool.query(
                'UPDATE vip_purchases SET comprobante = $1 WHERE id = $2',
                [comprobanteUrl, purchaseId]
            );
        }
        
        // Also insert into comprobantes_vip table
        try {
            await pool.query(
                'INSERT INTO comprobantes_vip (nombre, email, telefono, cantidad, duracion, total, fecha_evento, comprobante_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [nombre, email, telefono, cantidad, duracion, total, fecha_evento, comprobanteUrl]
            );
            console.log('Inserted into comprobantes_vip for:', email);
        } catch (insertErr) {
            console.warn('Warning: Could not insert into comprobantes_vip:', insertErr.message);
            // Don't fail the request if comprobantes_vip insert fails
        }

        res.json({
            success: true,
            message: '¡Comprobante recibido! Verificaremos tu pago pronto.',
            comprobante_url: comprobanteUrl
        });
    } catch (err) {
        console.error('Error uploading VIP proof:', err.message, err.stack);
        return res.status(500).json({
            success: false,
            message: 'Error al guardar el comprobante: ' + err.message
        });
    }
});

// GET endpoint to fetch all VIP ticket purchases
app.get('/api/vip-purchases', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vip_purchases ORDER BY fecha_compra DESC');

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching VIP purchases:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener compras VIP'
        });
    }
});

// POST endpoint for parking purchases
app.post('/api/parking-purchase', async (req, res) => {
    const { nombre, email, telefono, placas, cantidad, fecha_evento, precio, comprobante } = req.body;

    // Validation
    if (!nombre || !email || !telefono || !placas || !cantidad || !fecha_evento) {
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

    try {
        const result = await pool.query(
            'INSERT INTO parking_purchases (nombre, email, telefono, placas, cantidad, fecha_evento, precio, comprobante) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [nombre, email, telefono, placas, parseInt(cantidad), fecha_evento, precio, comprobante || null]
        );

        res.status(201).json({
            success: true,
            message: '¡Estacionamiento apartado exitosamente! Nos contactaremos pronto.',
            id: result.rows[0].id
        });
    } catch (err) {
        console.error('Error inserting parking purchase:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al guardar el estacionamiento'
        });
    }
});

// POST endpoint for uploading parking proof
app.post('/api/parking-purchase-proof', upload.single('comprobante'), async (req, res) => {
    try {
        const { nombre, email, telefono, placas, cantidad, fecha_evento, total, compra_id } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Por favor, sube un comprobante'
            });
        }

        console.log('Parking proof upload:', { filename: req.file.filename, size: req.file.size, mimetype: req.file.mimetype });
        
        const comprobanteUrl = `${process.env.BACKEND_URL || 'https://monkey-ranch-api.onrender.com'}/uploads/${req.file.filename}`;
        
        // Get the purchase ID from the latest parking purchase if not provided
        let purchaseId = compra_id;
        if (!purchaseId) {
            const latestPurchase = await pool.query(
                'SELECT id FROM parking_purchases WHERE nombre = $1 AND email = $2 ORDER BY fecha_compra DESC LIMIT 1',
                [nombre, email]
            );
            if (latestPurchase.rows.length > 0) {
                purchaseId = latestPurchase.rows[0].id;
            }
        }
        
        if (purchaseId) {
            // Update parking purchase with proof
            await pool.query(
                'UPDATE parking_purchases SET comprobante = $1 WHERE id = $2',
                [comprobanteUrl, purchaseId]
            );
        }
        
        // Also insert into comprobantes_estacionamiento table
        try {
            await pool.query(
                'INSERT INTO comprobantes_estacionamiento (nombre, email, telefono, placas, cantidad, total, fecha_evento, comprobante_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [nombre, email, telefono, placas, cantidad, total, fecha_evento, comprobanteUrl]
            );
            console.log('Inserted into comprobantes_estacionamiento for:', email);
        } catch (insertErr) {
            console.warn('Warning: Could not insert into comprobantes_estacionamiento:', insertErr.message);
            // Don't fail the request if comprobantes_estacionamiento insert fails
        }

        res.json({
            success: true,
            message: '¡Comprobante recibido! Procesaremos tu solicitud pronto.',
            comprobante_url: comprobanteUrl
        });
    } catch (err) {
        console.error('Error uploading parking proof:', err.message, err.stack);
        return res.status(500).json({
            success: false,
            message: 'Error al guardar el comprobante: ' + err.message
        });
    }
});

// GET endpoint to fetch all parking purchases
app.get('/api/parking-purchases', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM parking_purchases ORDER BY fecha_compra DESC');

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching parking purchases:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener estacionamientos'
        });
    }
});

// POST endpoint for general ticket proof
app.post('/api/comprobante-general', upload.single('comprobante'), async (req, res) => {
    const { nombre, email, telefono, cantidad, total, fecha_evento } = req.body;

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Por favor, sube un comprobante'
        });
    }

    try {
        const comprobanteUrl = `${process.env.BACKEND_URL || 'https://monkey-ranch-api.onrender.com'}/uploads/${req.file.filename}`;
        
        await pool.query(
            'INSERT INTO comprobantes_generales (nombre, email, telefono, cantidad, total, fecha_evento, comprobante_url) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [nombre, email, telefono, parseInt(cantidad), total, fecha_evento, comprobanteUrl]
        );

        res.json({
            success: true,
            message: '¡Comprobante recibido! Procesaremos tu compra pronto.',
            comprobante_url: comprobanteUrl
        });
    } catch (err) {
        console.error('Error uploading proof:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al guardar el comprobante'
        });
    }
});

// GET endpoint for general proofs
app.get('/api/comprobantes-generales', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM comprobantes_generales ORDER BY fecha_carga DESC');

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching proofs:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener comprobantes'
        });
    }
});

// POST endpoint for VIP ticket proof
app.post('/api/comprobante-vip', upload.single('comprobante'), async (req, res) => {
    const { nombre, email, telefono, cantidad, duracion, total, fecha_evento } = req.body;

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Por favor, sube un comprobante'
        });
    }

    try {
        const comprobanteUrl = `${process.env.BACKEND_URL || 'https://monkey-ranch-api.onrender.com'}/uploads/${req.file.filename}`;
        
        await pool.query(
            'INSERT INTO comprobantes_vip (nombre, email, telefono, cantidad, duracion, total, fecha_evento, comprobante_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [nombre, email, telefono, parseInt(cantidad), parseInt(duracion), total, fecha_evento, comprobanteUrl]
        );

        res.json({
            success: true,
            message: '¡Comprobante recibido! Procesaremos tu compra pronto.',
            comprobante_url: comprobanteUrl
        });
    } catch (err) {
        console.error('Error uploading proof:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al guardar el comprobante'
        });
    }
});

// GET endpoint for VIP proofs
app.get('/api/comprobantes-vip', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM comprobantes_vip ORDER BY fecha_carga DESC');

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching proofs:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener comprobantes VIP'
        });
    }
});

// POST endpoint for parking proof
app.post('/api/comprobante-estacionamiento', upload.single('comprobante'), async (req, res) => {
    const { nombre, email, telefono, placas, cantidad, total, fecha_evento } = req.body;

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Por favor, sube un comprobante'
        });
    }

    try {
        const comprobanteUrl = `${process.env.BACKEND_URL || 'https://monkey-ranch-api.onrender.com'}/uploads/${req.file.filename}`;
        
        await pool.query(
            'INSERT INTO comprobantes_estacionamiento (nombre, email, telefono, placas, cantidad, total, fecha_evento, comprobante_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [nombre, email, telefono, placas, parseInt(cantidad), total, fecha_evento, comprobanteUrl]
        );

        res.json({
            success: true,
            message: '¡Comprobante recibido! Procesaremos tu solicitud pronto.',
            comprobante_url: comprobanteUrl
        });
    } catch (err) {
        console.error('Error uploading proof:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al guardar el comprobante'
        });
    }
});

// GET endpoint for parking proofs
app.get('/api/comprobantes-estacionamiento', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM comprobantes_estacionamiento ORDER BY fecha_carga DESC');

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching proofs:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener comprobantes de estacionamiento'
        });
    }
});

// Endpoint para guardar compra de tickets generales
app.post('/api/save-ticket-purchase', async (req, res) => {
    try {
        console.log('POST /api/save-ticket-purchase - Request body:', req.body);
        const { nombre, email, telefono, cantidad, fecha_evento, total } = req.body;
        
        if (!nombre || !email || !telefono || !cantidad || !fecha_evento) {
            console.warn('Missing required fields:', { nombre, email, telefono, cantidad, fecha_evento });
            return res.status(400).json({ success: false, message: 'Datos incompletos' });
        }

        const result = await pool.query(
            `INSERT INTO ticket_purchases (nombre, email, telefono, cantidad, fecha_evento, precio) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [nombre, email, telefono, parseInt(cantidad), fecha_evento, total]
        );

        console.log('Ticket purchase saved with ID:', result.rows[0].id);
        res.json({ success: true, message: 'Compra guardada', id: result.rows[0].id });
    } catch (error) {
        console.error('Error saving ticket purchase:', error.message, error.stack);
        res.status(500).json({ success: false, message: 'Error: ' + error.message });
    }
});

// Endpoint para guardar compra VIP
app.post('/api/save-vip-purchase', async (req, res) => {
    try {
        console.log('POST /api/save-vip-purchase - Request body:', req.body);
        const { nombre, email, telefono, cantidad, duracion, fecha_evento, total } = req.body;
        
        if (!nombre || !email || !telefono || !cantidad || !duracion || !fecha_evento) {
            console.warn('Missing required fields:', { nombre, email, telefono, cantidad, duracion, fecha_evento });
            return res.status(400).json({ success: false, message: 'Datos incompletos' });
        }

        const result = await pool.query(
            `INSERT INTO vip_purchases (nombre, email, telefono, cantidad, duracion, fecha_evento, precio) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [nombre, email, telefono, parseInt(cantidad), parseInt(duracion), fecha_evento, total]
        );

        console.log('VIP purchase saved with ID:', result.rows[0].id);
        res.json({ success: true, message: 'Compra VIP guardada', id: result.rows[0].id });
    } catch (error) {
        console.error('Error saving VIP purchase:', error.message, error.stack);
        res.status(500).json({ success: false, message: 'Error: ' + error.message });
    }
});

// Endpoint para guardar compra de estacionamiento
app.post('/api/save-parking-purchase', async (req, res) => {
    try {
        console.log('POST /api/save-parking-purchase - Request body:', req.body);
        const { nombre, email, telefono, placas, cantidad, fecha_evento, total } = req.body;
        
        if (!nombre || !email || !telefono || !placas || !cantidad || !fecha_evento) {
            console.warn('Missing required fields:', { nombre, email, telefono, placas, cantidad, fecha_evento });
            return res.status(400).json({ success: false, message: 'Datos incompletos' });
        }

        const result = await pool.query(
            `INSERT INTO parking_purchases (nombre, email, telefono, placas, cantidad, fecha_evento, precio) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [nombre, email, telefono, placas, parseInt(cantidad), fecha_evento, total]
        );

        console.log('Parking purchase saved with ID:', result.rows[0].id);
        res.json({ success: true, message: 'Compra de estacionamiento guardada', id: result.rows[0].id });
    } catch (error) {
        console.error('Error saving parking purchase:', error.message, error.stack);
        res.status(500).json({ success: false, message: 'Error: ' + error.message });
    }
});

// Static file serving (after all API routes)
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global error handler
app.use((err, req, res, next) => {
    console.error('Express Error:', err);
    res.status(500).json({
        success: false,
        message: 'Error del servidor',
        error: err.message
    });
});

// 404 handler
app.use((req, res) => {
    console.warn(`404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        message: `Endpoint not found: ${req.method} ${req.path}`
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🐵 Monkey Ranch server running on port ${PORT}`);
    console.log(`Available endpoints:`);
    console.log(`  POST /api/save-ticket-purchase`);
    console.log(`  POST /api/save-vip-purchase`);
    console.log(`  POST /api/save-parking-purchase`);
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

// CORS configured for monkeyranch.com.mx and www.monkeyranch.com.mx
