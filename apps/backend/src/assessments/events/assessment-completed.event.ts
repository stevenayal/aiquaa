export class AssessmentCompletedEvent {
  constructor(
    public readonly userId: number,
    public readonly attemptId: number,
    public readonly passed: boolean,
    public readonly totalScore: number
  ) {}
}
