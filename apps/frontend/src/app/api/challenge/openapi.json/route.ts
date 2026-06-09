import { NextResponse } from 'next/server';

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Banca Digital API — Challenge',
    description: 'API simulada para el QA API Testing Challenge de AIQUAA.',
    version: '1.0.0',
  },
  servers: [{ url: '/api/challenge', description: 'Challenge server' }],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Account: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'acc_001' },
          alias: { type: 'string', example: 'Mi cuenta corriente' },
          type: { type: 'string', enum: ['checking', 'savings'] },
          currency: { type: 'string', example: 'PYG' },
          // BUG #8: spec says availableBalance but actual API returns balance
          availableBalance: { type: 'number', example: 5000000 },
        },
      },
      Transfer: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          fromAccountId: { type: 'string' },
          toAccountId: { type: 'string' },
          amount: {
            type: 'number',
            minimum: 1,
            description: 'Must be positive integer',
          },
          description: { type: 'string', maxLength: 120 },
          status: { type: 'string', enum: ['completed', 'pending', 'failed'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Movement: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          accountId: { type: 'string' },
          type: { type: 'string', enum: ['debit', 'credit'] },
          amount: { type: 'number' },
          description: { type: 'string' },
          balance: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
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
          200: {
            description: 'Login exitoso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    tokenType: { type: 'string', example: 'Bearer' },
                    user: { type: 'object' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos faltantes',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          401: {
            description: 'Credenciales inválidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        responses: {
          200: {
            description: 'Perfil del usuario',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
          401: { description: 'No autorizado' },
        },
      },
    },
    '/accounts': {
      get: {
        tags: ['Accounts'],
        summary: 'List accounts owned by current user',
        responses: {
          200: {
            description: 'Lista de cuentas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    accounts: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Account' },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'No autorizado' },
        },
      },
    },
    '/accounts/{accountId}': {
      get: {
        tags: ['Accounts'],
        summary: 'Get account by ID',
        parameters: [
          {
            name: 'accountId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Detalle de la cuenta',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Account' },
              },
            },
          },
          401: { description: 'No autorizado' },
          403: { description: 'Acceso denegado — cuenta de otro usuario' },
          404: { description: 'Cuenta no encontrada' },
        },
      },
    },
    '/accounts/{accountId}/movements': {
      get: {
        tags: ['Accounts'],
        summary: 'Get movements for an account',
        parameters: [
          {
            name: 'accountId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Movimientos de la cuenta',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    movements: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Movement' },
                    },
                    total: { type: 'integer' },
                  },
                },
              },
            },
          },
          401: { description: 'No autorizado' },
          404: { description: 'Cuenta no encontrada' },
        },
      },
    },
    '/transfers': {
      post: {
        tags: ['Transfers'],
        summary: 'Create a bank transfer',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fromAccountId', 'toAccountId', 'amount'],
                properties: {
                  fromAccountId: { type: 'string' },
                  toAccountId: { type: 'string' },
                  amount: { type: 'number', minimum: 1 },
                  description: { type: 'string', maxLength: 120 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Transferencia creada' },
          400: { description: 'Datos inválidos' },
          401: { description: 'No autorizado' },
          403: { description: 'Cuenta de origen no pertenece al usuario' },
          404: { description: 'Cuenta no encontrada' },
          422: { description: 'Saldo insuficiente' },
        },
      },
    },
    '/transfers/{transferId}': {
      get: {
        tags: ['Transfers'],
        summary: 'Get transfer by ID',
        parameters: [
          {
            name: 'transferId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Detalle de la transferencia',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Transfer' },
              },
            },
          },
          401: { description: 'No autorizado' },
          403: { description: 'Transferencia de otro usuario' },
          404: { description: 'Transferencia no encontrada' },
        },
      },
    },
  },
};

export function GET() {
  return NextResponse.json(spec);
}
