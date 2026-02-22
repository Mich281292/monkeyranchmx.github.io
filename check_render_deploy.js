// Script para monitorear el deploy de Render
const http = require('http');

const checkEndpoint = () => {
    const options = {
        hostname: 'monkey-ranch-api.onrender.com',
        path: '/api/visits?days=7',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                
                if (response.lastVisitTime) {
                    console.log('\n✅ ¡RENDER ACTUALIZADO CON ÉXITO!');
                    console.log('Response:', JSON.stringify(response, null, 2));
                    process.exit(0);
                } else {
                    console.log(`❌ ${new Date().toLocaleTimeString()} - Render aún no retorna lastVisitTime`);
                    console.log('Data:', JSON.stringify(response, null, 2));
                    console.log('\nReinentando en 30 segundos...\n');
                    setTimeout(checkEndpoint, 30000);
                }
            } catch (e) {
                console.log(`❌ Error parsing response at ${new Date().toLocaleTimeString()}`);
                console.log('Raw:', data);
                setTimeout(checkEndpoint, 30000);
            }
        });
    });

    req.on('error', (error) => {
        console.log(`❌ Error: ${error.message}`);
        setTimeout(checkEndpoint, 30000);
    });

    req.end();
};

console.log('🔍 Monitoreando deploy de Render...');
console.log('Esperando que lastVisitTime aparezca en la respuesta del API...\n');
checkEndpoint();
