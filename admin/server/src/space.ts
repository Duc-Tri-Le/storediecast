import { z, type ZodType } from "zod";

export { z };

export interface ActionContext {
  db?: any;
  invalidateQueries?: () => void;
}

export interface ActionDef<TReq = any, TRes = any> {
  request: ZodType<TReq>;
  response: ZodType<TRes>;
  privileged?: any;
  handler: (ctx: ActionContext, args: TReq) => Promise<TRes>;
}

export function defineAction<
  TReqSchema extends ZodType<any>,
  TResSchema extends ZodType<any>
>(def: {
  request: TReqSchema;
  response: TResSchema;
  privileged?: any;
  handler: (ctx: ActionContext, args: z.infer<TReqSchema>) => Promise<z.infer<TResSchema>>;
}): ActionDef<z.infer<TReqSchema>, z.infer<TResSchema>> {
  return def;
}

export function definePrivilegedContracts<T>(contracts: T): T {
  return contracts;
}

export function definePrivilegedHandlers<
  TContracts extends Record<string, { request: ZodType<any>; response?: ZodType<any> }>
>(
  _contracts: TContracts,
  handlers: {
    [K in keyof TContracts]?: (
      args: z.infer<TContracts[K]["request"]>
    ) => any;
  }
) {
  return handlers;
}

export type ActionsModule = Record<string, ActionDef<any, any>>;
export type Ctx = ActionContext;
