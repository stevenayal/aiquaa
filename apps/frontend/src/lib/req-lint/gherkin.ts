// gherkin.ts
export type GherkinValidationResult = {
  valid: boolean;
  hasGherkin: boolean;
  errors: string[];
  bonus: number; // testability bonus if valid
};

const GHERKIN_KEYWORDS = {
  given: /\b(dado|given)\b/i,
  when: /\b(cuando|when)\b/i,
  then: /\b(entonces|then)\b/i,
  and: /\b(y|and)\b/i,
};

export function validateGherkin(text: string): GherkinValidationResult {
  const hasGiven = GHERKIN_KEYWORDS.given.test(text);
  const hasWhen = GHERKIN_KEYWORDS.when.test(text);
  const hasThen = GHERKIN_KEYWORDS.then.test(text);

  const hasGherkin = hasGiven || hasWhen || hasThen;

  if (!hasGherkin) {
    return {
      valid: true, // Not having Gherkin is not an error
      hasGherkin: false,
      errors: [],
      bonus: 0,
    };
  }

  const errors: string[] = [];

  // If any Gherkin keyword is present, all three should be present
  if (hasGherkin) {
    if (!hasGiven) {
      errors.push("Falta la cláusula 'Dado' en el formato Gherkin");
    }
    if (!hasWhen) {
      errors.push("Falta la cláusula 'Cuando' en el formato Gherkin");
    }
    if (!hasThen) {
      errors.push("Falta la cláusula 'Entonces' en el formato Gherkin");
    }
  }

  // Check order: Given should come before When, When before Then
  if (hasGiven && hasWhen) {
    const givenMatch = text.match(GHERKIN_KEYWORDS.given);
    const whenMatch = text.match(GHERKIN_KEYWORDS.when);

    if (givenMatch && whenMatch) {
      const givenIndex = text.indexOf(givenMatch[0]);
      const whenIndex = text.indexOf(whenMatch[0]);

      if (givenIndex > whenIndex) {
        errors.push("Orden incorrecto: 'Dado' debe aparecer antes de 'Cuando'");
      }
    }
  }

  if (hasWhen && hasThen) {
    const whenMatch = text.match(GHERKIN_KEYWORDS.when);
    const thenMatch = text.match(GHERKIN_KEYWORDS.then);

    if (whenMatch && thenMatch) {
      const whenIndex = text.indexOf(whenMatch[0]);
      const thenIndex = text.indexOf(thenMatch[0]);

      if (whenIndex > thenIndex) {
        errors.push("Orden incorrecto: 'Cuando' debe aparecer antes de 'Entonces'");
      }
    }
  }

  const valid = errors.length === 0;
  const bonus = valid && hasGherkin ? 5 : 0;

  return {
    valid,
    hasGherkin,
    errors,
    bonus,
  };
}

export function extractGherkinCriteria(text: string): string[] {
  const criteria: string[] = [];

  // Extract Given clauses
  const givenMatches = text.matchAll(/\b(dado|given)\s+([^.]+)/gi);
  for (const match of givenMatches) {
    criteria.push(`Dado ${match[2].trim()}`);
  }

  // Extract When clauses
  const whenMatches = text.matchAll(/\b(cuando|when)\s+([^.]+)/gi);
  for (const match of whenMatches) {
    criteria.push(`Cuando ${match[2].trim()}`);
  }

  // Extract Then clauses
  const thenMatches = text.matchAll(/\b(entonces|then)\s+([^.]+)/gi);
  for (const match of thenMatches) {
    criteria.push(`Entonces ${match[2].trim()}`);
  }

  return criteria;
}
