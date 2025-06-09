import winston from "winston";
import { MAX_FILE_LEN_IN_LOGS } from "./constants";

export function pformatJsonableObj(jsonableObj: unknown): string {
  return JSON.stringify(jsonableObj, null, 4);
}

export function trimFileDataInOutgoingJson<T extends Record<string, any>>(
  jsonBody: T
): T {
  if (
    typeof jsonBody !== "object" ||
    jsonBody === null ||
    !("file" in jsonBody)
  ) {
    return jsonBody;
  }

  const result = structuredClone(jsonBody);

  if (result.file?.data) {
    result.file.data =
      result.file.data.slice(0, MAX_FILE_LEN_IN_LOGS) + "...<trimmed>";
  }

  return result;
}

export function trimFileDataInIncomingJson(
  jsonBody: Record<string, any>
): Record<string, any> {
  if (
    jsonBody.attachments &&
    Array.isArray(jsonBody.attachments) &&
    jsonBody.attachments[0]?.data?.content
  ) {
    const result = structuredClone(jsonBody);

    result.attachments[0].data.content =
      result.attachments[0].data.content.slice(0, MAX_FILE_LEN_IN_LOGS) +
      "...<trimmed>";

    return result;
  }

  return jsonBody;
}

export function logIncomingRequest(
  request: Record<string, any>,
  message = ""
): void {
  const trimmed = trimFileDataInIncomingJson(request);
  logger.debug(`${message}${pformatJsonableObj(trimmed)}`);
}

export function setupLogger(): winston.Logger {
  return winston.createLogger({
    level: "debug",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
      })
    ),
    transports: [new winston.transports.Console()],
  });
}

export const logger = setupLogger();
