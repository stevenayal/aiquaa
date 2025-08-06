const fetch = require('node-fetch');

async function testCommentsEndpoint() {
  try {
    console.log('🧪 Probando endpoint POST /api/comments...');
    
    const response = await fetch('http://localhost:3001/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        message: 'Este es un comentario de prueba',
        isAnonymous: false
      })
    });

    const data = await response.json();
    console.log('✅ POST /api/comments - Respuesta:', data);
    console.log('📊 Status:', response.status);

    console.log('\n🧪 Probando endpoint GET /api/comments...');
    
    const getResponse = await fetch('http://localhost:3001/api/comments');
    const comments = await getResponse.json();
    console.log('✅ GET /api/comments - Respuesta:', comments);
    console.log('📊 Status:', getResponse.status);
    console.log('📝 Número de comentarios:', comments.length);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCommentsEndpoint(); 