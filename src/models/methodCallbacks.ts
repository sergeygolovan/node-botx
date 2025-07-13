export class BotAPIMethodSuccessfulCallback {
  constructor(
    public syncId: string,
    public status: "ok",
    public result: Record<string, any>
  ) {}
}

export class BotAPIMethodFailedCallback {
  constructor(
    public syncId: string,
    public status: "error",
    public reason: string,
    public errors: string[],
    public errorData: Record<string, any>
  ) {}
}

export type BotXMethodCallback =
  | BotAPIMethodSuccessfulCallback
  | BotAPIMethodFailedCallback;
