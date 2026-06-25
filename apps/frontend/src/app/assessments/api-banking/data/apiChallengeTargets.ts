export type ApiChallengeTargetId = 'chuck-norris' | 'rick-and-morty' | 'nasa';

export interface ApiChallengeEndpoint {
  method: string;
  path: string;
  summary: string;
  description?: string;
  authRequired?: boolean;
  params?: Array<{
    name: string;
    in: 'path' | 'query' | 'body';
    required?: boolean;
    description?: string;
    example?: string;
  }>;
  responses?: Array<{ code: number; description: string }>;
}

export interface ApiChallengeTarget {
  id: ApiChallengeTargetId;
  name: string;
  shortName: string;
  baseUrl: string;
  docsUrl: string;
  difficulty: string;
  description: string;
  recommendedFor: string;
  apiKeyNote?: string;
  endpoints: ApiChallengeEndpoint[];
  tasks: string[];
  sampleRequests: string[];
  risks: string[];
  evaluationHints: string[];
}

export const DEFAULT_API_TARGET_ID: ApiChallengeTargetId = 'rick-and-morty';

export const API_CHALLENGE_MIN_TEST_CASES = 6;
export const API_CHALLENGE_MIN_FINDINGS = 2;
export const API_CHALLENGE_MIN_SUMMARY_CHARS = 150;

