import { BaseClientError } from "./base";

export class FileDeletedError extends BaseClientError {
  constructor(message: string) {
    super(message);
  }
}

export class FileMetadataNotFound extends BaseClientError {
  constructor(message: string) {
    super(message);
  }
}

export class FileTypeNotAllowed extends BaseClientError {
  constructor(message: string) {
    super(message);
  }
} 