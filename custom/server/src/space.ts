import { z, type ZodType } from "zod";

export { z };

export interface ActionContext {
  db: any;
}

export interface ActionDef<TReq = any, TRes = any> {
  request: ZodType<TReq>;
  response: ZodType<TRes>;
  handler: (ctx: ActionContext, args: TReq) => Promise<TRes>;
}

export function defineAction<
  TReqSchema extends ZodType<any>,
  TResSchema extends ZodType<any>
>(def: {
  request: TReqSchema;
  response: TResSchema;
  handler: (ctx: ActionContext, args: z.infer<TReqSchema>) => Promise<z.infer<TResSchema>>;
}): ActionDef<z.infer<TReqSchema>, z.infer<TResSchema>> {
  return def;
}

export type ActionsModule = Record<string, ActionDef<any, any>>;
