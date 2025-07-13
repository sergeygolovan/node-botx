import { BaseClientError } from "./base";

export class UserNotFoundError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "UserNotFoundError";
  }
}

export class InvalidProfileDataError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidProfileDataError";
  }
}

export class NoUserKindSelectedError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "NoUserKindSelectedError";
  }
} 