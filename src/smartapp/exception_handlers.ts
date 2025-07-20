import { RPCError } from "./models/errors";
import { RPCErrorResponse } from "./models/responses";
import { RPCErrorExc } from "./exceptions";
import { SmartAppInstance } from "./smartapp";
import { logger } from "@logger";

export async function defaultExceptionHandler(
  exc: Error,
  smartapp: SmartAppInstance
): Promise<RPCErrorResponse> {
  logger.error("Exception in RPC handler:", exc);
  return new RPCErrorResponse([
    new RPCError(
      "Internal error",
      exc.constructor.name.toUpperCase()
    )
  ]);
}

export async function rpcExceptionHandler(
  exc: RPCErrorExc,
  smartapp: SmartAppInstance
): Promise<RPCErrorResponse> {
  return new RPCErrorResponse(exc.errors);
} 