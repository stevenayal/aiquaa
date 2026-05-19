export class IdeaCreatedEvent {
  constructor(
    public readonly userId: number,
    public readonly ideaId: number,
    public readonly categoryId: number
  ) {}
}
