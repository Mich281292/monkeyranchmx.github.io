require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/monkey_ranch',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function fixComprobanteColumns() {
    try {
        console.log('Connecting to database...');
        
        const tables = [
            'ticket_purchases',
            'vip_purchases', 
            'parking_purchases',
            'comprobantes_generales',
            'comprobantes_vip',
            'comprobantes_estacionamiento'
        ];

        for (const table of tables) {
            try {
                console.log(`\nProcessing table: ${table}`);
                
                // Check if comprobante column exists and its type
                const checkColumn = await pool.query(`
                    SELECT column_name, data_type
                    FROM information_schema.columns 
                    WHERE table_name = $1 AND column_name = 'comprobante'
                `, [table]);

                if (checkColumn.rows.length > 0) {
                    console.log(`  - Column exists as type: ${checkColumn.rows[0].data_type}`);
                    
                    // Try to drop and recreate the column as TEXT
                    try {
                        console.log(`  - Dropping old comprobante column...`);
                        await pool.query(`ALTER TABLE ${table} DROP COLUMN comprobante`);
                    } catch (e) {
                        console.log(`  - Could not drop column (might have constraints): ${e.message}`);
                    }
                }
                
                // Add comprobante as TEXT
                try {
                    console.log(`  - Adding comprobante as TEXT...`);
                    await pool.query(`ALTER TABLE ${table} ADD COLUMN comprobante TEXT`);
                    console.log(`  ✓ Successfully added comprobante as TEXT`);
                } catch (e) {
                    if (e.message.includes('already exists')) {
                        console.log(`  - Column already exists, attempting to alter type...`);
                        try {
                            await pool.query(`ALTER TABLE ${table} ALTER COLUMN comprobante TYPE TEXT`);
                            console.log(`  ✓ Successfully altered comprobante to TEXT`);
                        } catch (e2) {
                            console.log(`  ✗ Error altering column: ${e2.message}`);
                        }
                    } else {
                        console.log(`  ✗ Error adding column: ${e.message}`);
                    }
                }

            } catch (e) {
                console.log(`  ✗ Error processing table: ${e.message}`);
            }
        }

        console.log('\n✓ Fix complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixComprobanteColumns();
