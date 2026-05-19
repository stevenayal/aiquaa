export class ThreadCreatedEvent {
  constructor(
    public readonly userId: number,
    public readonly threadId: number,
    public readonly categoryId: number
  ) {}
}
