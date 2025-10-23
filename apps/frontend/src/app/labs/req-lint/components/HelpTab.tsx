'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function HelpTab() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`prose max-w-none ${
      isDarkMode ? 'prose-invert prose-headings:text-white prose-p:text-slate-200 prose-li:text-slate-200 prose-strong:text-white prose-code:text-slate-200' : ''
    }`}>
      <h2>¿Cómo Funciona el Análisis de Requisitos?</h2>
      <p>
        Esta herramienta analiza requisitos de software utilizando <strong>reglas determinísticas</strong> (sin IA),
        basadas en heurísticas de calidad definidas por ISTQB y mejores prácticas de ingeniería de requisitos.
      </p>

      <h3>Arquitectura Interna</h3>
      <p>
        El análisis se ejecuta 100% en el navegador (client-side) sin enviar datos a servidores externos.
        La arquitectura consta de 4 módulos principales:
      </p>

      <div className="not-prose bg-gray-100 dark:bg-gray-800 rounded-lg p-4 my-4">
        <pre className="text-sm overflow-x-auto">
{`apps/frontend/src/lib/req-lint/
├── schemas.ts       # Tipos TypeScript (Input/Output)
├── rules-v1.ts      # Definición de reglas y patrones
├── gherkin.ts       # Validador de formato BDD
└── engine.ts        # Motor de análisis principal`}
        </pre>
      </div>

      <h3>Tecnología de Detección: RegExp + Análisis Estructural</h3>
      <p>
        El motor utiliza <strong>expresiones regulares (RegExp)</strong> de JavaScript para detectar patrones problemáticos.
        Las RegExp son patrones de búsqueda que permiten encontrar texto que cumple ciertas características.
      </p>

      <h4>Ejemplos de Patrones RegExp</h4>

      <div className="not-prose space-y-3 my-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm font-mono text-blue-900 dark:text-blue-300 mb-1">
            /\b(rápid[oa]|fácil|óptim[oa])\b/gi
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Detecta:</strong> Términos vagos como &quot;rápido&quot;, &quot;rápida&quot;, &quot;fácil&quot;, &quot;óptimo&quot;, &quot;óptima&quot;
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            • <code>\b</code> = límite de palabra | <code>[oa]</code> = &apos;o&apos; o &apos;a&apos; | <code>gi</code> = global + case-insensitive
          </p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
          <p className="text-sm font-mono text-orange-900 dark:text-orange-300 mb-1">
            /\b(será|serán|se procesará)\b/gi
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Detecta:</strong> Voz pasiva que oculta responsabilidades
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            • Busca construcciones pasivas comunes en español
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
          <p className="text-sm font-mono text-purple-900 dark:text-purple-300 mb-1">
            /\b(rendimiento|latencia|throughput)\b/i
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Detecta:</strong> Menciones de performance
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            • Luego verifica si hay números adyacentes con <code>/\d+\s*(ms|seg|RPS)/</code>
          </p>
        </div>
      </div>

      <h3>Motor de Análisis (engine.ts)</h3>
      <p>
        El motor ejecuta un pipeline de análisis en 7 pasos:
      </p>

      <ol>
        <li>
          <strong>Validación de Longitud:</strong> Verifica que el requisito tenga ≥ 30 caracteres
        </li>
        <li>
          <strong>Aplicación de Reglas RegExp:</strong> Itera sobre las 7 reglas principales ejecutando
          <code className="mx-1">text.matchAll(pattern)</code> para encontrar coincidencias
        </li>
        <li>
          <strong>Checks Estructurales:</strong> Busca presencia de palabras clave como &quot;entrada&quot;, &quot;salida&quot;,
          &quot;error&quot;, roles (usuario/sistema), etc.
        </li>
        <li>
          <strong>Validación Gherkin:</strong> Si detecta &quot;Dado/Cuando/Entonces&quot;, valida el orden correcto
        </li>
        <li>
          <strong>Cálculo de Cobertura:</strong> Marca checkboxes de inputs/outputs/errores/roles/NFRs
        </li>
        <li>
          <strong>Cálculo de Scores:</strong> Empieza en 100 y resta puntos por cada issue según severidad.
          Suma bonificaciones por buenas prácticas (Gherkin válido, contratos de datos, etc.)
        </li>
        <li>
          <strong>Generación de Summary:</strong> Ordena issues por RPN y crea resumen con top 3
        </li>
      </ol>

      <h3>Sistema de Scoring</h3>
      <p>
        Cada requisito recibe 6 scores independientes (0-100):
      </p>

      <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <h4 className="text-sm font-bold text-green-900 dark:text-green-300 mb-1">Overall</h4>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            Score general. Fórmula: 100 - (Σ deductions)
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">Clarity</h4>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            Penalizado 1.5× por VagueTerm, FuzzyQuantifier, Pronouns
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <h4 className="text-sm font-bold text-yellow-900 dark:text-yellow-300 mb-1">Completeness</h4>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            Penalizado 1.5× por MissingInput/Output, TooShort. Bonus si hay data contracts
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
          <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300 mb-1">Consistency</h4>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            Penalizado 1.5× por GherkinInvalid
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <h4 className="text-sm font-bold text-red-900 dark:text-red-300 mb-1">Feasibility</h4>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            Penalizado 1.2× por PerfNoThreshold, NFRGap. Bonus si hay error handling
          </p>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3">
          <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-1">Testability</h4>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            Bonus +5 por Gherkin válido. Penalizado por falta de inputs/outputs
          </p>
        </div>
      </div>

      <h3>RPN (Risk Priority Number)</h3>
      <p>
        Cada issue tiene un RPN calculado como: <strong>Severidad × Probabilidad</strong>
      </p>

      <div className="not-prose bg-gray-100 dark:bg-gray-800 rounded-lg p-4 my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600">
              <th className="text-left py-2 text-gray-900 dark:text-white">Nivel</th>
              <th className="text-left py-2 text-gray-900 dark:text-white">Valor</th>
              <th className="text-left py-2 text-gray-900 dark:text-white">Descripción</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 dark:text-gray-300">
            <tr>
              <td className="py-2">Low</td>
              <td className="py-2 font-mono">1</td>
              <td className="py-2">Problema menor, fácil de corregir</td>
            </tr>
            <tr>
              <td className="py-2">Medium</td>
              <td className="py-2 font-mono">2</td>
              <td className="py-2">Problema moderado, afecta claridad</td>
            </tr>
            <tr>
              <td className="py-2">High</td>
              <td className="py-2 font-mono">3</td>
              <td className="py-2">Problema serio, dificulta testing</td>
            </tr>
            <tr>
              <td className="py-2">Critical</td>
              <td className="py-2 font-mono">3</td>
              <td className="py-2">Bloqueante, impide implementación</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-sm">
        <strong>Ejemplo:</strong> Un issue con severidad &quot;High&quot; (3) y probabilidad &quot;Medium&quot; (2) tiene RPN = 6.
        Los issues se priorizan por RPN descendente en el summary.
      </p>

      <h3>Validador Gherkin (gherkin.ts)</h3>
      <p>
        Detecta y valida el formato BDD (Behavior-Driven Development):
      </p>

      <div className="not-prose bg-gray-100 dark:bg-gray-800 rounded-lg p-4 my-4 font-mono text-sm">
        <div className="text-green-600 dark:text-green-400">✓ VÁLIDO:</div>
        <div className="text-gray-700 dark:text-gray-300 ml-4 mt-1">
          Dado que el usuario está autenticado,<br />
          Cuando solicita su saldo,<br />
          Entonces el sistema retorna el balance
        </div>

        <div className="text-red-600 dark:text-red-400 mt-4">✗ INVÁLIDO:</div>
        <div className="text-gray-700 dark:text-gray-300 ml-4 mt-1">
          Cuando el usuario hace clic,<br />
          Dado que está en la página principal<br />
          <span className="text-red-600 dark:text-red-400">← Orden incorrecto</span>
        </div>
      </div>

      <h3>Librería de Detección de Patrones</h3>
      <p>
        <strong>¿Qué librería usamos?</strong> Ninguna librería externa. Todo el análisis utiliza:
      </p>

      <ul>
        <li>
          <strong>RegExp nativo de JavaScript:</strong> El objeto <code>RegExp</code> integrado en todos los navegadores
        </li>
        <li>
          <strong>String.prototype.matchAll():</strong> Método estándar de ES2020 para encontrar todas las coincidencias
        </li>
        <li>
          <strong>String.prototype.test():</strong> Método de RegExp para verificar presencia de patrones
        </li>
      </ul>

      <p>
        <strong>Ventajas de no usar librerías:</strong>
      </p>
      <ul>
        <li>✅ Zero dependencies - no vulnerabilidades externas</li>
        <li>✅ Bundle size mínimo - carga más rápida</li>
        <li>✅ Control total sobre la lógica</li>
        <li>✅ Funciona offline sin CDNs</li>
        <li>✅ Mantenimiento simplificado</li>
      </ul>

      <h3>Código de Ejemplo</h3>
      <p>Así se ve internamente el análisis de un patrón:</p>

      <div className="not-prose bg-gray-900 dark:bg-gray-950 rounded-lg p-4 my-4 overflow-x-auto">
        <pre className="text-xs text-gray-300">
{`// Definición de regla en rules-v1.ts
const RULE = {
  heuristic: "VagueTerm",
  pattern: /\\b(rápid[oa]|fácil)\\b/gi,
  severity: "Medium",
  likelihood: "Medium"
};

// Ejecución en engine.ts
const matches = text.matchAll(RULE.pattern);
for (const match of matches) {
  issues.push({
    id: generateIssueId(),
    heuristic: RULE.heuristic,
    excerpt: match[0], // "rápido"
    severity: RULE.severity,
    rpn: calculateRPN("Medium", "Medium") // 2 * 2 = 4
  });
}`}
        </pre>
      </div>

      <h3>Limitaciones</h3>
      <ul>
        <li>
          <strong>Solo español:</strong> Los patrones están optimizados para texto en español
        </li>
        <li>
          <strong>No semántico:</strong> No entiende contexto, solo detecta patrones sintácticos
        </li>
        <li>
          <strong>Falsos positivos:</strong> En casos muy específicos, puede marcar texto válido
        </li>
        <li>
          <strong>Requisito único:</strong> No detecta conflictos entre múltiples requisitos
        </li>
      </ul>

      <h3>Próximas Mejoras (v2)</h3>
      <ul>
        <li>🌐 Soporte multiidioma (inglés, portugués)</li>
        <li>🔗 Análisis de consistencia entre requisitos relacionados</li>
        <li>📊 Gráficos de tendencias (evolution tracking)</li>
        <li>🤖 Modo avanzado con NLP opcional (sin IA generativa)</li>
        <li>📝 Export a Word/PDF con reporte formateado</li>
      </ul>

      <div className="not-prose bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          <strong>💡 Tip:</strong> Para obtener mejores resultados, escribe requisitos en formato estructurado:
          &quot;Dado [contexto], Cuando [acción], Entonces [resultado esperado]&quot;.
          Define siempre entradas, salidas, umbrales numéricos y casos de error.
        </p>
      </div>
    </div>
  );
}
