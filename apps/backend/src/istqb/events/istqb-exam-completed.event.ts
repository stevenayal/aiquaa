export class IstqbExamCompletedEvent {
  constructor(
    public readonly userId: number,
    public readonly examId: number,
    public readonly passed: boolean,
    public readonly percentage: number,
    public readonly mode: string
  ) {}
}
