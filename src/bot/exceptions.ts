export class UnknownBotAccountError extends Error {
  constructor(public botId: string) {
    super(`No bot account with bot_id: \`${botId}\``);
    this.name = "UnknownBotAccountError";
  }
}

export class BotXMethodCallbackNotFoundError extends Error {
  constructor(public syncId: string) {
    super(`Callback \`${syncId}\` doesn't exist or already waited or timed out`);
    this.name = "BotXMethodCallbackNotFoundError";
  }
}

export class BotShuttingDownError extends Error {
  constructor(public context: any) {
    super(`Bot is shutting down: ${context}`);
    this.name = "BotShuttingDownError";
  }
}

export class AnswerDestinationLookupError extends Error {
  constructor() {
    super("No IncomingMessage received. Use `Bot.send` instead");
    this.name = "AnswerDestinationLookupError";
  }
}

export class RequestHeadersNotProvidedError extends Error {
  constructor(message?: string) {
    super(message || "To verify the request you should provide headers.");
    this.name = "RequestHeadersNotProvidedError";
  }
}

export class UnverifiedRequestError extends Error {
  constructor(message?: string) {
    super(message || "The authorization header is missing or the token is invalid.");
    this.name = "UnverifiedRequestError";
  }
} 