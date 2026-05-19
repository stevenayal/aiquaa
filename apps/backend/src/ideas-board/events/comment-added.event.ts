export class CommentAddedEvent {
  constructor(
    public readonly userId: number,
    public readonly ideaId: number,
    public readonly commentId: number
  ) {}
}
