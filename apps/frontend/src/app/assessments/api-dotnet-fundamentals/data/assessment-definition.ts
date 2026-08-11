import type { AssessmentSeedDefinition } from '../../_shared/types';

export const API_DOTNET_FUNDAMENTALS_SLUG = 'api-dotnet-fundamentals';

// Bumpear cuando cambie la definición (secciones/preguntas) para forzar re-seed.
export const API_DOTNET_FUNDAMENTALS_SEED_VERSION = 1;

export const apiDotnetFundamentalsDefinition: AssessmentSeedDefinition = {
  slug: API_DOTNET_FUNDAMENTALS_SLUG,
  title: 'API .NET — Fundamentos',
  description:
    'Evaluación teórica de diseño y construcción de APIs REST en .NET para bootcamp de desarrollo backend: diseño de rutas y verbos HTTP, versionado, contrato OpenAPI/Swagger, Clean Architecture (separación por capas) y manejo de errores sin exponer detalles internos.',
  level: 'Trainee a Junior',
  type: 'Desarrollo Backend .NET',
  duration_minutes: 40,
  total_score: 100,
  is_active: true,
  metadata: {
    moduleName: 'AIQUAA Assessments / API .NET Fundamentals',
    passingScore: 70,
    candidateBands: [
      { min: 0, max: 39, label: 'Inicial' },
      { min: 40, max: 59, label: 'En formación' },
      { min: 60, max: 74, label: 'Trainee' },
      { min: 75, max: 89, label: 'Junior' },
      { min: 90, max: 100, label: 'Junior avanzado' },
    ],
  },
  sections: [
    {
      slug: 'diseno-rest-versionado',
      title: 'Diseño REST y versionado',
      description:
        'Rutas semánticas orientadas a recursos, verbos HTTP correctos, idempotencia, códigos de estado y estrategias de versionado de una API .NET.',
      order_index: 1,
      max_score: 24,
      metadata: {
        instructions:
          'Selección múltiple y verdadero/falso sobre convenciones REST aplicadas a ASP.NET Core Web API.',
        suggestedMinutes: 10,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál de estas rutas sigue mejor las convenciones REST para exponer la colección de pedidos y un pedido puntual?',
          options: [
            { label: 'GET /getOrders y GET /getOrderById?id=5', value: 'a' },
            { label: 'GET /orders y GET /orders/5', value: 'b' },
            { label: 'POST /orders/fetch y POST /orders/fetchOne', value: 'c' },
            { label: 'GET /order y GET /order/find/5', value: 'd' },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'REST modela recursos con sustantivos en plural (/orders) y usa el verbo HTTP para expresar la acción. La acción nunca va en la URL: eso es lo que diferencia una API REST de una API tipo RPC (getOrders, fetchOne).',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Necesitás actualizar solo el campo "estado" de un pedido, sin reenviar el recurso completo. ¿Qué verbo HTTP es el más apropiado?',
          options: [
            { label: 'PUT, porque siempre reemplaza el recurso', value: 'a' },
            {
              label:
                'PATCH, porque aplica una modificación parcial sobre el recurso existente',
              value: 'b',
            },
            {
              label: 'POST, porque POST sirve para cualquier cambio',
              value: 'c',
            },
            {
              label: 'DELETE seguido de POST con los datos completos',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'PATCH está pensado para modificaciones parciales. PUT es semánticamente un reemplazo completo del recurso (requiere enviar todos los campos); usarlo para un cambio parcial obliga al cliente a conocer y reenviar datos que no quiere tocar.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué significa que un verbo HTTP sea "idempotente" y cuáles de los siguientes lo son?',
          options: [
            {
              label:
                'Que no requiere autenticación; GET y POST son idempotentes',
              value: 'a',
            },
            {
              label:
                'Que ejecutar la misma request varias veces produce el mismo resultado en el servidor que ejecutarla una sola vez; GET, PUT y DELETE son idempotentes, POST no lo es',
              value: 'b',
            },
            {
              label: 'Que la respuesta siempre es la misma; solo GET lo es',
              value: 'c',
            },
            {
              label:
                'Que se puede cachear en el cliente; PATCH y POST son idempotentes',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Idempotencia es sobre el efecto en el servidor, no sobre la respuesta. Repetir un PUT o un DELETE dos veces deja el sistema en el mismo estado que hacerlo una vez; repetir un POST típicamente crea un recurso nuevo cada vez.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Un cliente hace POST /orders y el pedido se crea correctamente en el recurso /orders/42. ¿Qué respuesta es la más correcta según convenciones REST?',
          options: [
            { label: '200 OK con el body vacío', value: 'a' },
            {
              label:
                '201 Created, con header Location: /orders/42 y el recurso creado en el body',
              value: 'b',
            },
            {
              label: '204 No Content, sin body ni headers adicionales',
              value: 'c',
            },
            {
              label: '202 Accepted, sin indicar dónde quedó el recurso',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            '201 Created es el código semánticamente correcto para una creación exitosa. El header Location le dice al cliente dónde quedó el nuevo recurso, y devolver el recurso en el body evita que el cliente tenga que pedirlo de nuevo.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Vas a versionar una API pública en .NET que va a tener breaking changes a futuro. ¿Cuál es la estrategia de versionado más simple de descubrir y documentar para los consumidores?',
          options: [
            {
              label:
                'Versionado por segmento de URL (/api/v1/orders, /api/v2/orders), explícito y fácil de documentar en Swagger por versión',
              value: 'a',
            },
            {
              label:
                'No versionar nunca y romper a todos los clientes en simultáneo',
              value: 'b',
            },
            {
              label:
                'Cambiar el nombre de los campos del JSON en cada release sin avisar',
              value: 'c',
            },
            {
              label: 'Versionar solo el nombre de la base de datos',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El versionado por URL es el más explícito: el cliente ve la versión en la ruta, es trivial de rutear en ASP.NET Core (con convenciones o el paquete Asp.Versioning) y cada versión puede documentarse como un contrato Swagger separado.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Un endpoint soporta filtros y paginación: GET /orders?status=paid&page=2&pageSize=20. ¿Por qué es preferible a GET /orders/paid/page/2/size/20?',
          options: [
            {
              label:
                'Porque los query params son opcionales y no rompen la identidad del recurso (/orders sigue siendo el mismo recurso, solo se filtra la vista)',
              value: 'a',
            },
            {
              label: 'Porque los query params son más rápidos de procesar',
              value: 'b',
            },
            {
              label: 'Porque ASP.NET Core no soporta parámetros de ruta',
              value: 'c',
            },
            {
              label: 'No hay diferencia real, es solo una cuestión de estilo',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Filtrar, ordenar y paginar son operaciones sobre la colección, no partes de su identidad. Codificarlas como segmentos de ruta (/orders/paid/page/2) mezcla identidad de recurso con criterios de consulta y hace la API más rígida y difícil de extender.',
          points: 4,
          order_index: 6,
        },
      ],
    },
    {
      slug: 'contrato-openapi-swagger',
      title: 'Contrato OpenAPI / Swagger',
      description:
        'Generación y calidad del contrato OpenAPI en ASP.NET Core: documentación de responses, status codes y comportamiento de [ApiController].',
      order_index: 2,
      max_score: 20,
      metadata: {
        instructions:
          'Preguntas sobre Swashbuckle, atributos de documentación y buenas prácticas de contrato en ASP.NET Core Web API.',
        suggestedMinutes: 8,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué paquete NuGet se usa habitualmente en ASP.NET Core para generar el documento OpenAPI y la UI de Swagger?',
          options: [
            { label: 'Swashbuckle.AspNetCore', value: 'a' },
            { label: 'Newtonsoft.Json', value: 'b' },
            { label: 'AutoMapper', value: 'c' },
            { label: 'Microsoft.EntityFrameworkCore', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Swashbuckle.AspNetCore es la librería estándar que inspecciona los controllers/endpoints y genera tanto el JSON de OpenAPI como la UI interactiva de Swagger.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Para qué sirve decorar una acción con [ProducesResponseType(StatusCodes.Status404NotFound)]?',
          options: [
            {
              label:
                'Documentar explícitamente en el contrato OpenAPI que ese endpoint puede responder 404, más allá del 200 de éxito',
              value: 'a',
            },
            {
              label: 'Forzar a que el endpoint siempre devuelva 404',
              value: 'b',
            },
            {
              label:
                'Deshabilitar el manejo de errores automático de ASP.NET Core',
              value: 'c',
            },
            { label: 'Configurar el timeout de la request', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'ProducesResponseType no cambia el comportamiento en runtime; es metadata para el generador de OpenAPI. Sin esa anotación, Swagger solo documenta el status code "feliz" y el consumidor de la API no sabe qué otros códigos esperar.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Al marcar un controller con [ApiController], ¿qué comportamiento automático agrega ASP.NET Core?',
          options: [
            {
              label:
                'Genera automáticamente la base de datos a partir del modelo',
              value: 'a',
            },
            {
              label:
                'Si el model binding/validación falla, responde automáticamente 400 Bad Request con los errores, sin necesidad de chequear ModelState.IsValid a mano',
              value: 'b',
            },
            {
              label: 'Habilita CORS para todos los orígenes por defecto',
              value: 'c',
            },
            {
              label: 'Convierte el controller en un servicio de background',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            '[ApiController] activa varias convenciones de API, entre ellas la validación automática de modelo: si el binding falla, el framework corta el pipeline y devuelve 400 con el detalle de los errores, sin que el desarrollador tenga que escribir ese chequeo en cada acción.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es la forma recomendada de documentar de manera uniforme las respuestas de error en un contrato OpenAPI moderno?',
          options: [
            {
              label:
                'Usando el formato ProblemDetails (RFC 7807), con un shape consistente (type, title, status, detail) para todos los errores',
              value: 'a',
            },
            {
              label:
                'Cada endpoint devuelve un formato de error distinto según lo que le resulte más cómodo al desarrollador',
              value: 'b',
            },
            {
              label: 'Los errores no se documentan, solo el happy path',
              value: 'c',
            },
            {
              label:
                'Se documentan como comentarios en el código, no en el contrato',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'ProblemDetails estandariza el shape de los errores HTTP. ASP.NET Core lo soporta nativamente (ProblemDetails, ValidationProblemDetails), lo que permite documentarlo una vez en Swagger y que todos los endpoints lo respeten.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'true_false',
          prompt:
            'Un contrato OpenAPI bien construido documenta los status codes de éxito, pero es opcional documentar los de error porque no forman parte del "contrato real" de la API.',
          correct_answer: { value: false },
          explanation:
            'Los status codes de error son parte del contrato: le dicen al consumidor cómo distinguir un 400 de un 404 o un 409, y qué shape esperar en cada caso. Omitirlos obliga al cliente a descubrirlos en producción.',
          points: 4,
          order_index: 5,
        },
      ],
    },
    {
      slug: 'clean-architecture',
      title: 'Clean Architecture',
      description:
        'Separación en capas (Domain, Application, Infrastructure, API), la regla de dependencia y por qué mejora la testabilidad del sistema.',
      order_index: 3,
      max_score: 28,
      metadata: {
        instructions:
          'Preguntas sobre la organización en capas de un proyecto .NET siguiendo Clean Architecture.',
        suggestedMinutes: 11,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es la regla de dependencia central en Clean Architecture?',
          options: [
            {
              label:
                'Las dependencias del código fuente solo pueden apuntar hacia adentro: las capas externas (Infrastructure, API) dependen de las internas (Application, Domain), nunca al revés',
              value: 'a',
            },
            {
              label: 'Todas las capas pueden depender libremente entre sí',
              value: 'b',
            },
            {
              label:
                'El Domain debe depender de Entity Framework para persistir datos',
              value: 'c',
            },
            {
              label: 'La API siempre debe ser la capa más interna del sistema',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'La "Dependency Rule" es el núcleo de Clean Architecture: el código fuente de una capa interna nunca menciona nada de una capa externa. Domain no sabe que existe una base de datos o un framework web.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Dónde debería vivir la lógica de negocio pura (entidades y reglas del dominio) en un proyecto .NET con Clean Architecture?',
          options: [
            { label: 'En los controllers de la capa API', value: 'a' },
            {
              label: 'En la capa Infrastructure, junto al DbContext',
              value: 'b',
            },
            {
              label:
                'En la capa Domain, sin referencias a ASP.NET Core, Entity Framework ni ningún paquete de infraestructura',
              value: 'c',
            },
            { label: 'En archivos de configuración JSON', value: 'd' },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'Domain contiene entidades, value objects y reglas de negocio, y no referencia ningún framework externo. Eso permite que las reglas de negocio se entiendan y testeen sin levantar web ni base de datos.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cómo se relacionan típicamente Application e Infrastructure en Clean Architecture para respetar la regla de dependencia?',
          options: [
            {
              label:
                'Application define interfaces (puertos, ej. IOrderRepository); Infrastructure las implementa (ej. con Entity Framework) mediante inyección de dependencias — esto es Dependency Inversion',
              value: 'a',
            },
            {
              label:
                'Application referencia directamente las clases concretas de Entity Framework',
              value: 'b',
            },
            {
              label:
                'Infrastructure define las reglas de negocio y Application solo las consume',
              value: 'c',
            },
            {
              label: 'No hay relación, cada capa se despliega por separado',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Este es el principio de inversión de dependencias aplicado a capas: la capa de más alto nivel (Application) define el contrato que necesita, y la capa de detalle (Infrastructure) lo implementa. Application nunca referencia el paquete de Entity Framework directamente.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál de los siguientes es un anti-patrón común que rompe Clean Architecture en un controller de ASP.NET Core?',
          options: [
            {
              label:
                'Inyectar un servicio de Application vía constructor y delegarle la lógica',
              value: 'a',
            },
            {
              label:
                'Instanciar el DbContext directamente en el controller y armar la query LINQ ahí mismo, mezclando presentación con acceso a datos y reglas de negocio',
              value: 'b',
            },
            {
              label: 'Devolver un DTO en vez de la entidad de dominio',
              value: 'c',
            },
            { label: 'Usar [ApiController] y model binding', value: 'd' },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'El controller debería ser una capa delgada: recibe la request, la traduce a un caso de uso de Application y devuelve la respuesta. Acceder directo a la base de datos desde el controller acopla la capa de presentación al detalle de persistencia.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué conviene separar los DTOs (Data Transfer Objects) expuestos por la API de las entidades de dominio internas?',
          options: [
            {
              label:
                'Porque así el contrato público de la API no queda acoplado a los detalles internos del dominio: se puede refactorizar el dominio sin romper a los consumidores, y se evita exponer campos sensibles o internos',
              value: 'a',
            },
            {
              label: 'Porque C# no permite serializar entidades a JSON',
              value: 'b',
            },
            {
              label:
                'Porque los DTOs son obligatorios para usar Entity Framework',
              value: 'c',
            },
            {
              label:
                'No hay ninguna razón real, es solo boilerplate innecesario',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Sin esa separación, cualquier cambio interno en una entidad (renombrar un campo, agregar una relación) se filtra directamente al contrato público y puede romper a todos los clientes, además de arriesgar exponer datos que no deberían salir de la API.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es el principal beneficio de Clean Architecture a la hora de escribir tests?',
          options: [
            {
              label:
                'Las reglas de negocio en Domain/Application pueden testearse con tests unitarios rápidos, sin levantar base de datos ni servidor HTTP, porque dependen de interfaces (mockeables) y no de infraestructura concreta',
              value: 'a',
            },
            {
              label: 'Elimina por completo la necesidad de escribir tests',
              value: 'b',
            },
            {
              label: 'Obliga a testear únicamente a través de la UI',
              value: 'c',
            },
            {
              label:
                'Los tests solo pueden ejecutarse contra la base de datos de producción',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Al depender de abstracciones (interfaces) en vez de implementaciones concretas, Application y Domain se pueden testear con dobles de test (mocks/fakes) rápidos y aislados, sin infraestructura real.',
          points: 4,
          order_index: 6,
        },
        {
          question_type: 'true_false',
          prompt:
            'En Clean Architecture, la capa Infrastructure puede referenciar directamente la capa Domain, pero Domain nunca referencia Infrastructure.',
          correct_answer: { value: true },
          explanation:
            'Es la aplicación directa de la regla de dependencia: las capas externas conocen a las internas, pero las internas no saben que las externas existen. Domain es la capa más protegida del proyecto.',
          points: 4,
          order_index: 7,
        },
      ],
    },
    {
      slug: 'manejo-de-errores',
      title: 'Manejo de errores',
      description:
        'Manejo centralizado de excepciones, formato estándar de errores y qué información nunca debería filtrarse al cliente.',
      order_index: 4,
      max_score: 28,
      metadata: {
        instructions:
          'Preguntas sobre exception handling middleware, ProblemDetails y códigos de estado en ASP.NET Core.',
        suggestedMinutes: 11,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es la forma recomendada de manejar excepciones no controladas de forma centralizada en una API ASP.NET Core?',
          options: [
            {
              label:
                'Envolver cada acción de cada controller en su propio try/catch con lógica repetida',
              value: 'a',
            },
            {
              label:
                'Usar un middleware centralizado (por ejemplo UseExceptionHandler o un middleware custom) que capture las excepciones no manejadas en un solo lugar y devuelva una respuesta uniforme',
              value: 'b',
            },
            {
              label: 'Dejar que la excepción llegue tal cual al cliente',
              value: 'c',
            },
            { label: 'Ignorar la excepción y devolver 200 igual', value: 'd' },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Centralizar el manejo de errores en middleware evita repetir try/catch en cada acción, garantiza una respuesta consistente para toda la API y es el único lugar que hay que tocar para cambiar el formato de error.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué estándar define el formato recomendado (type, title, status, detail, instance) para respuestas de error en APIs REST modernas, y que ASP.NET Core soporta nativamente?',
          options: [
            { label: 'RFC 7807 — Problem Details for HTTP APIs', value: 'a' },
            { label: 'OAuth 2.0', value: 'b' },
            { label: 'JSON Schema Draft 7', value: 'c' },
            { label: 'CORS (Cross-Origin Resource Sharing)', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'RFC 7807 estandariza el shape de un error HTTP para que cualquier cliente pueda parsearlo de forma predecible. ASP.NET Core lo implementa a través de la clase ProblemDetails y su generación automática para errores de validación y excepciones.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'En producción, ¿qué información NO debería incluirse en el body de una respuesta de error devuelta al cliente?',
          options: [
            {
              label:
                'Un mensaje claro sobre qué salió mal desde la perspectiva del cliente',
              value: 'a',
            },
            {
              label:
                'El stack trace completo, el mensaje interno de la excepción de .NET y detalles de infraestructura (connection strings, nombres de tablas, rutas de archivos)',
              value: 'b',
            },
            {
              label: 'Un código de error o correlationId para trazabilidad',
              value: 'c',
            },
            { label: 'El status code HTTP correspondiente', value: 'd' },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Exponer stack traces o detalles internos filtra información valiosa para un atacante (paths, versiones de librerías, estructura de datos) y no le sirve al cliente legítimo. Esos detalles deben ir solo al log del servidor.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Un cliente envía un body que no pasa las validaciones del modelo (por ejemplo, un email con formato inválido). ¿Qué código de estado corresponde?',
          options: [
            { label: '500 Internal Server Error', value: 'a' },
            { label: '400 Bad Request', value: 'b' },
            { label: '404 Not Found', value: 'c' },
            { label: '204 No Content', value: 'd' },
          ],
          correct_answer: { value: 'b' },
          explanation:
            '400 Bad Request indica que la request del cliente está mal formada o no cumple las reglas de validación. Es un error del cliente, no del servidor, por lo que un 500 sería semánticamente incorrecto.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Un usuario autenticado intenta acceder a un recurso para el que no tiene permisos. ¿Qué código corresponde, y en qué se diferencia de un 401?',
          options: [
            {
              label:
                '403 Forbidden: el usuario está identificado pero no autorizado para esa acción; 401 Unauthorized se usa cuando no hay credenciales válidas',
              value: 'a',
            },
            {
              label: '401 Unauthorized en ambos casos, no hay diferencia',
              value: 'b',
            },
            {
              label: '404 Not Found, para no revelar que el recurso existe',
              value: 'c',
            },
            {
              label: '400 Bad Request, porque el permiso es parte del body',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            '401 responde "no sé quién sos" (falta o falla la autenticación); 403 responde "sé quién sos, pero no podés hacer esto" (falla la autorización). Confundirlos es un error de contrato frecuente.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué es una mala práctica capturar catch (Exception ex) de forma genérica en un controller y devolver 200 OK con un mensaje de error dentro del body?',
          options: [
            {
              label:
                'Porque rompe el contrato HTTP semántico: clientes, proxies, herramientas de monitoreo y el propio Swagger asumen que 200 significa éxito, y ese error queda invisible para cualquier chequeo automático',
              value: 'a',
            },
            {
              label: 'Porque C# no permite hacer catch de Exception genérica',
              value: 'b',
            },
            {
              label: 'Porque 200 OK es un código reservado solo para GET',
              value: 'c',
            },
            {
              label: 'No es una mala práctica, es la forma recomendada',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El status code es la señal de más alto nivel que consume cualquier infraestructura HTTP (load balancers, dashboards, alerting). Devolver 200 en un caso de error esconde el fallo de todo lo que solo mira el status code.',
          points: 4,
          order_index: 6,
        },
        {
          question_type: 'true_false',
          prompt:
            'Loggear la excepción completa (stack trace) del lado del servidor, mientras al cliente se le devuelve solo un mensaje genérico junto con un código de error o correlationId trazable, es una buena práctica.',
          correct_answer: { value: true },
          explanation:
            'Esa separación es exactamente la idea: el equipo de desarrollo tiene toda la información para diagnosticar en los logs, y el cliente recibe una respuesta segura y accionable sin exponer detalles internos.',
          points: 4,
          order_index: 7,
        },
      ],
    },
  ],
};
