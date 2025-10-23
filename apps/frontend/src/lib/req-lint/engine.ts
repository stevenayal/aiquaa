// engine.ts
import type {
  RequirementInput,
  AnalysisResult,
  Issue,
  QualityScore,
  Coverage,
  AcceptanceCriterion,
  Traceability,
} from "./schemas";
import {
  RULES,
  calculateRPN,
  checkTooShort,
  checkMissingInput,
  checkMissingOutput,
  checkMissingErrorHandling,
  checkUndefinedRole,
  detectRoles,
  detectDataContracts,
  detectBusinessRules,
  detectNFRs,
} from "./rules-v1";
import { validateGherkin, extractGherkinCriteria } from "./gherkin";

let issueCounter = 0;

function generateIssueId(): string {
  return `ISSUE-${++issueCounter}`;
}

export function analyzeRequirement(input: RequirementInput): AnalysisResult {
  const { requirement_id, requirement_text, context, glossary, acceptance_template } = input;
  const issues: Issue[] = [];

  // Reset counter for each analysis
  issueCounter = 0;

  // Check TooShort
  if (checkTooShort(requirement_text)) {
    issues.push({
      id: generateIssueId(),
      type: "Omission",
      heuristic: "TooShort",
      excerpt: requirement_text.substring(0, 30),
      explanation: `El texto es demasiado corto (${requirement_text.length} caracteres). Los requisitos deben tener al menos 30 caracteres para ser descriptivos.`,
      impact_area: ["Testability", "Compliance"],
      severity: "Medium",
      likelihood: "High",
      rpn: calculateRPN("Medium", "High"),
      fix_suggestion: "Expande el requisito con más detalles: contexto, entradas, salidas esperadas, y criterios de aceptación",
    });
  }

  // Apply regex-based rules
  RULES.forEach((rule) => {
    const matches = requirement_text.matchAll(rule.pattern);
    for (const match of matches) {
      const excerpt = match[0];
      const issue: Issue = {
        id: generateIssueId(),
        type: rule.type,
        heuristic: rule.heuristic,
        excerpt,
        explanation: rule.explanation(excerpt),
        impact_area: rule.impact_area,
        severity: rule.severity,
        likelihood: rule.likelihood,
        rpn: calculateRPN(rule.severity, rule.likelihood),
        fix_suggestion: rule.fix_suggestion(excerpt),
        proposed_rewrite: rule.proposed_rewrite?.(excerpt, requirement_text),
      };
      issues.push(issue);
    }
  });

  // Check for missing input/output
  if (checkMissingInput(requirement_text)) {
    issues.push({
      id: generateIssueId(),
      type: "Omission",
      heuristic: "MissingInputOutput",
      excerpt: "",
      explanation: "No se especifican las entradas del requisito. Es importante definir qué datos recibe el sistema.",
      impact_area: ["Testability", "Compliance"],
      severity: "High",
      likelihood: "Medium",
      rpn: calculateRPN("High", "Medium"),
      fix_suggestion: "Agrega una sección que describa las entradas: 'Recibe como entrada: [campo1, campo2, ...]'",
    });
  }

  if (checkMissingOutput(requirement_text)) {
    issues.push({
      id: generateIssueId(),
      type: "Omission",
      heuristic: "MissingInputOutput",
      excerpt: "",
      explanation: "No se especifican las salidas del requisito. Es importante definir qué resultado produce el sistema.",
      impact_area: ["Testability", "Compliance"],
      severity: "High",
      likelihood: "Medium",
      rpn: calculateRPN("High", "Medium"),
      fix_suggestion: "Agrega una sección que describa las salidas esperadas: 'Retorna/Muestra: [resultado esperado]'",
    });
  }

  // Check for missing error handling
  if (checkMissingErrorHandling(requirement_text)) {
    issues.push({
      id: generateIssueId(),
      type: "Omission",
      heuristic: "MissingErrorHandling",
      excerpt: "",
      explanation: "No se especifica el manejo de errores o validaciones. Los requisitos deben contemplar casos de error.",
      impact_area: ["Testability", "Operability"],
      severity: "Medium",
      likelihood: "High",
      rpn: calculateRPN("Medium", "High"),
      fix_suggestion:
        "Agrega escenarios de error: 'Si [condición inválida], entonces [acción de error]' o 'En caso de fallo: [comportamiento esperado]'",
    });
  }

  // Check for undefined role
  if (checkUndefinedRole(requirement_text)) {
    issues.push({
      id: generateIssueId(),
      type: "ResponsibilityGap",
      heuristic: "UndefinedRole",
      excerpt: "",
      explanation:
        "No se identifica claramente quién (usuario, sistema, módulo) realiza las acciones. Esto genera ambigüedad de responsabilidades.",
      impact_area: ["Testability", "Operability"],
      severity: "High",
      likelihood: "High",
      rpn: calculateRPN("High", "High"),
      fix_suggestion: "Especifica el actor: 'El usuario debe...', 'El sistema validará...', 'El módulo de autenticación...'",
    });
  }

  // Validate Gherkin
  const gherkinValidation = validateGherkin(requirement_text);
  if (gherkinValidation.hasGherkin && !gherkinValidation.valid) {
    gherkinValidation.errors.forEach((error) => {
      issues.push({
        id: generateIssueId(),
        type: "Inconsistency",
        heuristic: "GherkinInvalid",
        excerpt: "",
        explanation: error,
        impact_area: ["Testability"],
        severity: "Medium",
        likelihood: "Medium",
        rpn: calculateRPN("Medium", "Medium"),
        fix_suggestion: "Corrige la estructura Gherkin siguiendo el orden: Dado → Cuando → Entonces",
      });
    });
  }

  // Check for performance mentions without thresholds
  const perfMatches = [...requirement_text.matchAll(/\b(rendimiento|performance|latencia|tiempo de respuesta|throughput|rps|p95|p99)\b/gi)];
  if (perfMatches.length > 0) {
    const hasNumbers = /\d+\s*(ms|seg|segundos?|RPS|req\/s|%)/i.test(requirement_text);
    if (!hasNumbers) {
      // This is already covered by the PerfNoThreshold rule, but we can ensure it's caught
      const alreadyReported = issues.some((i) => i.heuristic === "PerfNoThreshold");
      if (!alreadyReported) {
        issues.push({
          id: generateIssueId(),
          type: "NFRGap",
          heuristic: "PerfNoThreshold",
          excerpt: perfMatches[0][0],
          explanation: `Se menciona performance ("${perfMatches[0][0]}") sin especificar umbrales numéricos.`,
          impact_area: ["Performance", "Testability"],
          severity: "High",
          likelihood: "Medium",
          rpn: calculateRPN("High", "Medium"),
          fix_suggestion: "Define umbrales concretos: 'p95 ≤ 300 ms', 'throughput ≥ 1000 RPS'",
        });
      }
    }
  }

  // Calculate coverage
  const coverage: Coverage = {
    inputs_defined: !checkMissingInput(requirement_text),
    outputs_defined: !checkMissingOutput(requirement_text),
    business_rules: detectBusinessRules(requirement_text),
    error_handling_defined: !checkMissingErrorHandling(requirement_text),
    roles_responsibilities_defined: detectRoles(requirement_text),
    data_contracts_defined: detectDataContracts(requirement_text),
    nfr_defined: detectNFRs(requirement_text),
  };

  // Generate acceptance criteria
  const acceptance_criteria: AcceptanceCriterion[] = generateAcceptanceCriteria(
    requirement_text,
    acceptance_template || "GWT",
    gherkinValidation
  );

  // Calculate traceability
  const traceability: Traceability = {
    glossary_terms_used: detectGlossaryTerms(requirement_text, glossary || {}),
    external_refs_needed: detectExternalRefs(requirement_text),
    dependencies_touched: context?.dependencies || [],
  };

  // Calculate quality scores
  const quality_score = calculateQualityScore(issues, coverage, gherkinValidation.bonus);

  // Generate summary
  const summary = generateSummary(issues, quality_score);

  return {
    requirement_id,
    quality_score,
    issues,
    coverage,
    acceptance_criteria,
    traceability,
    summary,
  };
}

