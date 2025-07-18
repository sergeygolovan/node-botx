import { BotAPIEntityTypes } from "../enums";
import { IsString } from "class-validator";

export class Forward {
  @IsString()
  messageId: string;

  @IsString()
  chatId: string;

  @IsString()
  senderHuid: string;

  @IsString()
  senderName: string;

  constructor(
    messageId: string,
    chatId: string,
    senderHuid: string,
    senderName: string
  ) {
    this.messageId = messageId;
    this.chatId = chatId;
    this.senderHuid = senderHuid;
    this.senderName = senderName;
  }

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
