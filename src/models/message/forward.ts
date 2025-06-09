import { BotAPIEntityTypes } from "../enums";

export class Forward {
  constructor(
    public message_id: string,
    public chat_id: string,
    public sender_huid: string,
    public sender_name: string
  ) {}

  toAPI(): BotAPIForward {
    return {
      type: BotAPIEntityTypes.FORWARD,
      data: {
        message_id: this.message_id,
        chat_id: this.chat_id,
        sender_huid: this.sender_huid,
        sender_name: this.sender_name,
      },
    };
  }
}

export interface BotAPIForwardData {
  message_id: string;
  chat_id: string;
  sender_huid: string;
  sender_name: string;
}

export interface BotAPIForward {
  type: BotAPIEntityTypes.FORWARD;
  data: BotAPIForwardData;
}
