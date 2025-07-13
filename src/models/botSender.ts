export class BotSender {
  constructor(
    public huid: string, // UUID
    public isChatAdmin?: boolean | null,
    public isChatCreator?: boolean | null
  ) {}
}
