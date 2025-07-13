export class MessageStatus {
  constructor(
    public groupChatId: string,
    public sentTo: string[],
    public readBy: Record<string, Date>,
    public receivedBy: Record<string, Date>
  ) {}
} 