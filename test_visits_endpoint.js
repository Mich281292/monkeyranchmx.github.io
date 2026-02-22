// Test del endpoint GET /api/visits
const https = require('https');
const http = require('http');

async function testVisitsEndpoint() {
    try {
        const API_URL = 'http://localhost:3000/api/visits?days=7';
        
        console.log(`Probando: ${API_URL}`);
        
        http.get(API_URL, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                const result = JSON.parse(data);
                
                console.log('\n📊 Response del endpoint:');
                console.log(JSON.stringify(result, null, 2));
                
                if (result.lastVisitTime) {
                    const lastDate = new Date(result.lastVisitTime);
                    console.log('\n⏰ Última visita formateada:');
                    console.log(lastDate.toLocaleDateString('es-ES', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }));
                } else {
                    console.log('\n⚠️  lastVisitTime es null');
                }
            });
        }).on('error', (error) => {
            console.error('❌ Error:', error.message);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testVisitsEndpoint();
