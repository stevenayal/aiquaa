/**
 * Pseudo-Random Number Generator (PRNG)
 * Deterministic random generation based on seed (candidateId)
 */

export class PRNG {
  private seed: number;

  constructor(seedString: string) {
    // Convert string to numeric seed using hash function
    this.seed = this.hashString(seedString);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Linear Congruential Generator
   * Returns a pseudo-random float between 0 and 1
   */
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Returns a random float between min and max
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Shuffles an array in place (Fisher-Yates shuffle)
   */
  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Picks n random elements from array without replacement
   */
  pick<T>(array: T[], count: number): T[] {
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, count);
  }

  /**
   * Returns random element from array
   */
  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}

/**
 * Get candidate ID from URL or sessionStorage
 */
export function getCandidateId(): string | null {
  // Check sessionStorage first
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('candidateId');
    if (stored) return stored;

    // Check URL parameter
    const params = new URLSearchParams(window.location.search);
    const urlCandidate = params.get('candidate');
    if (urlCandidate) {
      sessionStorage.setItem('candidateId', urlCandidate);
      return urlCandidate;
    }
  }
  return null;
}

/**
 * Set candidate ID in sessionStorage
 */
export function setCandidateId(candidateId: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('candidateId', candidateId);
  }
}

/**
 * Get or generate PRNG instance for current candidate
 */
export function getPRNG(): PRNG {
  const candidateId = getCandidateId() || 'default';
  return new PRNG(candidateId);
}
