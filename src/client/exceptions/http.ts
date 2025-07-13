import { BaseClientError } from "./base";

export class InvalidBotXResponseError extends BaseClientError {
  response: any;

  constructor(response: any) {
    const exc = BaseClientError.fromResponse(response);
    super(exc.message);
    this.name = "InvalidBotXResponseError";
    this.response = response;
  }
}

export class InvalidBotXStatusCodeError extends InvalidBotXResponseError {
  constructor(response: any) {
    super(response);
    this.name = "InvalidBotXStatusCodeError";
  }
}

export class InvalidBotXResponsePayloadError extends InvalidBotXResponseError {
  constructor(response: any) {
    super(response);
    this.name = "InvalidBotXResponsePayloadError";
  }
} 