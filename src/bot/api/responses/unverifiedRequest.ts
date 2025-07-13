export interface BotAPIUnverifiedRequestErrorData {
  statusMessage: string;
}

export interface BotAPIUnverifiedRequestResponse {
  errorData: BotAPIUnverifiedRequestErrorData;
  errors: string[];
  reason: "unverified_request";
}

export function buildUnverifiedRequestResponse(statusMessage: string): BotAPIUnverifiedRequestResponse {
  return {
    errorData: { statusMessage },
    errors: [],
    reason: "unverified_request",
  };
} 