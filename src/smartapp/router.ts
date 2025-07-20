import { SmartAppInstance } from "./smartapp";
import { RPCArgsBaseModel, RPCRequest } from "./models/request";
import { RPCResponse, Handler, Middleware } from "./typing";
import { RPCMethod, ModelField } from "./models/method";
import { EmptyArgs } from "./empty_args";
import { emptyArgsMiddleware } from "./middlewares/empty_args_middleware";
import { buildMethodNotFoundErrorResponse, buildInvalidRPCArgsErrorResponse, ResultType } from "./models/responses";
import { RPCError } from "./models/errors";

export class RPCRouter {
  private rpcMethods: Map<string, RPCMethod> = new Map();
  private middlewares: Middleware[] = [];
  private tags: string[] = [];
  private includeInSchema: boolean = true;
  private errors: (new (...args: any[]) => RPCError)[] = [];

  constructor(
    middlewares?: Middleware[],
    tags?: string[],
    includeInSchema: boolean = true,
    errors?: (new (...args: any[]) => RPCError)[]
  ) {
    this.middlewares = middlewares || [];
    this.tags = tags || [];
    this.includeInSchema = includeInSchema;
    this.errors = errors || [];
  }

  method(
    rpcMethodName: string,
    middlewares?: Middleware[],
    returnType?: ResultType,
    tags?: string[],
    errors?: (new (...args: any[]) => RPCError)[],
    includeInSchema: boolean = true
  ) {
    if (this.rpcMethods.has(rpcMethodName)) {
      throw new Error(`RPC method ${rpcMethodName} already registered!`);
    }

    const methodAndRouterMiddlewares = [
      ...this.middlewares,
      ...(middlewares || []),
      emptyArgsMiddleware
    ];

    const currentTags = [...this.tags];
    if (tags) {
      currentTags.push(...tags);
    }

    return (handler: Handler): Handler => {
      // Получаем поля аргументов и ответа
      const [argField, responseField] = this.getArgsAndReturnField(handler, returnType);
      const [errorsFields, errorsModels] = this.getErrorFieldsAndModels([
        ...this.errors,
        ...(errors || [])
      ]);

      this.rpcMethods.set(rpcMethodName, new RPCMethod(
        handler,
        methodAndRouterMiddlewares,
        responseField,
        argField,
        rpcMethodName,
        currentTags,
        errorsFields,
        errorsModels,
        includeInSchema && this.includeInSchema
      ));

      return handler;
    };
  }

  async performRPCRequest(
    smartapp: SmartAppInstance,
    rpcRequest: RPCRequest
  ): Promise<RPCResponse> {
    const rpcMethod = this.rpcMethods.get(rpcRequest.method);
    
    if (!rpcMethod) {
      return buildMethodNotFoundErrorResponse(rpcRequest.method);
    }

    // Определяем аргументы с валидацией
    let args: RPCArgsBaseModel;
    if (rpcMethod.argumentsField) {
      try {
        // Создаем экземпляр класса аргументов с валидацией
        const ArgsClass = rpcMethod.argumentsField.type;
        args = new ArgsClass(rpcRequest.params || {});
      } catch (error) {
        // Если валидация не прошла, возвращаем ошибку
        return buildInvalidRPCArgsErrorResponse([{
          msg: "Invalid arguments",
          type: "validation_error",
          loc: []
        }]);
      }
    } else {
      args = new EmptyArgs();
    }

    return await rpcMethod.execute(smartapp, args);
  }

  include(...routers: RPCRouter[]): void {
    for (const router of routers) {
      this.includeRouter(router);
    }
  }

  includeRouter(router: RPCRouter): void {
    const alreadyExistHandlers = Array.from(this.rpcMethods.keys())
      .filter(key => router.rpcMethods.has(key));

    if (alreadyExistHandlers.length > 0) {
      throw new Error(`RPC methods ${alreadyExistHandlers.join(', ')} already registered!`);
    }

    const [errorsFields, errorsModels] = this.getErrorFieldsAndModels(this.errors);

    for (const [rpcMethodName, rpcMethod] of router.rpcMethods) {
      const combinedMiddlewares = [...this.middlewares, ...rpcMethod.middlewares];
      
      this.rpcMethods.set(rpcMethodName, new RPCMethod(
        rpcMethod.handler,
        combinedMiddlewares,
        rpcMethod.responseField,
        rpcMethod.argumentsField,
        rpcMethod.methodName,
        rpcMethod.tags,
        { ...errorsFields, ...rpcMethod.errors },
        { ...errorsModels, ...rpcMethod.errorsModels }
      ));
    }
  }

  private getArgsAndReturnField(
    handler: Handler,
    returnType?: ResultType
  ): [ModelField | undefined, ModelField] {
    // В TypeScript сложно получить информацию о типах во время выполнения
    // Поэтому используем упрощенную логику
    
    // Определяем тип ответа
    let responseType: any;
    
    if (returnType) {
      // Если передан конкретный тип, используем его
      responseType = returnType;
    } else {
      // Fallback на Object для обратной совместимости
      responseType = Object;
    }
    
    const responseField: ModelField = {
      name: `Response_${handler.name || 'Unknown'}`,
      type: responseType,
      required: true
    };

    // Определяем тип аргументов (если есть)
    let argField: ModelField | undefined;
    
    // Проверяем, есть ли у хендлера второй параметр (аргументы)
    if (handler.length >= 2) {
      // В TypeScript сложно получить тип параметра во время выполнения
      // Поэтому используем EmptyArgs как fallback
      argField = {
        name: "Args",
        type: EmptyArgs,
        required: false
      };
    }

    return [argField, responseField];
  }

  private getErrorFieldsAndModels(
    errors: (new (...args: any[]) => RPCError)[]
  ): [Record<string, any>, Record<string, ModelField>] {
    const errorsFields: Record<string, any> = {};
    const errorsModels: Record<string, ModelField> = {};

    for (const errorClass of errors) {
      const errorId = errorClass.name.toUpperCase();
      errorsFields[errorId] = {
        description: `Error: ${errorId}`
      };
      
      errorsModels[errorId] = {
        name: errorClass.name,
        type: errorClass,
        required: false
      };
    }

    return [errorsFields, errorsModels];
  }
} 