function calculateQualityScore(issues: Issue[], coverage: Coverage, gherkinBonus: number): QualityScore {
  // Start with 100 points
  let overall = 100;
  let clarity = 100;
  let completeness = 100;
  let consistency = 100;
  let feasibility = 100;
  let testability = 100;

  // Deduct points per issue
  issues.forEach((issue) => {
    const deduction = issue.severity === "Critical" ? 12 : issue.severity === "High" ? 8 : issue.severity === "Medium" ? 5 : 3;

    overall -= deduction;

    // Apply specific deductions to dimensions
    if (issue.heuristic === "VagueTerm" || issue.heuristic === "FuzzyQuantifier" || issue.heuristic === "PronounWithoutAntecedent") {
      clarity -= deduction * 1.5;
    }

    if (
      issue.heuristic === "MissingInputOutput" ||
      issue.heuristic === "MissingErrorHandling" ||
      issue.heuristic === "TooShort"
    ) {
      completeness -= deduction * 1.5;
    }

    if (issue.heuristic === "GherkinInvalid") {
      consistency -= deduction * 1.5;
    }

    if (issue.heuristic === "PerfNoThreshold" || issue.type === "NFRGap") {
      feasibility -= deduction * 1.2;
      testability -= deduction * 1.5;
    }

    if (issue.impact_area.includes("Testability")) {
      testability -= deduction;
    }
  });

  // Bonus for coverage
  if (coverage.inputs_defined && coverage.outputs_defined) {
    completeness += 5;
    testability += 5;
  }

  if (coverage.error_handling_defined) {
    completeness += 3;
    feasibility += 3;
  }

  if (coverage.roles_responsibilities_defined) {
    clarity += 3;
  }

  if (coverage.data_contracts_defined) {
    completeness += 3;
    testability += 3;
  }

  if (coverage.business_rules.length > 0) {
    completeness += 2;
  }

  // Gherkin bonus
  if (gherkinBonus > 0) {
    testability += gherkinBonus;
  }

  // Clamp scores to 0-100
  const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

  return {
    overall: clamp(overall),
    clarity: clamp(clarity),
    completeness: clamp(completeness),
    consistency: clamp(consistency),
    feasibility: clamp(feasibility),
    testability: clamp(testability),
  };
}

