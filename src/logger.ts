import winston from "winston";
import { MAX_FILE_LEN_IN_LOGS } from "./constants";

export interface ILogger {
    error(message: string, ...meta: any[]): void;
    warn(message: string, ...meta: any[]): void;
    info(message: string, ...meta: any[]): void;
    debug(message: string, ...meta: any[]): void;
}

/**
 * Pretty format JSON object with sorted keys.
 * Equivalent to Python's pformat_jsonable_obj function.
 */
export function pformatJsonableObj(jsonableObj: unknown): string {
  // Note: JSON.stringify doesn't support sort_keys like Python's json.dumps
  // We could implement custom sorting, but it's complex for nested objects
  return JSON.stringify(jsonableObj, null, 4);
}

/**
 * Trim file data in outgoing JSON to prevent large logs.
 * Equivalent to Python's trim_file_data_in_outgoing_json function.
 */
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

/**
 * Trim file data in incoming JSON to prevent large logs.
 * Equivalent to Python's trim_file_data_in_incoming_json function.
 */
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

/**
 * Log incoming request with trimmed file data.
 * Equivalent to Python's log_incoming_request function.
 * Note: TypeScript doesn't have lazy logging like loguru, so we always format
 */
export function logIncomingRequest(
  request: Record<string, any>,
  message = ""
): void {
  const trimmed = trimFileDataInIncomingJson(request);
  logger.debug(`${message}${pformatJsonableObj(trimmed)}`);
}

/**
 * Setup logger instance.
 * Equivalent to Python's setup_logger function.
 */
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

export const defaultLogger: ILogger = setupLogger();
export const logger = defaultLogger;
