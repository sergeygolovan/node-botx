import { BaseClientError } from "./base";

export class InvalidBotAccountError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidBotAccountError";
  }
}

export class RateLimitReachedError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitReachedError";
  }
}

export class PermissionDeniedError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "PermissionDeniedError";
  }
}

export class ChatNotFoundError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "ChatNotFoundError";
  }
} 