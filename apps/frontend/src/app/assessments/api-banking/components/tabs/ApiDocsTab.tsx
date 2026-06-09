import { EndpointCard } from '../EndpointCard';

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/challenge/auth/login',
    summary: 'Autenticación de usuario. Devuelve un token JWT.',
    authRequired: false,
    params: [
      {
        name: 'email',
        in: 'body' as const,
        required: true,
        example: 'user.a@aiquaa.test',
      },
      {
        name: 'password',
        in: 'body' as const,
        required: true,
        example: 'Test1234!',
      },
    ],
    responses: [
      { code: 200, description: 'Login exitoso — retorna { token, userId }' },
      { code: 401, description: 'Credenciales inválidas' },
    ],
  },
  {
    method: 'GET',
    path: '/api/challenge/users/me',
    summary: 'Devuelve el perfil del usuario autenticado.',
    params: [],
    responses: [
      { code: 200, description: '{ id, email, displayName }' },
      { code: 401, description: 'Token inválido o ausente' },
    ],
  },
  {
    method: 'GET',
    path: '/api/challenge/accounts',
    summary: 'Lista las cuentas del usuario autenticado.',
    params: [],
    responses: [
      {
        code: 200,
        description:
          'Array de cuentas. Campo: availableBalance (según OpenAPI)',
      },
      { code: 401, description: 'No autenticado' },
    ],
  },
  {
    method: 'GET',
    path: '/api/challenge/accounts/{accountId}',
    summary: 'Detalle de una cuenta. Solo debe ser accesible por su dueño.',
    params: [
      {
        name: 'accountId',
        in: 'path' as const,
        required: true,
        example: 'acc_001',
      },
    ],
    responses: [
      { code: 200, description: 'Detalle de cuenta con availableBalance' },
      { code: 401, description: 'No autenticado' },
      { code: 403, description: 'La cuenta no pertenece al usuario' },
      { code: 404, description: 'Cuenta no encontrada' },
    ],
  },
  {
    method: 'POST',
    path: '/api/challenge/transfers',
    summary:
      'Crear una transferencia entre cuentas. Genera movimientos de débito y crédito.',
    params: [
      { name: 'fromAccountId', in: 'body' as const, required: true },
      { name: 'toAccountId', in: 'body' as const, required: true },
      {
        name: 'amount',
        in: 'body' as const,
        required: true,
        description: 'Monto positivo, mayor a 0',
      },
      { name: 'currency', in: 'body' as const, required: true, example: 'PYG' },
      {
        name: 'description',
        in: 'body' as const,
        description: 'Máx. 120 caracteres',
      },
      {
        name: 'idempotencyKey',
        in: 'body' as const,
        description: 'Para evitar duplicados',
      },
    ],
    responses: [
      { code: 201, description: 'Transferencia creada' },
      {
        code: 400,
        description: 'Monto inválido, moneda diferente, saldo insuficiente',
      },
      { code: 401, description: 'No autenticado' },
      { code: 403, description: 'Cuenta origen no pertenece al usuario' },
      { code: 404, description: 'Cuenta no encontrada' },
      { code: 409, description: 'Conflicto de idempotency key' },
    ],
  },
  {
    method: 'GET',
    path: '/api/challenge/transfers/{transferId}',
    summary:
      'Detalle de una transferencia. Solo accesible por el usuario dueño.',
    params: [{ name: 'transferId', in: 'path' as const, required: true }],
    responses: [
      { code: 200, description: 'Detalle de transferencia' },
      { code: 401, description: 'No autenticado' },
      { code: 403, description: 'Transferencia no pertenece al usuario' },
      { code: 404, description: 'No encontrada' },
    ],
  },
  {
    method: 'GET',
    path: '/api/challenge/accounts/{accountId}/movements',
    summary: 'Movimientos de una cuenta. Solo accesible por su dueño.',
    params: [{ name: 'accountId', in: 'path' as const, required: true }],
    responses: [
      { code: 200, description: 'Array de movimientos (debit/credit)' },
      { code: 401, description: 'No autenticado' },
      { code: 403, description: 'Acceso denegado' },
      { code: 404, description: 'Cuenta no encontrada' },
    ],
  },
];

export function ApiDocsTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Base URL:{' '}
          <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">
            /api/challenge
          </code>
        </p>
        <a
          href="/api/challenge/openapi.json"
          download="banking-api-openapi.json"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          ↓ Descargar OpenAPI
        </a>
      </div>

      <div className="space-y-2">
        {ENDPOINTS.map((ep) => (
          <EndpointCard key={`${ep.method}-${ep.path}`} {...ep} />
        ))}
      </div>
    </div>
  );
}
