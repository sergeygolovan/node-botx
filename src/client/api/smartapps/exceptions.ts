import { BaseClientError } from "../../exceptions/base";

export class SyncSmartAppEventHandlerNotFoundError extends BaseClientError {
  constructor(message: string = "Handler for synchronous smartapp event not found.") {
    super(message);
  }
} 