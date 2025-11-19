export interface ExamOption {
  label: string;
  text: string;
}

export interface Explanation {
  correct: boolean;
  explanation: string;
}

export interface ExamQuestion {
  id: number;
  questionText: string;
  options: ExamOption[];
  correctAnswer: string[];
  learningObjective: string;
  kLevel: 'K1' | 'K2' | 'K3';
  points: number;
  type: 'single' | 'multiple';
  explanations: Record<string, Explanation>;
}

export interface ExamInfo {
  title: string;
  version: string;
  totalQuestions: number;
  passingScore: number;
  timeLimit: number;
  pointsPerQuestion: number;
}

export interface ExamData {
  examInfo: ExamInfo;
  questions: ExamQuestion[];
}

export interface UserAnswer {
  questionId: number;
  selectedAnswers: string[];
  isMarkedForReview: boolean;
  timeSpent: number;
}

export interface ExamAttempt {
  participantName: string;
  startTime: Date;
  endTime?: Date;
  answers: UserAnswer[];
  score?: number;
  passed?: boolean;
  mode: 'exam' | 'training';
}

export interface ExamResult {
  participantName: string;
  githubProfile: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  passed: boolean;
  percentage: number;
  timeSpent: number;
  answers: AnswerDetail[];
  learningObjectiveAnalysis: LearningObjectiveResult[];
}

export interface AnswerDetail {
  questionId: number;
  questionText: string;
  userAnswer: string[];
  correctAnswer: string[];
  isCorrect: boolean;
  learningObjective: string;
  kLevel: string;
  explanations: Record<string, Explanation>;
}

export interface LearningObjectiveResult {
  learningObjective: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
}

export interface ExamState {
  currentQuestionIndex: number;
  answers: Map<number, string[]>;
  markedForReview: Set<number>;
  timeRemaining: number;
  isRunning: boolean;
}
