export class PostCreatedEvent {
  constructor(
    public readonly userId: number,
    public readonly postId: number,
    public readonly threadId: number
  ) {}
}
