const fetch = require('node-fetch');

async function testSwagger() {
  console.log('🧪 Probando la documentación Swagger...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Probando health check...');
    const healthResponse = await fetch('http://localhost:3001/');
    const healthText = await healthResponse.text();
    console.log(`✅ Health check: ${healthText}\n`);

    // Test 2: Swagger UI
    console.log('2️⃣ Probando Swagger UI...');
    const swaggerResponse = await fetch('http://localhost:3001/api-docs');
    if (swaggerResponse.ok) {
      console.log('✅ Swagger UI está disponible en http://localhost:3001/api-docs\n');
    } else {
      console.log('❌ Swagger UI no está disponible\n');
    }

    // Test 3: POST comment
    console.log('3️⃣ Probando POST /api/comments...');
    const commentData = {
      name: 'Test User',
      message: 'Este es un comentario de prueba para Swagger',
      isAnonymous: false
    };

    const postResponse = await fetch('http://localhost:3001/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commentData)
    });

    if (postResponse.status === 201) {
      const comment = await postResponse.json();
      console.log('✅ Comentario creado exitosamente:');
      console.log(`   ID: ${comment.id}`);
      console.log(`   Mensaje: ${comment.message}`);
      console.log(`   Código de respuesta: ${postResponse.status}\n`);
    } else {
      console.log(`❌ Error al crear comentario: ${postResponse.status}\n`);
    }

    // Test 4: GET comments
    console.log('4️⃣ Probando GET /api/comments...');
    const getResponse = await fetch('http://localhost:3001/api/comments');
    
    if (getResponse.ok) {
      const comments = await getResponse.json();
      console.log(`✅ Comentarios obtenidos: ${comments.length} comentarios`);
      console.log(`   Código de respuesta: ${getResponse.status}\n`);
    } else {
      console.log(`❌ Error al obtener comentarios: ${getResponse.status}\n`);
    }

    console.log('🎉 ¡Todas las pruebas completadas!');
    console.log('📖 Puedes acceder a la documentación Swagger en: http://localhost:3001/api-docs');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    console.log('\n💡 Asegúrate de que el servidor esté corriendo con: npm run dev');
  }
}

testSwagger(); 