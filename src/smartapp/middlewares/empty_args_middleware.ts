import { EmptyArgs } from "../empty_args";
import { SmartAppInstance } from "../smartapp";
import { RPCArgsBaseModel } from "../models/request";
import { RPCResponse, Handler, HandlerWithArgs, HandlerWithoutArgs } from "../typing";

export async function emptyArgsMiddleware(
  smartapp: SmartAppInstance,
  rpcArguments: RPCArgsBaseModel,
  callNext: Handler
): Promise<RPCResponse> {
  if (rpcArguments instanceof EmptyArgs) {
    const handlerWithoutArgs = callNext as HandlerWithoutArgs;
    return await handlerWithoutArgs(smartapp);
  }

  const handlerWithArgs = callNext as HandlerWithArgs;
  return await handlerWithArgs(smartapp, rpcArguments);
} 