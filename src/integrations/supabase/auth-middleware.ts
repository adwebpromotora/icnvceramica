import { createMiddleware } from "@tanstack/react-start";
/** Middleware legado — auth agora via cookie icnv_session. */
export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  return next({ context: { userId: null, supabase: null } });
});
