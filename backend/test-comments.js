const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

async function testComments() {
  console.log('🧪 Probando endpoints de comentarios...\n');

  try {
    // Test 1: Crear un comentario
    console.log('1. Probando crear comentario...');
    const createResponse = await fetch(`${API_BASE_URL}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        message: 'Este es un comentario de prueba para verificar que funciona correctamente.',
        isAnonymous: false
      }),
    });
    
    if (!createResponse.ok) {
      throw new Error(`Error al crear comentario: ${createResponse.status} ${createResponse.statusText}`);
    }
    
    const createdComment = await createResponse.json();
    console.log('✅ Comentario creado:', createdComment);

    // Test 2: Obtener todos los comentarios
    console.log('\n2. Probando obtener comentarios...');
    const getResponse = await fetch(`${API_BASE_URL}/api/comments`);
    
    if (!getResponse.ok) {
      throw new Error(`Error al obtener comentarios: ${getResponse.status} ${getResponse.statusText}`);
    }
    
    const comments = await getResponse.json();
    console.log('✅ Comentarios obtenidos:', comments.length, 'registros');
    console.log('Primer comentario:', comments[0]);

    // Test 3: Crear comentario anónimo
    console.log('\n3. Probando crear comentario anónimo...');
    const anonymousResponse = await fetch(`${API_BASE_URL}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '',
        message: 'Este es un comentario anónimo de prueba.',
        isAnonymous: true
      }),
    });
    
    if (!anonymousResponse.ok) {
      throw new Error(`Error al crear comentario anónimo: ${anonymousResponse.status} ${anonymousResponse.statusText}`);
    }
    
    const anonymousComment = await anonymousResponse.json();
    console.log('✅ Comentario anónimo creado:', anonymousComment);

    console.log('\n🎉 ¡Todas las pruebas de comentarios pasaron exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

testComments(); 