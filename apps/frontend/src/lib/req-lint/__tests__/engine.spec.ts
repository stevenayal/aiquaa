// __tests__/engine.spec.ts
import { describe, it, expect } from "vitest";
import { analyzeRequirement } from "../engine";
import type { RequirementInput } from "../schemas";

describe("Requirements Linter Engine", () => {
  it("should detect VagueTerm", () => {
    const input: RequirementInput = {
      requirement_id: "REQ-001",
      requirement_text: "El sistema debe responder muy rápido y de forma fácil a las consultas del usuario.",
    };

    const result = analyzeRequirement(input);

    expect(result.issues.length).toBeGreaterThan(0);
    const vagueIssues = result.issues.filter((i) => i.heuristic === "VagueTerm");
    expect(vagueIssues.length).toBeGreaterThanOrEqual(2); // "rápido" and "fácil"
    expect(vagueIssues[0].excerpt.toLowerCase()).toMatch(/rápid|fácil/);
  });

  it("should detect PerfNoThreshold", () => {
    const input: RequirementInput = {
      requirement_id: "REQ-002",
      requirement_text: "El sistema debe tener buen rendimiento y buena latencia en las operaciones críticas.",
    };

    const result = analyzeRequirement(input);

    const perfIssues = result.issues.filter((i) => i.heuristic === "PerfNoThreshold");
    expect(perfIssues.length).toBeGreaterThan(0);
    expect(perfIssues[0].severity).toBe("High");
  });

  it("should detect MissingInputOutput", () => {
    const input: RequirementInput = {
      requirement_id: "REQ-003",
      requirement_text: "El sistema procesa la información y realiza validaciones.",
    };

    const result = analyzeRequirement(input);

    const missingIssues = result.issues.filter((i) => i.heuristic === "MissingInputOutput");
    expect(missingIssues.length).toBeGreaterThanOrEqual(2); // Missing input and output
    expect(result.coverage.inputs_defined).toBe(false);
    expect(result.coverage.outputs_defined).toBe(false);
  });

  it("should validate correct Gherkin format", () => {
    const input: RequirementInput = {
      requirement_id: "REQ-004",
      requirement_text:
        "Dado que el usuario está autenticado, cuando ingresa su consulta de saldo, entonces el sistema muestra el saldo actual en pantalla.",
    };

    const result = analyzeRequirement(input);

    const gherkinIssues = result.issues.filter((i) => i.heuristic === "GherkinInvalid");
    expect(gherkinIssues.length).toBe(0);
    expect(result.quality_score.testability).toBeGreaterThan(70); // Bonus for valid Gherkin
  });

  it("should detect invalid Gherkin order", () => {
    const input: RequirementInput = {
      requirement_id: "REQ-005",
      requirement_text: "Cuando el usuario hace clic, dado que está en la página principal, entonces se muestra el mensaje.",
    };

    const result = analyzeRequirement(input);

    const gherkinIssues = result.issues.filter((i) => i.heuristic === "GherkinInvalid");
    expect(gherkinIssues.length).toBeGreaterThan(0);
  });

  it("should detect TooShort requirement", () => {
    const input: RequirementInput = {
      requirement_id: "REQ-006",
      requirement_text: "Validar datos",
    };

    const result = analyzeRequirement(input);

    const tooShortIssues = result.issues.filter((i) => i.heuristic === "TooShort");
    expect(tooShortIssues.length).toBe(1);
    expect(result.quality_score.completeness).toBeLessThan(80);
  });

  it("should detect PassiveVoice", () => {
    const input: RequirementInput = {
      requirement_id: "REQ-007",
      requirement_text: "Los datos serán procesados y será generado un reporte que será enviado al administrador.",
    };

    const result = analyzeRequirement(input);

    const passiveIssues = result.issues.filter((i) => i.heuristic === "PassiveVoice");
    expect(passiveIssues.length).toBeGreaterThan(0);
  });

  it("should detect UndefinedRole", () => {
    const input: RequirementInput = {
      requirement_id: "REQ-008",
      requirement_text:
        "Se debe validar que los campos sean correctos y luego procesar la información recibida para generar un resultado.",
    };

    const result = analyzeRequirement(input);

    const roleIssues = result.issues.filter((i) => i.heuristic === "UndefinedRole");
    expect(roleIssues.length).toBeGreaterThan(0);
    expect(result.coverage.roles_responsibilities_defined).toBe(false);
  });

  it("should detect TemporalDeixis", () => {
    const input: RequirementInput = {
      requirement_id: "REQ-009",
      requirement_text: "El sistema debe implementar la funcionalidad pronto y estará disponible en breve para los usuarios.",
    };

    const result = analyzeRequirement(input);

    const temporalIssues = result.issues.filter((i) => i.heuristic === "TemporalDeixis");
    expect(temporalIssues.length).toBeGreaterThan(0);
    expect(temporalIssues[0].severity).toBe("High");
  });

  it("should detect FuzzyQuantifier", () => {
    const input: RequirementInput = {
      requirement_id: "REQ-010",
      requirement_text: "El sistema debe procesar alrededor de 1000 registros, más o menos 100 por segundo.",
    };

    const result = analyzeRequirement(input);

    const fuzzyIssues = result.issues.filter((i) => i.heuristic === "FuzzyQuantifier");
    expect(fuzzyIssues.length).toBeGreaterThan(0);
  });

  it("should give high score to well-formed requirement", () => {
    const input: RequirementInput = {
      requirement_id: "REQ-011",
      requirement_text:
        "Dado que el usuario está autenticado en el sistema, " +
        "cuando solicita consultar su saldo mediante el endpoint /api/balance con su ID de usuario como parámetro, " +
        "entonces el sistema retorna un objeto JSON con el campo 'balance' tipo decimal(12,2) " +
        "con un tiempo de respuesta p95 menor a 200ms. " +
        "En caso de error de autenticación, retorna HTTP 401. " +
        "Si el usuario no existe, retorna HTTP 404 con mensaje descriptivo.",
    };

    const result = analyzeRequirement(input);

    expect(result.quality_score.overall).toBeGreaterThan(70);
    expect(result.coverage.inputs_defined).toBe(true);
    expect(result.coverage.outputs_defined).toBe(true);
    expect(result.coverage.error_handling_defined).toBe(true);
    expect(result.coverage.roles_responsibilities_defined).toBe(true);
    expect(result.coverage.data_contracts_defined).toBe(true);
  });

  it("should generate acceptance criteria", () => {
    const input: RequirementInput = {
      requirement_id: "REQ-012",
      requirement_text:
        "El sistema debe validar que el usuario ingrese un email válido y retornar un mensaje de confirmación.",
      acceptance_template: "GWT",
    };

    const result = analyzeRequirement(input);

    expect(result.acceptance_criteria.length).toBeGreaterThan(0);
    expect(result.acceptance_criteria[0].format).toBe("GWT");
  });

  it("should calculate RPN correctly", () => {
    const input: RequirementInput = {
      requirement_id: "REQ-013",
      requirement_text: "Hacer algo pronto de forma rápida.",
    };

    const result = analyzeRequirement(input);

    const issues = result.issues;
    expect(issues.length).toBeGreaterThan(0);
    issues.forEach((issue) => {
      expect(issue.rpn).toBeGreaterThan(0);
      expect(issue.rpn).toBeLessThanOrEqual(9); // Max: 3 * 3
    });
  });

  it("should detect business rules", () => {
    const input: RequirementInput = {
      requirement_id: "REQ-014",
      requirement_text:
        "El sistema recibe una solicitud con datos del usuario. Si el usuario tiene más de 18 años, debe permitir el registro. Si es menor, debe rechazar la solicitud con un mensaje de error.",
    };

    const result = analyzeRequirement(input);

    expect(result.coverage.business_rules.length).toBeGreaterThan(0);
  });

  it("should detect NFRs", () => {
    const input: RequirementInput = {
      requirement_id: "REQ-015",
      requirement_text:
        "El sistema debe garantizar la seguridad mediante autenticación OAuth2 y mantener una disponibilidad del 99.9% con capacidad de escalar hasta 10000 usuarios concurrentes.",
    };

    const result = analyzeRequirement(input);

    expect(result.coverage.nfr_defined).toContain("security");
    expect(result.coverage.nfr_defined).toContain("scalability");
  });

  it("should generate meaningful summary", () => {
    const input: RequirementInput = {
      requirement_id: "REQ-016",
      requirement_text: "El sistema debe responder muy rápido y fácil a las consultas. Performance óptima.",
    };

    const result = analyzeRequirement(input);

    expect(result.summary).toContain("Score:");
    expect(result.summary).toContain(result.quality_score.overall.toString());
    expect(result.summary.length).toBeGreaterThan(10);
  });

  it("should match snapshot for complex requirement", () => {
    const input: RequirementInput = {
      requirement_id: "REQ-SNAPSHOT",
      requirement_text:
        "El sistema deberá responder rápido a las consultas de saldo. Registrar esto y mostrarlo al usuario.",
      context: {
        module: "Cuentas",
      },
    };

    const result = analyzeRequirement(input);

    // Basic structure checks
    expect(result).toHaveProperty("requirement_id");
    expect(result).toHaveProperty("quality_score");
    expect(result).toHaveProperty("issues");
    expect(result).toHaveProperty("coverage");
    expect(result).toHaveProperty("acceptance_criteria");
    expect(result).toHaveProperty("traceability");
    expect(result).toHaveProperty("summary");

    // Should have multiple issues
    expect(result.issues.length).toBeGreaterThan(3);

    // Should detect at least these heuristics
    const heuristics = result.issues.map((i) => i.heuristic);
    expect(heuristics).toContain("VagueTerm");
    expect(heuristics).toContain("PronounWithoutAntecedent");
    expect(heuristics).toContain("MissingInputOutput");

    // Quality score should be affected
    expect(result.quality_score.overall).toBeLessThan(100);
  });
});
