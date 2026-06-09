// OpenAPI 3.0 spec for the simulated banking API
// Intentional mismatch: spec documents 'availableBalance', API returns 'balance' (bug #8)

export const OPENAPI_SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'AIQUAA Banking API (Simulada)',
    version: '1.0.0',
    description:
      'API bancaria simulada para el QA API Challenge. Usá estas credenciales para explorar y testear los endpoints.',
  },
  servers: [{ url: '/api/challenge', description: 'Challenge server' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
      Account: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'acc_001' },
          userId: { type: 'string' },
          accountNumber: { type: 'string' },
          currency: { type: 'string', example: 'PYG' },
          // NOTE: intentional mismatch — API returns 'balance' not 'availableBalance'
          availableBalance: { type: 'number', example: 5000000 },
        },
      },
      Transfer: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          fromAccountId: { type: 'string' },
          toAccountId: { type: 'string' },
          amount: { type: 'number' },
          currency: { type: 'string' },
          description: { type: 'string', maxLength: 120 },
          idempotencyKey: { type: 'string' },
          status: { type: 'string', enum: ['completed', 'failed', 'pending'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Movement: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          accountId: { type: 'string' },
          transferId: { type: 'string' },
          type: { type: 'string', enum: ['debit', 'credit'] },
          amount: { type: 'number' },
          currency: { type: 'string' },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        summary: 'Autenticación de usuario',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login exitoso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    userId: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': { description: 'Credenciales inválidas' },
        },
      },
    },
    '/users/me': {
      get: {
        summary: 'Perfil del usuario autenticado',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Perfil del usuario',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    displayName: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': { description: 'Token inválido o ausente' },
        },
      },
    },
    '/accounts': {
      get: {
        summary: 'Listado de cuentas del usuario',
        tags: ['Accounts'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de cuentas',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Account' },
                },
              },
            },
          },
          '401': { description: 'No autenticado' },
        },
      },
    },
    '/accounts/{accountId}': {
      get: {
        summary: 'Detalle de una cuenta',
        tags: ['Accounts'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'accountId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Detalle de la cuenta',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Account' },
              },
            },
          },
          '401': { description: 'No autenticado' },
          '403': {
            description: 'Acceso denegado — la cuenta no pertenece al usuario',
          },
          '404': { description: 'Cuenta no encontrada' },
        },
      },
    },
    '/transfers': {
      post: {
        summary: 'Crear una transferencia',
        tags: ['Transfers'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: [
                  'fromAccountId',
                  'toAccountId',
                  'amount',
                  'currency',
                ],
                properties: {
                  fromAccountId: { type: 'string' },
                  toAccountId: { type: 'string' },
                  amount: { type: 'number', minimum: 1 },
                  currency: { type: 'string' },
                  description: { type: 'string', maxLength: 120 },
                  idempotencyKey: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Transferencia creada exitosamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Transfer' },
              },
            },
          },
          '400': {
            description:
              'Datos inválidos (monto inválido, moneda diferente, saldo insuficiente)',
          },
          '401': { description: 'No autenticado' },
          '403': { description: 'Cuenta origen no pertenece al usuario' },
          '404': { description: 'Cuenta no encontrada' },
          '409': { description: 'Conflicto de idempotency key' },
        },
      },
    },
    '/transfers/{transferId}': {
      get: {
        summary: 'Detalle de una transferencia',
        tags: ['Transfers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'transferId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Detalle de la transferencia',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Transfer' },
              },
            },
          },
          '401': { description: 'No autenticado' },
          '403': { description: 'Transferencia no pertenece al usuario' },
          '404': { description: 'Transferencia no encontrada' },
        },
      },
    },
    '/accounts/{accountId}/movements': {
      get: {
        summary: 'Movimientos de una cuenta',
        tags: ['Accounts'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'accountId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de movimientos',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Movement' },
                },
              },
            },
          },
          '401': { description: 'No autenticado' },
          '403': { description: 'Acceso denegado' },
          '404': { description: 'Cuenta no encontrada' },
        },
      },
    },
  },
};
