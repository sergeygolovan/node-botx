import { SmartAppInstance } from "../smartapp";
import { RPCArgsBaseModel } from "./request";
import { RPCResponse, Handler, Middleware } from "../typing";

// Простая модель для поля (аналог ModelField из Pydantic)
export interface ModelField {
  name: string;
  type: any;
  required?: boolean;
}

export class RPCMethod {
  handler: Handler;
  middlewares: Middleware[];
  responseField: ModelField;
  argumentsField?: ModelField;
  methodName: string;
  tags: string[] = [];
  errors: Record<string, any> = {};
  errorsModels: Record<string, ModelField> = {};
  includeInSchema: boolean = true;

  constructor(
    handler: Handler,
    middlewares: Middleware[],
    responseField: ModelField,
    argumentsField?: ModelField,
    methodName: string = "",
    tags: string[] = [],
    errors: Record<string, any> = {},
    errorsModels: Record<string, ModelField> = {},
    includeInSchema: boolean = true
  ) {
    this.handler = handler;
    this.middlewares = middlewares;
    this.responseField = responseField;
    this.argumentsField = argumentsField;
    this.methodName = methodName;
    this.tags = tags;
    this.errors = errors;
    this.errorsModels = errorsModels;
    this.includeInSchema = includeInSchema;
  }

  async execute(
    smartapp: SmartAppInstance,
    rpcArgs: RPCArgsBaseModel
  ): Promise<RPCResponse> {
    // Создаем цепочку мидлварей в обратном порядке
    // Если middlewares = [m1, m2] и method.middlewares = [m3, m4]
    // то стек будет m1(m2(m3(m4(handler()))))
    let handler: Handler = this.handler;
    
    for (const middleware of this.middlewares.slice().reverse()) {
      const wrappedHandler = async (smartapp: SmartAppInstance, args: RPCArgsBaseModel) => {
        return await middleware(smartapp, args, handler as any);
      };
      handler = wrappedHandler;
    }

    return await handler(smartapp, rpcArgs);
  }
} 