import { BaseClientError } from "./base";

export class CantUpdatePersonalChatError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "CantUpdatePersonalChatError";
  }
}

export class InvalidUsersListError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUsersListError";
  }
}

export class ChatCreationProhibitedError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "ChatCreationProhibitedError";
  }
}

export class ChatCreationError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "ChatCreationError";
  }
}

export class ChatNotFoundError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "ChatNotFoundError";
  }
} 