function generateAcceptanceCriteria(
  text: string,
  template: "GWT" | "Checklist",
  gherkinValidation: { hasGherkin: boolean; valid: boolean }
): AcceptanceCriterion[] {
  const criteria: AcceptanceCriterion[] = [];

  if (template === "GWT") {
    if (gherkinValidation.hasGherkin && gherkinValidation.valid) {
      // Extract existing Gherkin criteria
      const gherkinCriteria = extractGherkinCriteria(text);
      gherkinCriteria.forEach((criterion, index) => {
        criteria.push({
          id: `AC-${index + 1}`,
          format: "GWT",
          criterion,
          measurable: true,
          test_oracle: "Verificar que el escenario se ejecuta como se describe",
        });
      });
    } else {
      // Generate generic GWT criteria
      criteria.push({
        id: "AC-1",
        format: "GWT",
        criterion: "Dado que el sistema está en estado inicial, cuando se ejecuta la funcionalidad, entonces se produce el resultado esperado",
        measurable: false,
        test_oracle: "Definir oracle específico basado en las salidas esperadas",
      });

      criteria.push({
        id: "AC-2",
        format: "GWT",
        criterion: "Dado que se proporcionan entradas válidas, cuando se procesa la solicitud, entonces el sistema retorna una respuesta exitosa",
        measurable: false,
      });
    }
  } else {
    // Checklist template
    criteria.push({
      id: "AC-1",
      format: "Checklist",
      criterion: "✓ El sistema acepta las entradas definidas",
      measurable: true,
    });

    criteria.push({
      id: "AC-2",
      format: "Checklist",
      criterion: "✓ El sistema produce las salidas especificadas",
      measurable: true,
    });

    criteria.push({
      id: "AC-3",
      format: "Checklist",
      criterion: "✓ El sistema maneja correctamente los casos de error",
      measurable: true,
    });
  }

  return criteria;
}

function detectGlossaryTerms(text: string, glossary: Record<string, string>): string[] {
  const termsUsed: string[] = [];
  Object.keys(glossary).forEach((term) => {
    const regex = new RegExp(`\\b${term}\\b`, "i");
    if (regex.test(text)) {
      termsUsed.push(term);
    }
  });
  return termsUsed;
}

function detectExternalRefs(text: string): string[] {
  const refs: string[] = [];
  const refPatterns = [
    /\b(API|endpoint|servicio|base de datos|BD|LDAP|OAuth|SAML)\b/gi,
    /\b(integración con|conecta con|consume|depende de)\s+(\w+)/gi,
  ];

  refPatterns.forEach((pattern) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[0]) {
        refs.push(match[0].trim());
      }
    }
  });

  return [...new Set(refs)]; // Remove duplicates
}

function generateSummary(issues: Issue[], score: QualityScore): string {
  if (issues.length === 0) {
    return `Requisito bien formado. Score: ${score.overall}/100. No se detectaron problemas críticos.`;
  }

  // Sort by RPN descending
  const topIssues = [...issues].sort((a, b) => b.rpn - a.rpn).slice(0, 3);

  const issueDescriptions = topIssues.map((issue) => `${issue.heuristic} (RPN: ${issue.rpn})`).join(", ");

  return `Score: ${score.overall}/100. Detectados ${issues.length} problema(s). Top issues: ${issueDescriptions}. Revisar claridad (${score.clarity}/100) y completitud (${score.completeness}/100).`;
}
