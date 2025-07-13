import { BaseClientError } from "./base";

export class EventNotFoundError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "EventNotFoundError";
  }
} 