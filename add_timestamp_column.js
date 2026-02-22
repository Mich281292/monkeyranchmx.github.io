// Script para agregar columna last_visit_timestamp a page_visits
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/monkey_ranch',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function addTimestampColumn() {
    try {
        console.log('Conectando a la base de datos...');
        
        // Verificar si la columna ya existe
        console.log('Verificando estructura de page_visits...');
        const checkColumn = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'page_visits' 
            AND column_name = 'last_visit_timestamp'
        `);
        
        if (checkColumn.rows.length > 0) {
            console.log('✅ La columna last_visit_timestamp ya existe');
        } else {
            console.log('⚠️  La columna last_visit_timestamp no existe, agregándola...');
            
            // Agregar la columna
            await pool.query(`
                ALTER TABLE page_visits
                ADD COLUMN last_visit_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            `);
            
            console.log('✅ Columna last_visit_timestamp agregada exitosamente');
            
            // Actualizar registros existentes con timestamp actual
            await pool.query(`
                UPDATE page_visits
                SET last_visit_timestamp = CURRENT_TIMESTAMP
                WHERE last_visit_timestamp IS NULL
            `);
            
            console.log('✅ Registros existentes actualizados');
        }
        
        // Mostrar estructura actualizada
        const columns = await pool.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns 
            WHERE table_name = 'page_visits'
            ORDER BY ordinal_position
        `);
        
        console.log('\n📋 Estructura de page_visits:');
        console.table(columns.rows);
        
        // Mostrar datos existentes
        const data = await pool.query(`
            SELECT * FROM page_visits ORDER BY visit_date DESC LIMIT 5
        `);
        
        console.log('\n📊 Datos en page_visits:');
        console.table(data.rows);
        
        await pool.end();
        console.log('\n✅ Migración completada exitosamente');
    } catch (error) {
        console.error('❌ Error:', error);
        await pool.end();
        process.exit(1);
    }
}

addTimestampColumn();