export const API_CHALLENGE_TARGETS: ApiChallengeTarget[] = [
  {
    id: 'rick-and-morty',
    name: 'Rick and Morty API',
    shortName: 'Rick and Morty',
    baseUrl: 'https://rickandmortyapi.com/api',
    docsUrl: 'https://rickandmortyapi.com/documentation',
    difficulty: 'Intermedia',
    description:
      'API REST publica con recursos de personajes, ubicaciones y episodios. Es ideal para practicar paginacion, filtros, schemas y respuestas 404.',
    recommendedFor:
      'Evaluar cobertura funcional, filtros combinados, paginacion y consistencia entre recursos relacionados.',
    endpoints: [
      {
        method: 'GET',
        path: '/character',
        summary: 'Lista personajes con paginacion.',
        authRequired: false,
        params: [
          { name: 'page', in: 'query', description: 'Pagina a consultar' },
          { name: 'name', in: 'query', description: 'Filtro por nombre' },
          {
            name: 'status',
            in: 'query',
            description: 'alive, dead o unknown',
          },
          {
            name: 'gender',
            in: 'query',
            description: 'female, male, genderless o unknown',
          },
        ],
        responses: [
          { code: 200, description: 'Objeto con info y results' },
          { code: 404, description: 'No hay resultados para el filtro' },
        ],
      },
      {
        method: 'GET',
        path: '/character/{id}',
        summary: 'Obtiene un personaje por ID.',
        authRequired: false,
        params: [{ name: 'id', in: 'path', required: true, example: '1' }],
        responses: [
          { code: 200, description: 'Detalle del personaje' },
          { code: 404, description: 'Personaje inexistente' },
        ],
      },
      {
        method: 'GET',
        path: '/character/{ids}',
        summary: 'Obtiene multiples personajes por lista de IDs.',
        authRequired: false,
        params: [
          {
            name: 'ids',
            in: 'path',
            required: true,
            example: '1,2,3',
          },
        ],
        responses: [
          { code: 200, description: 'Array de personajes' },
          { code: 404, description: 'IDs inexistentes' },
        ],
      },
      {
        method: 'GET',
        path: '/location',
        summary: 'Lista ubicaciones con paginacion y filtros.',
        authRequired: false,
        params: [
          { name: 'page', in: 'query' },
          { name: 'name', in: 'query' },
          { name: 'type', in: 'query' },
          { name: 'dimension', in: 'query' },
        ],
        responses: [
          { code: 200, description: 'Objeto con info y results' },
          { code: 404, description: 'No hay resultados' },
        ],
      },
      {
        method: 'GET',
        path: '/episode',
        summary: 'Lista episodios con paginacion y filtros.',
        authRequired: false,
        params: [
          { name: 'page', in: 'query' },
          { name: 'name', in: 'query' },
          { name: 'episode', in: 'query', example: 'S01E01' },
        ],
        responses: [
          { code: 200, description: 'Objeto con info y results' },
          { code: 404, description: 'No hay resultados' },
        ],
      },
    ],
    tasks: [
      'Cubrir busqueda simple y filtros combinados de personajes.',
      'Validar paginacion: primera pagina, pagina intermedia, pagina inexistente y links next/prev.',
      'Comparar schema esperado en listas vs detalle.',
      'Probar IDs validos, multiples IDs, IDs inexistentes y formatos invalidos.',
      'Analizar consistencia de relaciones entre personaje, episodio y ubicacion.',
    ],
    sampleRequests: [
      'GET https://rickandmortyapi.com/api/character/?name=rick&status=alive',
      'GET https://rickandmortyapi.com/api/character/1,2,3',
      'GET https://rickandmortyapi.com/api/episode?episode=S01E01',
    ],
    risks: [
      'Filtros sin resultados o parametros invalidos mal interpretados.',
      'Inconsistencia entre links relacionados y recursos existentes.',
      'Paginacion con next/prev incorrectos o page fuera de rango.',
    ],
    evaluationHints: [
      'Inclui casos positivos, negativos, borde, contrato y relacion entre recursos.',
      'Evidencia status code, fragmento de body y URL exacta usada.',
      'No hace falta encontrar un bug real: reporta riesgos o inconsistencias reproducibles si la API responde correctamente.',
    ],
  },
  {
    id: 'chuck-norris',
    name: 'Chuck Norris API',
    shortName: 'Chuck Norris',
    baseUrl: 'https://api.chucknorris.io',
    docsUrl: 'https://api.chucknorris.io/',
    difficulty: 'Inicial',
    description:
      'API publica simple para practicar requests GET, categorias, busqueda por texto y validacion de campos JSON.',
    recommendedFor:
      'Evaluar fundamentos de API testing con endpoints pequenos y respuestas faciles de inspeccionar.',
    endpoints: [
      {
        method: 'GET',
        path: '/jokes/random',
        summary: 'Obtiene un chiste aleatorio.',
        authRequired: false,
        responses: [{ code: 200, description: 'Objeto de chiste en JSON' }],
      },
      {
        method: 'GET',
        path: '/jokes/categories',
        summary: 'Lista categorias disponibles.',
        authRequired: false,
        responses: [{ code: 200, description: 'Array de categorias' }],
      },
      {
        method: 'GET',
        path: '/jokes/random?category={category}',
        summary: 'Obtiene un chiste aleatorio por categoria.',
        authRequired: false,
        params: [
          {
            name: 'category',
            in: 'query',
            required: true,
            example: 'dev',
          },
        ],
        responses: [
          { code: 200, description: 'Objeto de chiste en la categoria' },
          { code: 404, description: 'Categoria inexistente' },
        ],
      },
      {
        method: 'GET',
        path: '/jokes/search?query={query}',
        summary: 'Busca chistes por texto libre.',
        authRequired: false,
        params: [
          { name: 'query', in: 'query', required: true, example: 'api' },
        ],
        responses: [
          { code: 200, description: 'Objeto con total y result' },
          { code: 400, description: 'Query invalida o demasiado corta' },
        ],
      },
    ],
    tasks: [
      'Validar estructura obligatoria del chiste aleatorio.',
      'Cruzar categorias listadas contra random por categoria.',
      'Probar busquedas con texto valido, texto sin resultados, caracteres especiales y query vacia.',
      'Analizar mensajes/status de error para categoria o query invalida.',
      'Revisar si los campos devueltos son consistentes entre random y search.',
    ],
    sampleRequests: [
      'GET https://api.chucknorris.io/jokes/random',
      'GET https://api.chucknorris.io/jokes/random?category=dev',
      'GET https://api.chucknorris.io/jokes/search?query=api',
    ],
    risks: [
      'Categorias inexistentes o queries invalidas sin feedback claro.',
      'Campos ausentes o inconsistentes entre endpoints.',
      'Contenido externo que puede cambiar entre ejecuciones.',
    ],
    evaluationHints: [
      'Asegura que tus casos sean repetibles aunque el contenido aleatorio cambie.',
      'Valida tipos de campos, presencia de IDs y comportamiento de errores.',
      'Distingui hallazgo real, limitacion de testabilidad y mejora sugerida.',
    ],
  },
  {
    id: 'nasa',
    name: 'NASA Open APIs',
    shortName: 'NASA APOD',
    baseUrl: 'https://api.nasa.gov',
    docsUrl: 'https://api.nasa.gov/',
    difficulty: 'Intermedia',
    description:
      'API publica de NASA. El escenario principal usa APOD con DEMO_KEY para practicar parametros de fecha, rangos, errores y campos multimedia.',
    recommendedFor:
      'Evaluar manejo de API keys, parametros de fecha, limites de rango y schemas con contenido variable.',
    apiKeyNote:
      'Usa api_key=DEMO_KEY por defecto. Si tenes una API key propia, podes reemplazar DEMO_KEY en tus pruebas.',
    endpoints: [
      {
        method: 'GET',
        path: '/planetary/apod?api_key=DEMO_KEY',
        summary: 'Obtiene la imagen astronomica del dia.',
        authRequired: false,
        params: [
          {
            name: 'api_key',
            in: 'query',
            required: true,
            example: 'DEMO_KEY',
          },
          { name: 'date', in: 'query', description: 'YYYY-MM-DD' },
          { name: 'start_date', in: 'query', description: 'YYYY-MM-DD' },
          { name: 'end_date', in: 'query', description: 'YYYY-MM-DD' },
          { name: 'thumbs', in: 'query', description: 'true para videos' },
        ],
        responses: [
          { code: 200, description: 'Objeto APOD o array para rangos' },
          { code: 400, description: 'Parametros invalidos' },
          { code: 403, description: 'API key invalida o limite excedido' },
        ],
      },
    ],
    tasks: [
      'Validar APOD sin fecha y con una fecha historica valida.',
      'Probar fecha futura, formato invalido y rango start_date/end_date.',
      'Comparar respuesta de fecha unica vs rango de fechas.',
      'Validar campos segun media_type: image vs video.',
      'Documentar riesgo de limites de DEMO_KEY y dependencia de datos externos.',
    ],
    sampleRequests: [
      'GET https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY',
      'GET https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=2024-01-01',
      'GET https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&start_date=2024-01-01&end_date=2024-01-03',
    ],
    risks: [
      'Limites de rate para DEMO_KEY.',
      'Diferencias de schema entre media_type image y video.',
      'Fechas futuras o rangos invalidos con errores poco claros.',
    ],
    evaluationHints: [
      'Inclui fecha exacta y URL completa para que otra persona replique el request.',
      'Verifica status code, campos requeridos y comportamiento ante errores.',
      'Registra limitaciones de DEMO_KEY como riesgo operativo, no como bug automaticamente.',
    ],
  },
];

export function getApiChallengeTarget(id?: string | null): ApiChallengeTarget {
  return (
    API_CHALLENGE_TARGETS.find((target) => target.id === id) ??
    API_CHALLENGE_TARGETS.find((target) => target.id === DEFAULT_API_TARGET_ID)!
  );
}

export function isApiChallengeTargetId(
  id: unknown
): id is ApiChallengeTargetId {
  return (
    typeof id === 'string' &&
    API_CHALLENGE_TARGETS.some((target) => target.id === id)
  );
}
