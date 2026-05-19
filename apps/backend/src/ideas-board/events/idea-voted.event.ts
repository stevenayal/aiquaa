export class IdeaVotedEvent {
  constructor(
    public readonly userId: number,
    public readonly ideaId: number,
    public readonly value: number
  ) {}
}
