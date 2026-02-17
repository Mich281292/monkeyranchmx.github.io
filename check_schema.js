const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/monkey_ranch',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function check() {
    try {
        const tables = ['ticket_purchases', 'vip_purchases', 'parking_purchases'];
        for (const table of tables) {
            const result = await pool.query(
                'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position',
                [table]
            );
            console.log(`\n${table}:`);
            result.rows.forEach(row => console.log(`  - ${row.column_name}: ${row.data_type}`));
        }
    } catch(e) {
        console.error('ERROR:', e.message);
    } finally {
        await pool.end();
    }
}

check();
