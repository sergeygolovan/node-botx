import type { BotAPIMethodFailedCallback } from "@models";
import type { HttpResponse } from "../httpClient";

// Базовый класс для исключений клиента
export class BaseClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  static fromResponse(response: HttpResponse, comment?: string): BaseClientError {
    const method = response.config?.method || 'UNKNOWN';
    const url = response.config?.url || 'UNKNOWN';
    const statusCode = response.status;
    const content = response.data ? JSON.stringify(response.data) : 'No content';

    let message = `${method} ${url}\nfailed with code ${statusCode} and payload:\n${content}`;

    if (comment) {
      message = `${message}\n\nComment: ${comment}`;
    }

    return new BaseClientError(message);
  }

  static fromCallback(this: new (message: string) => BaseClientError, callback: BotAPIMethodFailedCallback, comment?: string): BaseClientError {
    let message = `BotX method call with sync_id \`${callback.syncId}\` failed with: ${JSON.stringify(callback)}`;

    if (comment) {
      message = `${message}\n\nComment: ${comment}`;
    }

    return new BaseClientError(message);
  }
}

// Интерфейс для исключений с методами fromResponse и fromCallback
export interface ClientErrorConstructor {
  new (message: string): BaseClientError;
  fromResponse(response: HttpResponse, comment?: string): BaseClientError;
  fromCallback(callback: BotAPIMethodFailedCallback, comment?: string): BaseClientError;
} 