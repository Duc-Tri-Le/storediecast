import type { Actions } from "../../server/src/actions";

export type ActionClient<T extends Record<string, any>> = {
  [K in keyof T]: (
    args: T[K]["handler"] extends (ctx: any, args: infer A) => any ? A : never
  ) => Promise<T[K]["handler"] extends (ctx: any, args: any) => Promise<infer R> ? R : never>;
};

export function createActionClient<T extends Record<string, any>>(): ActionClient<T> {
  return new Proxy({} as any, {
    get(_target, prop: string) {
      return async (args: any) => {
        const res = await fetch("/actions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: prop, args: args || {} }),
        });
        const data = await res.json();
        if (!res.ok || data.ok === false) {
          throw new Error(data.error || "Thao tác thất bại.");
        }
        return data.result !== undefined ? data.result : data;
      };
    },
  });
}

export const api = createActionClient<typeof Actions>();

export type ApiRequest<T, K extends keyof T> = T[K] extends (args: infer A) => any ? A : never;
export type ApiResponse<T, K extends keyof T> = T[K] extends (...args: any[]) => Promise<infer R> ? R : never;
