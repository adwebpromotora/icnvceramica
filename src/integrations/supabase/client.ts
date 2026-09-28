/**
 * Compatibilidade temporária: o backend foi migrado para MySQL local.
 * Este stub evita que imports antigos quebrem o build.
 * Substitua gradualmente por @/lib/admin e @/server/*.
 */
console.warn("[icnv] Integração Supabase removida. Use auth/MySQL local.");

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: "Use loginFn de @/lib/admin" } }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    resetPasswordForEmail: async () => ({ data: {}, error: { message: "Em migração" } }),
    exchangeCodeForSession: async () => ({ data: {}, error: null }),
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), then: (r: any) => r({ data: [], error: null }) }), order: () => ({ limit: async () => ({ data: [], error: null }) }) }),
    insert: async () => ({ data: null, error: null }),
    update: () => ({ eq: async () => ({ data: null, error: null }) }),
    delete: () => ({ eq: async () => ({ data: null, error: null }) }),
  }),
  storage: {
    from: () => ({
      upload: async () => ({ error: { message: "Use uploadImage de @/lib/admin" } }),
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
    }),
  },
  rpc: async () => ({ data: null, error: null }),
} as any;
