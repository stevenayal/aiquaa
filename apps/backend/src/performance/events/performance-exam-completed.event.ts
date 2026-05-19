export class PerformanceExamCompletedEvent {
  constructor(
    public readonly userId: number,
    public readonly resultId: number,
    public readonly passed: boolean,
    public readonly percentage: number,
    public readonly mode: string
  ) {}
}
