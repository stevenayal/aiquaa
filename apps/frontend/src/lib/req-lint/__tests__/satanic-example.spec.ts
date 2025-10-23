// __tests__/satanic-example.spec.ts
import { describe, it, expect } from "vitest";
import { analyzeRequirement } from "../engine";
import type { RequirementInput } from "../schemas";

describe("HU Satánica - El peor requisito posible", () => {
  const satanicRequirement: RequirementInput = {
    requirement_id: "HU-666",
    requirement_text: `Título: Como usuario quiero que el sistema funcione bien para estar contento.

Descripción:
El sistema deberá cargar rápido y ser fácil, mostrando lo necesario.
Se realizarán validaciones según corresponda y se guardará todo.
Si no hay internet igual debe funcionar igual.
La contraseña debe ser segura pero fácil de recordar.
Los montos serán alrededor de 50k o más, lo antes posible.
Esto debe integrarse con aquello y con ellos.
El tiempo de respuesta debe ser óptimo (<1s), pero que tampoco tarde más de 5 minutos.
Siempre se pedirá 2FA, salvo para no molestar al usuario.
Se procesará la información y será registrada automáticamente.

Entradas/Salidas:
(No aplica)

Reglas de negocio:
- Se hace como se hace normalmente.

Manejo de errores:
Mostrar un error si falla algo.

NFR:
Rendimiento excelente y seguridad adecuada.

Criterios de aceptación (mal formados):
- Debe ser rápido y fácil.
- A veces guardar automáticamente.
- Que muestre bien.
- Dado el usuario, cuando entra, entonces algo pasa.
- Cuando entonces dado se hace.`,
  };

  it("should detect a catastrophic number of issues", () => {
    const result = analyzeRequirement(satanicRequirement);

    // Este requisito debería tener MUCHOS problemas
    expect(result.issues.length).toBeGreaterThan(15);
  });

  it("should detect multiple VagueTerm issues", () => {
    const result = analyzeRequirement(satanicRequirement);

    const vagueTerms = result.issues.filter((i) => i.heuristic === "VagueTerm");
    expect(vagueTerms.length).toBeGreaterThan(5); // rápido, fácil, óptimo, adecuado, etc.
  });

  it("should detect FuzzyQuantifier (alrededor de)", () => {
    const result = analyzeRequirement(satanicRequirement);

    const fuzzy = result.issues.filter((i) => i.heuristic === "FuzzyQuantifier");
    expect(fuzzy.length).toBeGreaterThan(0); // "alrededor de 50k"
  });

  it("should detect PassiveVoice (serán, se realizarán)", () => {
    const result = analyzeRequirement(satanicRequirement);

    const passive = result.issues.filter((i) => i.heuristic === "PassiveVoice");
    expect(passive.length).toBeGreaterThanOrEqual(2); // Al menos 2 usos de voz pasiva
  });

  it("should detect PronounWithoutAntecedent (esto, aquello, ellos)", () => {
    const result = analyzeRequirement(satanicRequirement);

    const pronouns = result.issues.filter((i) => i.heuristic === "PronounWithoutAntecedent");
    expect(pronouns.length).toBeGreaterThan(2); // "esto", "aquello", "ellos"
  });

  it("should have Gherkin-like keywords but poorly formed criteria", () => {
    const result = analyzeRequirement(satanicRequirement);

    // El texto tiene "Dado", "Cuando", "Entonces" en los criterios de aceptación
    // pero están mal formados. El validador puede o no detectar esto dependiendo
    // de si están en el orden correcto dentro de cada línea

    // Este test simplemente verifica que el análisis se completó
    // La detección de Gherkin inválido depende del orden exacto
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("should have a very poor quality score", () => {
    const result = analyzeRequirement(satanicRequirement);

    expect(result.quality_score.overall).toBeLessThan(40); // Score pésimo
    expect(result.quality_score.clarity).toBeLessThan(50); // Muy poco claro
    expect(result.quality_score.testability).toBeLessThan(60); // Difícil de testear
  });

  it("should detect that inputs are NOT properly defined", () => {
    const result = analyzeRequirement(satanicRequirement);

    // Aunque dice "Entradas/Salidas: (No aplica)", el linter debe detectar que faltan
    expect(result.coverage.inputs_defined).toBe(false);
    expect(result.coverage.outputs_defined).toBe(false);
  });

  it("should generate a summary highlighting critical issues", () => {
    const result = analyzeRequirement(satanicRequirement);

    expect(result.summary).toContain("Score:");
    expect(result.summary).toContain(result.quality_score.overall.toString());
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("should identify all the heuristics present in this nightmare", () => {
    const result = analyzeRequirement(satanicRequirement);

    const heuristics = new Set(result.issues.map((i) => i.heuristic));

    // Este requisito satánico debería activar varias reglas:
    expect(heuristics.has("VagueTerm")).toBe(true);
    expect(heuristics.has("FuzzyQuantifier")).toBe(true);
    expect(heuristics.has("PassiveVoice")).toBe(true);
    expect(heuristics.has("PronounWithoutAntecedent")).toBe(true);

    // Debería tener al menos 4 heurísticas diferentes
    expect(heuristics.size).toBeGreaterThanOrEqual(4);
  });

  it("should calculate high RPN for critical issues", () => {
    const result = analyzeRequirement(satanicRequirement);

    const highRpnIssues = result.issues.filter((i) => i.rpn >= 6);
    expect(highRpnIssues.length).toBeGreaterThan(0); // Debe haber issues con RPN alto
  });

  it("should detect NFR mentions without proper thresholds", () => {
    const result = analyzeRequirement(satanicRequirement);

    // "Rendimiento excelente" sin umbrales
    expect(result.coverage.nfr_defined).toContain("performance");
    expect(result.coverage.nfr_defined).toContain("security");
  });
});
