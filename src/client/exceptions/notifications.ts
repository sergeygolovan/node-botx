import { BaseClientError } from "./base";

export class BotIsNotChatMemberError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "BotIsNotChatMemberError";
  }
}

export class FinalRecipientsListEmptyError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "FinalRecipientsListEmptyError";
  }
}

export class StealthModeDisabledError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "StealthModeDisabledError";
  }
} 