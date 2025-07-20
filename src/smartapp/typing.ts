import { RPCErrorExc } from "./exceptions";
import { RPCArgsBaseModel } from "./models/request";
import { RPCErrorResponse, RPCResultResponse } from "./models/responses";
import { SmartAppInstance } from "./smartapp";

export type RPCResponse = RPCErrorResponse | RPCResultResponse;

export type TArgs = RPCArgsBaseModel;

export type HandlerWithArgs<TArgs extends RPCArgsBaseModel = RPCArgsBaseModel> = 
  (smartapp: SmartAppInstance, args: TArgs) => Promise<RPCResponse>;

export type HandlerWithoutArgs = 
  (smartapp: SmartAppInstance) => Promise<RPCResponse>;

export type Handler<TArgs extends RPCArgsBaseModel = RPCArgsBaseModel> = 
  HandlerWithArgs<TArgs> | HandlerWithoutArgs;

export type Middleware<TArgs extends RPCArgsBaseModel = RPCArgsBaseModel> = 
  (smartapp: SmartAppInstance, args: TArgs, callNext: HandlerWithArgs<TArgs>) => Promise<RPCResponse>;

export type TException = Error | RPCErrorExc;

export type ExceptionHandler<TException = any> = 
  (exception: TException, smartapp: SmartAppInstance) => Promise<RPCErrorResponse>;

export type ExceptionHandlerDict = Map<new (...args: any[]) => any, ExceptionHandler<any>>; 