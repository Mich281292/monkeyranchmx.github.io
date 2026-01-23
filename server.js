const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Database setup
const dbPath = path.join(__dirname, 'contacts.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL,
            mensaje TEXT NOT NULL,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('Contacts table ready');
        }
    });
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// POST endpoint for contact form
app.post('/api/contact', (req, res) => {
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
    db.run(
        'INSERT INTO contacts (nombre, email, mensaje) VALUES (?, ?, ?)',
        [nombre, email, mensaje],
        function(err) {
            if (err) {
                console.error('Error inserting contact:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al guardar el contacto'
                });
            }

            res.status(201).json({
                success: true,
                message: '¡Gracias por tu mensaje! Nos pondremos en contacto pronto.',
                id: this.lastID
            });
        }
    );
});

// GET endpoint to fetch all contacts (admin use)
app.get('/api/contacts', (req, res) => {
    db.all('SELECT * FROM contacts ORDER BY fecha_creacion DESC', (err, rows) => {
        if (err) {
            console.error('Error fetching contacts:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener contactos'
            });
        }

        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🐵 Monkey Ranch server running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
