#!/usr/bin/env node

/**
 * Script para resetear la base de datos de Monkey Ranch
 * Limpia todos los registros manteniendo la estructura de las tablas
 * 
 * Uso: node reset_database.js
 */

const { Pool } = require('pg');

// Usar DATABASE_URL de environment o conexión local
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/monkey_ranch',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function resetDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('🔄 Iniciando reset de la base de datos...\n');
        
        // Tablas a limpiar en orden (respetar relaciones si las hay)
        const tables = [
            'contacts',
            'vip_registrations',
            'inscriptions',
            'ticket_purchases',
            'vip_purchases',
            'parking_purchases'
        ];

        for (const table of tables) {
            try {
                const result = await client.query(`TRUNCATE TABLE ${table} CASCADE;`);
                console.log(`✅ Tabla '${table}' limpiada`);
            } catch (error) {
                console.log(`⚠️  Tabla '${table}' no encontrada o error: ${error.message}`);
            }
        }

        console.log('\n✅ Base de datos reseteada exitosamente');
        console.log('📊 Todas las tablas están vacías pero la estructura se mantiene');
        
    } catch (error) {
        console.error('❌ Error al resetear la base de datos:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Ejecutar
resetDatabase()
    .then(() => {
        console.log('\n✨ Proceso completado\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Fallo en el proceso:', error);
        process.exit(1);
    });
