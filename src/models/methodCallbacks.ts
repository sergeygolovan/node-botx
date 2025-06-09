class BotAPIMethodSuccessfulCallback {
  constructor(
    public sync_id: string,
    public status: "ok",
    public result: Record<string, any>
  ) {}
}

class BotAPIMethodFailedCallback {
  constructor(
    public sync_id: string,
    public status: "error",
    public reason: string,
    public errors: string[],
    public error_data: Record<string, any>
  ) {}
}

type BotXMethodCallback =
  | BotAPIMethodSuccessfulCallback
  | BotAPIMethodFailedCallback;
