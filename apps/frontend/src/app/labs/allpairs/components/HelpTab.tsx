'use client';

export default function HelpTab() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h2>¿Qué son las Pruebas por Pares?</h2>
      <p>
        Las pruebas por pares (también conocidas como pruebas de todos los pares o <em>all-pairs testing</em>)
        son un método de prueba combinatorio que reduce drásticamente el número de casos de prueba necesarios,
        manteniendo al mismo tiempo una alta cobertura de las posibles interacciones entre parámetros.
      </p>

      <h3>¿Cómo Funciona?</h3>
      <p>
        En lugar de probar todas las combinaciones posibles de parámetros (lo cual crece exponencialmente),
        las pruebas por pares garantizan que cada par posible de valores entre dos parámetros cualesquiera
        se cubra al menos una vez.
      </p>

      <h3>Ventajas</h3>
      <ul>
        <li>
          <strong>Reducción de Casos de Prueba:</strong> Número drásticamente menor de pruebas
          en comparación con las pruebas exhaustivas
        </li>
        <li>
          <strong>Alta Cobertura:</strong> Los estudios demuestran que las pruebas por pares
          detectan entre el 50% y el 90% de los errores
        </li>
        <li>
          <strong>Eficiencia Temporal:</strong> Ejecución más rápida de las pruebas
          sin perder calidad
        </li>
        <li>
          <strong>Rentabilidad:</strong> Reducción de los recursos necesarios para las pruebas
        </li>
      </ul>

      <h3>Ejemplo</h3>
      <p>
        Supongamos que necesitás probar con 3 navegadores, 3 sistemas operativos y 3 versiones:
      </p>
      <ul>
        <li>
          <strong>Exhaustivo:</strong> 3 × 3 × 3 = 27 casos de prueba
        </li>
        <li>
          <strong>Por Pares:</strong> Típicamente entre 9 y 12 casos de prueba para
          una cobertura del 100% de los pares
        </li>
      </ul>

      <h3>Formato de Entrada</h3>
      <p>Proporcioná tus parámetros de prueba en este formato:</p>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm">
        {`{
  "labels": ["Navegador", "SO", "Versión"],
  "parameters": [
    ["Chrome", "Firefox", "Safari"],
    ["Windows", "macOS", "Linux"],
    ["Última", "Anterior"]
  ]
}`}
      </pre>

      <h3>Limitaciones</h3>
      <ul>
        <li>No prueba todas las interacciones de 3 vías o de orden superior</li>
        <li>Es posible que no detecte errores que solo aparecen con combinaciones específicas de 3 o más parámetros</li>
        <li>No es adecuado para sistemas críticos de seguridad que requieren pruebas exhaustivas</li>
      </ul>

      <h3>Recursos</h3>
      <ul>
        <li>
          <a
            href="https://www.pairwise.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Pairwise.org - Guía Completa
          </a>
        </li>
        <li>
          <a
            href="https://github.com/stevenayal/allpairs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            AllPairs CLI - Herramienta de Línea de Comandos en Python
          </a>
        </li>
        <li>
          <a
            href="/docs/tools/allpairs"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Documentación de AIQUAA AllPairs
          </a>
        </li>
      </ul>

      <h3>Consejos</h3>
      <ul>
        <li>Comenzá con los parámetros más importantes</li>
        <li>Mantené los nombres de los parámetros claros y descriptivos</li>
        <li>Usá la pestaña JSON/YAML para edición masiva</li>
        <li>Exportá los resultados como CSV para usar en frameworks de prueba</li>
        <li>Revisá las combinaciones generadas para asegurarte de que tengan sentido</li>
      </ul>
    </div>
  );
}
