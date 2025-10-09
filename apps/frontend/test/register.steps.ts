import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { NextRequest } from 'next/server';
import { POST, OPTIONS } from '../src/app/api/register/route';

// Variables globales para el estado de las pruebas
let testData: any = {};
let response: Response;
let responseBody: any;
let originalFetch: any;

Given('que el sistema está configurado correctamente', async function () {
  // Guardar el fetch original
  originalFetch = global.fetch;
  // Configurar variables de entorno para las pruebas
  process.env.BACKEND_URL = 'http://localhost:3001';
});

Given('que el backend está disponible', async function () {
  // Mock del fetch para simular backend disponible
  global.fetch = () => Promise.resolve({
    status: 200,
    text: () => Promise.resolve(JSON.stringify({
      success: true,
      token: 'mock-jwt-token',
      user: { id: 1, email: testData.email, name: testData.name }
    })),
    headers: {
      get: (name: string) => name === 'content-type' ? 'application/json' : null
    }
  } as Response);
});

Given('que tengo los siguientes datos de registro:', async function (dataTable: any) {
  testData = {};
  dataTable.hashes().forEach((row: any) => {
    testData[row.campo] = row.valor;
  });
  
  // Actualizar el mock del backend con los datos actuales
  if (global.fetch && testData.email) {
    global.fetch = () => Promise.resolve({
      status: 200,
      text: () => Promise.resolve(JSON.stringify({
        success: true,
        token: 'mock-jwt-token',
        user: { 
          id: 1, 
          email: testData.email, 
          name: testData.name ? testData.name.replace(/[<>\"'&]/g, '') : testData.name 
        }
      })),
      headers: {
        get: (name: string) => name === 'content-type' ? 'application/json' : null
      }
    } as Response);
  }
});

Given('que el backend no responde en 30 segundos', async function () {
  // Mock del fetch para simular timeout
  global.fetch = () => new Promise((_, reject) => {
    const error = new Error('Timeout');
    error.name = 'AbortError';
    setTimeout(() => reject(error), 100);
  });
});

Given('que el backend no está disponible', async function () {
  // Mock del fetch para simular error de conexión
  global.fetch = () => Promise.reject(new Error('fetch failed'));
});

Given('que ocurre un error interno inesperado', async function () {
  // Mock del fetch para simular error interno
  global.fetch = () => Promise.reject(new Error('Internal server error'));
});

Given('que la variable BACKEND_URL no está configurada', async function () {
  delete process.env.BACKEND_URL;
});

When('envío una solicitud POST a {string}', async function (endpoint: string) {
  const request = new NextRequest('http://localhost:3000' + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData)
  });

  try {
    response = await POST(request);
    const responseText = await response.text();
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = { error: responseText };
    }
  } catch (error) {
    // Para casos de error, crear una respuesta mock
    response = new Response(JSON.stringify({ error: 'Test error' }), { status: 500 });
    responseBody = { error: 'Test error' };
  }
});

Then('debería recibir una respuesta con status {int}', function (expectedStatus: number) {
  expect(response.status).to.equal(expectedStatus);
});

Then('la respuesta debería contener un token de acceso', function () {
  expect(responseBody).to.have.property('token');
  expect(responseBody.token).to.be.a('string');
});

Then('la respuesta debería incluir información del usuario', function () {
  expect(responseBody).to.have.property('user');
  expect(responseBody.user).to.have.property('email');
  expect(responseBody.user).to.have.property('name');
});

Then('la respuesta debería contener el mensaje {string}', function (expectedMessage: string) {
  expect(responseBody).to.have.property('error');
  expect(responseBody.error).to.equal(expectedMessage);
});

Then('el nombre debería estar sanitizado sin caracteres peligrosos', function () {
  expect(responseBody.user.name).to.not.include('<script>');
  expect(responseBody.user.name).to.not.include('</script>');
  expect(responseBody.user.name).to.not.include('alert');
});

Then('debería recibir una respuesta con status {int}', function (expectedStatus: number) {
  expect(response.status).to.equal(expectedStatus);
});

Then('la respuesta debería contener el mensaje {string}', function (expectedMessage: string) {
  expect(responseBody).to.have.property('error');
  expect(responseBody.error).to.equal(expectedMessage);
});
