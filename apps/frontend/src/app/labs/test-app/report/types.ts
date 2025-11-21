export interface BugReport {
  id: string;
  title: string;
  description: string;
  stepsToReproduce: string[];
  expectedResult: string;
  actualResult: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: string;
  evidence: string;
  foundAt: Date;
}

export interface CandidateInfo {
  fullName: string;
  email: string;
  githubProfile?: string;
  linkedinProfile?: string;
  candidateId: string;
  testDate: Date;
}

export interface TestSession {
  startTime: Date;
  endTime: Date;
  duration: number; // en minutos
  exploredSections: string[];
}

export interface TechnicalReport {
  candidateInfo: CandidateInfo;
  testSession: TestSession;
  bugsFound: BugReport[];
  auditLog: any[];
  score: {
    bugsFoundPoints: number;
    reportQualityPoints: number;
    coveragePoints: number;
    totalPoints: number;
    maxPoints: number;
    percentage: number;
  };
  evaluatorNotes?: string;
}

export interface ScoreCriteria {
  bugsFound: {
    '1-2': number;
    '3-4': number;
    '5-6': number;
    '7-8': number;
  };
  reportQuality: {
    clearSteps: number;
    correctSeverity: number;
    evidence: number;
  };
  coverage: {
    allSections: number;
    edgeCases: number;
  };
}
