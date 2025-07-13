import { BaseClientError } from "./base";

export class MessageNotFoundError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "MessageNotFoundError";
  }
} 