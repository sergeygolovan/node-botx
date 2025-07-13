import { BotAPIEntityTypes } from "../enums";

export class Forward {
  constructor(
    public messageId: string,
    public chatId: string,
    public senderHuid: string,
    public senderName: string
  ) {}

  toAPI(): BotAPIForward {
    return {
      type: BotAPIEntityTypes.FORWARD,
      data: {
        messageId: this.messageId,
        chatId: this.chatId,
        senderHuid: this.senderHuid,
        senderName: this.senderName,
      },
    };
  }
}

export interface BotAPIForwardData {
  messageId: string;
  chatId: string;
  senderHuid: string;
  senderName: string;
}

export interface BotAPIForward {
  type: BotAPIEntityTypes.FORWARD;
  data: BotAPIForwardData;
}
