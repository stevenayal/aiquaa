const fs = require('fs');
const path = require('path');

async function printOpenAPI() {
  try {
    console.log('🔄 Generating OpenAPI specification...');
    
    // In a real implementation, you would start the NestJS app and fetch the OpenAPI spec
    // For now, we'll create a basic OpenAPI spec
    const openApiSpec = {
      openapi: '3.0.0',
      info: {
        title: 'AIQUAA API',
        description: 'API para la plataforma AIQUAA - Herramientas de QA',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000/api/v1',
          description: 'Development server',
        },
      ],
      paths: {
        '/health': {
          get: {
            tags: ['Health'],
            summary: 'Health check endpoint',
            responses: {
              '200': {
                description: 'Service is healthy',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'ok' },
                        time: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                        version: { type: 'string', example: '1.0.0' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/auth/login': {
          post: {
            tags: ['Auth'],
            summary: 'User login',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      email: { type: 'string', format: 'email' },
                      password: { type: 'string', minLength: 6 },
                    },
                    required: ['email', 'password'],
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Login successful',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        access_token: { type: 'string' },
                        refresh_token: { type: 'string' },
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'integer' },
                            email: { type: 'string' },
                            name: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    };

    // Ensure the generated directory exists
    const generatedDir = path.join(__dirname, '../../packages/shared/generated');
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    // Write the OpenAPI spec to file
    const outputPath = path.join(generatedDir, 'openapi.json');
    fs.writeFileSync(outputPath, JSON.stringify(openApiSpec, null, 2));
    
    console.log('✅ OpenAPI specification generated successfully!');
    console.log(`📄 File saved to: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error generating OpenAPI specification:', error);
    process.exit(1);
  }
}

printOpenAPI();
