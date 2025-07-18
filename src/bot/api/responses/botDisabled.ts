export interface BotAPIBotDisabledErrorData {
  statusMessage: string;
}

export interface BotAPIBotDisabledResponse {
  errorData: BotAPIBotDisabledErrorData;
  errors: string[];
  reason: "bot_disabled";
}

export function buildBotDisabledResponse(statusMessage: string): BotAPIBotDisabledResponse {
  return {
    errorData: { statusMessage },
    errors: [],
    reason: "bot_disabled",
  };
} 