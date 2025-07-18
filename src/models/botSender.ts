export class BotSender {
  constructor(
    public huid: string, // UUID
    public is_chat_admin?: boolean | null,
    public is_chat_creator?: boolean | null
  ) {}
}
