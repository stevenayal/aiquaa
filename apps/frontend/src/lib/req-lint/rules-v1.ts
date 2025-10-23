// rules-v1.ts
import type { Heuristic, IssueType, Severity, Likelihood, ImpactArea } from "./schemas";

export type RuleDefinition = {
  heuristic: Heuristic;
  type: IssueType;
  pattern: RegExp;
  severity: Severity;
  likelihood: Likelihood;
  impact_area: ImpactArea[];
  explanation: (excerpt: string) => string;
  fix_suggestion: (excerpt: string) => string;
  proposed_rewrite?: (excerpt: string, fullText: string) => string | undefined;
};

// RPN mapping based on severity and likelihood
const SEVERITY_MAP: Record<Severity, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 3,
};

const LIKELIHOOD_MAP: Record<Likelihood, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
};

export function calculateRPN(severity: Severity, likelihood: Likelihood): number {
  return SEVERITY_MAP[severity] * LIKELIHOOD_MAP[likelihood];
}

// Regex-based rules
export const RULES: RuleDefinition[] = [
  {
    heuristic: "VagueTerm",
    type: "Ambiguity",
    pattern: /\b(rápid[oa]|fácil|óptim[oa]|adecuad[oa]|pronto|aprox(?:imadamente)?|varios?|algunos?|suficiente)\b/gi,
    severity: "Medium",
    likelihood: "Medium",
    impact_area: ["Testability", "Compliance"],
    explanation: (excerpt) =>
      `Término vago encontrado: "${excerpt}". Los términos imprecisos dificultan la verificación y pueden generar interpretaciones diferentes entre stakeholders.`,
    fix_suggestion: (excerpt) => {
      const term = excerpt.toLowerCase();
      if (term.includes("rápid")) {
        return "Especifica un SLO concreto, por ejemplo: 'p95 ≤ 300 ms' o 'tiempo de respuesta < 2 segundos'";
      }
      if (term.includes("fácil")) {
        return "Define criterios de usabilidad medibles, por ejemplo: 'completable en ≤ 3 clics' o 'SUS score ≥ 70'";
      }
      if (term.includes("óptim")) {
        return "Especifica la métrica y el umbral objetivo, por ejemplo: 'throughput ≥ 1000 RPS' o 'CPU usage ≤ 60%'";
      }
      if (term.includes("aprox") || term.includes("varios") || term.includes("algunos")) {
        return "Reemplaza con una cantidad exacta o un rango preciso: 'entre 3 y 5', 'exactamente 10', etc.";
      }
      return "Define el término con métricas cuantificables y verificables";
    },
    proposed_rewrite: (excerpt, fullText) => {
      if (excerpt.toLowerCase().includes("rápid")) {
        return fullText.replace(new RegExp(excerpt, "gi"), "con tiempo de respuesta p95 ≤ 300 ms");
      }
      return undefined;
    },
  },
  {
    heuristic: "FuzzyQuantifier",
    type: "Ambiguity",
    pattern: /\b(alrededor de|más o menos|cercano a|aproximadamente)\b/gi,
    severity: "Medium",
    likelihood: "High",
    impact_area: ["Testability", "Compliance"],
    explanation: (excerpt) =>
      `Cuantificador difuso: "${excerpt}". Estos términos no permiten establecer criterios de aceptación claros.`,
    fix_suggestion: () =>
      "Especifica un rango concreto con límites superior e inferior, por ejemplo: 'entre 100 y 150 registros'",
    proposed_rewrite: (excerpt, fullText) => {
      return fullText.replace(new RegExp(excerpt + "\\s+(\\d+)", "gi"), "entre $1 y $1");
    },
  },
  {
    heuristic: "OpenRange",
    type: "Ambiguity",
    pattern: /(?:mayor|menor|superior|inferior|más|menos)(?:\s+(?:que|a|de))?\s*(?![\d])/gi,
    severity: "High",
    likelihood: "Medium",
    impact_area: ["Testability", "Compliance"],
    explanation: (excerpt) =>
      `Comparador sin umbral concreto: "${excerpt}". No se puede validar sin un valor de referencia.`,
    fix_suggestion: () =>
      "Agrega el valor umbral específico, por ejemplo: 'mayor que 100', 'menor o igual a 50'",
  },
  {
    heuristic: "PassiveVoice",
    type: "Ambiguity",
    pattern: /\b(será|serán|se realizará|se procesará|será procesado|serán procesados|se ejecutará)\b/gi,
    severity: "Low",
    likelihood: "High",
    impact_area: ["Testability", "Operability"],
    explanation: (excerpt) =>
      `Voz pasiva detectada: "${excerpt}". La voz pasiva oculta el agente responsable de la acción.`,
    fix_suggestion: () =>
      "Reescribe en voz activa especificando el sujeto: 'El sistema validará...', 'El usuario ingresará...'",
    proposed_rewrite: (_excerpt, fullText) => {
      return fullText.replace(/será\s+(\w+)/gi, "El sistema $1");
    },
  },
  {
    heuristic: "PronounWithoutAntecedent",
    type: "Ambiguity",
    pattern: /\b(esto|eso|aquello|ell[oa]s?)\b/gi,
    severity: "Medium",
    likelihood: "Medium",
    impact_area: ["Testability", "Compliance"],
    explanation: (excerpt) =>
      `Pronombre sin antecedente claro: "${excerpt}". Puede generar ambigüedad sobre a qué entidad se refiere.`,
    fix_suggestion: () =>
      "Reemplaza el pronombre con el sustantivo específico al que hace referencia",
  },
  {
    heuristic: "TemporalDeixis",
    type: "Ambiguity",
    pattern: /\b(pronto|en breve|más adelante|próximamente|eventualmente)\b/gi,
    severity: "High",
    likelihood: "Medium",
    impact_area: ["Testability", "Value"],
    explanation: (excerpt) =>
      `Expresión temporal vaga: "${excerpt}". No permite establecer compromisos de tiempo verificables.`,
    fix_suggestion: () =>
      "Especifica una fecha concreta o un plazo definido: 'antes del 2025-12-31', 'en un plazo de 48 horas'",
  },
  {
    heuristic: "PerfNoThreshold",
    type: "NFRGap",
    pattern: /\b(rendimiento|performance|latencia|tiempo de respuesta|throughput|rps|p95|p99)\b/gi,
    severity: "High",
    likelihood: "Medium",
    impact_area: ["Performance", "Testability"],
    explanation: (excerpt) =>
      `Mención de performance sin umbral: "${excerpt}". Los requisitos no funcionales deben ser cuantificables.`,
    fix_suggestion: () =>
      "Define umbrales concretos: 'p95 ≤ 300 ms', 'throughput ≥ 1000 RPS', 'latencia promedio < 100 ms'",
    proposed_rewrite: (excerpt, fullText) => {
      if (excerpt.toLowerCase().includes("rendimiento")) {
        return fullText.replace(new RegExp(excerpt, "gi"), "rendimiento con p95 ≤ 300 ms");
      }
      return undefined;
    },
  },
];

