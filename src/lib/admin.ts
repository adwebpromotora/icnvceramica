/**
 * Cliente de sessão do painel admin (cookie httpOnly + server functions).
 * Substitui o antigo cliente Supabase.
 */
import { useEffect, useState } from "react";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

export type Role = "admin" | "editor" | null;

export type SessionState = {
  loading: boolean;
  userId: string | null;
  email: string | null;
  fullName: string | null;
  role: Role;
};

export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getUserFromToken, readSessionToken } = await import("@/server/auth");
  const req = getRequest();
  const token = readSessionToken(req.headers.get("cookie"));
  const user = await getUserFromToken(token);
  if (!user) return { userId: null, email: null, fullName: null, role: null as Role };
  return {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role as Role,
  };
});

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    loading: true,
    userId: null,
    email: null,
    fullName: null,
    role: null,
  });
  useEffect(() => {
    let alive = true;
    getSessionFn()
      .then((s) => {
        if (alive)
          setState({
            loading: false,
            userId: s.userId,
            email: s.email,
            fullName: s.fullName,
            role: s.role,
          });
      })
      .catch(() => {
        if (alive) setState({ loading: false, userId: null, email: null, fullName: null, role: null });
      });
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|$)/g, "")
    .slice(0, 80);
}

const ALLOWED = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
} as const;

/** Upload local para UPLOAD_DIR (nunca URL externa). */
export async function uploadImage(file: File): Promise<string> {
  if (file.size > 5 * 1024 * 1024) throw new Error("A imagem precisa ter até 5 MB.");
  const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  const type = (Object.keys(ALLOWED) as (keyof typeof ALLOWED)[]).find((t) =>
    ALLOWED[t].every((b, i) => head[i] === b),
  );
  if (!type) throw new Error("Use imagens JPG, PNG ou WEBP.");
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form, credentials: "include" });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error((j as { error?: string }).error ?? "Falha no envio da imagem.");
  }
  const data = (await res.json()) as { path: string };
  return data.path;
}

export function useMediaUrl(path?: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }
    if (path.startsWith("http") || path.startsWith("/") || path.startsWith("data:")) {
      setUrl(path);
      return;
    }
    setUrl(`/uploads/${path}`);
  }, [path]);
  return url;
}

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ email: z.string().email(), password: z.string().min(8).max(72) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { login, sessionCookieHeader } = await import("@/server/auth");
    const result = await login(data.email, data.password);
    if (!result.ok) return result;
    // Cookie é setado via header na resposta — TanStack Start propaga Set-Cookie se retornarmos via context.
    // Alternativa: o route de login chama setResponseHeader.
    return { ok: true as const, token: result.token, user: result.user };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const { logout, readSessionToken, clearSessionCookieHeader } = await import("@/server/auth");
  const req = getRequest();
  const token = readSessionToken(req.headers.get("cookie"));
  await logout(token);
  return { ok: true, clearCookie: clearSessionCookieHeader() };
});

export const registerFirstAdminFn = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        name: z.string().min(2).max(80),
        email: z.string().email(),
        password: z.string().min(8).max(72),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { createFirstAdmin } = await import("@/server/auth");
    return createFirstAdmin({
      email: data.email,
      password: data.password,
      fullName: data.name,
    });
  });

export const needsFirstAdminFn = createServerFn({ method: "GET" }).handler(async () => {
  const { countAdmins } = await import("@/server/auth");
  return { needsSetup: (await countAdmins()) === 0 };
});
