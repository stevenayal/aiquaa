export class AllPairsGeneratedEvent {
  constructor(
    public readonly userId: number,
    public readonly combinationsCount: number,
    public readonly sessionId: string
  ) {}
}
