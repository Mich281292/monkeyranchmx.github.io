// Script de prueba para registrar una visita inicial
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/monkey_ranch',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function testInitialVisit() {
    try {
        console.log('Conectando a la base de datos...');
        
        // Registrar una visita de prueba
        console.log('Insertando visita de prueba...');
        await pool.query(
            `INSERT INTO page_visits (visit_date, count, last_visit_timestamp)
             VALUES (CURRENT_DATE, 1, CURRENT_TIMESTAMP)
             ON CONFLICT (visit_date)
             DO UPDATE SET count = page_visits.count + 1, last_visit_timestamp = CURRENT_TIMESTAMP`
        );
        
        console.log('✅ Visita registrada exitosamente');
        
        // Verificar datos
        const result = await pool.query(
            `SELECT visit_date, count, last_visit_timestamp FROM page_visits ORDER BY visit_date DESC LIMIT 5`
        );
        
        console.log('\n📊 Datos en page_visits:');
        console.log(result.rows);
        
        // Verificar último timestamp
        const lastVisit = await pool.query(
            `SELECT MAX(last_visit_timestamp) as last_visit_time FROM page_visits`
        );
        
        console.log('\n⏰ Última visita registrada:');
        console.log(lastVisit.rows[0]);
        
        await pool.end();
        console.log('\n✅ Test completado');
    } catch (error) {
        console.error('❌ Error:', error);
        await pool.end();
        process.exit(1);
    }
}

testInitialVisit();
