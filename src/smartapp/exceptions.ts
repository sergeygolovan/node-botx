import { RPCError } from "./models/errors";

export class BaseRPCErrorExc extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "BaseRPCErrorExc";
  }
}

export class RPCErrorExc extends BaseRPCErrorExc {
  public errors: RPCError[];

  constructor(errorOrErrors: RPCError | RPCError[]) {
    super("RPC Error");
    this.name = "RPCErrorExc";
    
    if (Array.isArray(errorOrErrors)) {
      this.errors = errorOrErrors;
    } else {
      this.errors = [errorOrErrors];
    }
  }
} 