// Non-regex checks (structure-based)
export const MIN_LENGTH_THRESHOLD = 30;

export function checkTooShort(text: string): boolean {
  return text.trim().length < MIN_LENGTH_THRESHOLD;
}

export function checkMissingInput(text: string): boolean {
  const inputPattern = /\b(entrada|input|request|campos?|datos de entrada|parámetros?|recibe|acepta)\b/i;
  return !inputPattern.test(text);
}

export function checkMissingOutput(text: string): boolean {
  const outputPattern = /\b(salida|output|response|resultado|retorna|devuelve|muestra|presenta)\b/i;
  return !outputPattern.test(text);
}

export function checkMissingErrorHandling(text: string): boolean {
  const errorPattern = /\b(error|excepción|fallo|validación|si\s+\w+\s+es\s+inválid[oa]|en\s+caso\s+de)\b/i;
  return !errorPattern.test(text);
}

export function checkUndefinedRole(text: string): boolean {
  const rolePattern = /\b(usuario|sistema|operador|administrador|admin|cliente|servidor|api|servicio|módulo)\b/i;
  return !rolePattern.test(text);
}

export function detectRoles(text: string): boolean {
  const rolePattern = /\b(usuario|sistema|operador|administrador|admin|cliente|servidor|api|servicio|módulo|po|product\s+owner)\b/i;
  return rolePattern.test(text);
}

export function detectDataContracts(text: string): boolean {
  const dataPattern = /\b(json|xml|decimal|varchar|int|string|objeto|array|formato|esquema|estructura|\{|\[|regex|pattern)\b/i;
  return dataPattern.test(text);
}

export function detectBusinessRules(text: string): string[] {
  const rules: string[] = [];
  const rulePatterns = [
    /\b(si|cuando|en\s+caso\s+de|siempre\s+que|solo\s+si)\s+([^.,]+)/gi,
    /\b(debe|no\s+debe|tiene\s+que|es\s+obligatorio)\s+([^.,]+)/gi,
  ];

  rulePatterns.forEach((pattern) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[0]) {
        rules.push(match[0].trim());
      }
    }
  });

  return rules;
}

export function detectNFRs(text: string): string[] {
  const nfrs: string[] = [];
  const nfrPatterns: Record<string, RegExp> = {
    performance: /\b(rendimiento|performance|latencia|tiempo|velocidad|throughput|rps)\b/i,
    security: /\b(seguridad|autenticación|autorización|encriptación|cifrado|ssl|tls)\b/i,
    usability: /\b(usabilidad|fácil|intuitiv[oa]|amigable|accesibilidad)\b/i,
    reliability: /\b(confiabilidad|disponibilidad|uptime|sla|tolerancia\s+a\s+fallos)\b/i,
    scalability: /\b(escalabilidad|escalar|carga|concurrencia)\b/i,
    maintainability: /\b(mantenibilidad|mantenible|extensible|modular)\b/i,
  };

  Object.entries(nfrPatterns).forEach(([nfr, pattern]) => {
    if (pattern.test(text)) {
      nfrs.push(nfr);
    }
  });

  return nfrs;
}
