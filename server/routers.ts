import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z as zod } from "zod";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  tasks: router({
    list: publicProcedure.query(async () => {
      // 返回空陣列，因為本地版本不需要雲端任務
      return [];
    }),
    create: publicProcedure.input(zod.object({
      title: zod.string(),
      description: zod.string().optional(),
      category: zod.string(),
      pickupLocation: zod.string(),
      deliveryLocation: zod.string(),
      reward: zod.string(),
      deadline: zod.date(),
    })).mutation(async ({ input }) => {
      // 本地版本不儲存到雲端，只返回成功
      return { success: true };
    }),
    get: publicProcedure.input(zod.object({ id: zod.number() })).query(async ({ input }) => {
      // 返回 null，因為本地版本不需要從雲端查詢
      return null;
    }),
    accept: publicProcedure.input(zod.object({ taskId: zod.number() })).mutation(async ({ input }) => {
      // 本地版本不需要雲端接單
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
