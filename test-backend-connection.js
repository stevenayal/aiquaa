import fetch from 'node-fetch';

// URLs a probar
const urls = [
  'http://localhost:3001',
  'https://api.aiquaa.com'
];

async function testBackendConnection() {
  console.log('🧪 Probando conexión al backend...\n');

  for (const url of urls) {
    try {
      console.log(`Probando: ${url}`);
      
      // Test health check
      const healthResponse = await fetch(`${url}/`);
      if (healthResponse.ok) {
        const healthText = await healthResponse.text();
        console.log(`✅ Health check exitoso: ${healthText}`);
        
        // Test comments endpoint
        const commentsResponse = await fetch(`${url}/api/comments`);
        if (commentsResponse.ok) {
          const comments = await commentsResponse.json();
          console.log(`✅ Endpoint de comentarios funcionando: ${comments.length} comentarios`);
        } else {
          console.log(`❌ Error en endpoint de comentarios: ${commentsResponse.status}`);
        }
      } else {
        console.log(`❌ Health check falló: ${healthResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Error conectando a ${url}: ${error.message}`);
    }
    console.log('---');
  }
}

testBackendConnection(); 