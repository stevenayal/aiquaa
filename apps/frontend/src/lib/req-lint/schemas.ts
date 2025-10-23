// schemas.ts
export type RequirementInput = {
  requirement_id: string;
  requirement_text: string;
  context?: {
    product?: string;
    module?: string;
    stakeholders?: string[];
    constraints?: string[];
    dependencies?: string[];
  };
  glossary?: Record<string, string>;
  acceptance_template?: "GWT" | "Checklist";
  non_functional_expectations?: string[];
};

export type IssueType =
  | "Ambiguity"
  | "Omission"
  | "Inconsistency"
  | "NFRGap"
  | "DataSpecGap"
  | "ResponsibilityGap"
  | "RuleConflict";

export type Heuristic =
  | "VagueTerm"
  | "FuzzyQuantifier"
  | "OpenRange"
  | "PronounWithoutAntecedent"
  | "PassiveVoice"
  | "TemporalDeixis"
  | "MissingInputOutput"
  | "MissingErrorHandling"
  | "UndefinedRole"
  | "ImplicitBusinessRule"
  | "TooShort"
  | "GherkinInvalid"
  | "PerfNoThreshold";

export type ImpactArea =
  | "Value"
  | "Compliance"
  | "Security"
  | "Performance"
  | "UX"
  | "Operability"
  | "Testability";

export type Severity = "Low" | "Medium" | "High" | "Critical";
export type Likelihood = "Low" | "Medium" | "High";

export type Issue = {
  id: string;
  type: IssueType;
  heuristic: Heuristic;
  excerpt: string;
  explanation: string;
  impact_area: ImpactArea[];
  severity: Severity;
  likelihood: Likelihood;
  rpn: number; // 1-27
  fix_suggestion: string;
  proposed_rewrite?: string;
};

export type QualityScore = {
  overall: number;
  clarity: number;
  completeness: number;
  consistency: number;
  feasibility: number;
  testability: number;
};

export type Coverage = {
  inputs_defined: boolean;
  outputs_defined: boolean;
  business_rules: string[];
  error_handling_defined: boolean;
  roles_responsibilities_defined: boolean;
  data_contracts_defined: boolean;
  nfr_defined: string[];
};

export type AcceptanceCriterion = {
  id: string;
  format: "GWT" | "Checklist";
  criterion: string;
  measurable: boolean;
  test_oracle?: string;
  example_data?: Record<string, unknown>;
};

export type Traceability = {
  glossary_terms_used: string[];
  external_refs_needed: string[];
  dependencies_touched: string[];
};

export type AnalysisResult = {
  requirement_id: string;
  quality_score: QualityScore;
  issues: Issue[];
  coverage: Coverage;
  acceptance_criteria: AcceptanceCriterion[];
  traceability: Traceability;
  summary: string;
};
