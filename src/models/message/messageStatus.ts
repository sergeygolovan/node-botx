export class MessageStatus {
  constructor(
    public group_chat_id: string,
    public sent_to: string[],
    public read_by: Record<string, Date>,
    public received_by: Record<string, Date>
  ) {}
} 