/**
 * Server functions públicas (sem auth) — leitura do site.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getSettings,
  listPublishedEvents,
  listPublishedSermons,
  getEventBySlug,
  getSermonBySlug,
  listMenuPages,
  getPageBySlug,
} from "@/server/site";

export const getPublicSettingsFn = createServerFn({ method: "GET" }).handler(async () => {
  return getSettings();
});

export const listPublicEventsFn = createServerFn({ method: "GET" }).handler(async () => {
  return listPublishedEvents(50);
});

export const listPublicSermonsFn = createServerFn({ method: "GET" }).handler(async () => {
  return listPublishedSermons(50);
});

export const getPublicEventFn = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => getEventBySlug(data.slug));

export const getPublicSermonFn = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => getSermonBySlug(data.slug));

export const listPublicMenuPagesFn = createServerFn({ method: "GET" }).handler(async () => {
  return listMenuPages();
});

export const getPublicPageFn = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => getPageBySlug(data.slug));


export const getMaintenanceFn = createServerFn({ method: "GET" }).handler(async () => {
  const s = await getSettings();
  const on = s.maintenance_mode === 1 || s.maintenance_mode === true;
  return {
    active: Boolean(on),
    message:
      (s.maintenance_message && String(s.maintenance_message).trim()) ||
      "Estamos em manutenção. Em breve voltamos com novidades. Obrigado pela compreensão!",
  };
});

export const getRecaptchaPublicFn = createServerFn({ method: "GET" }).handler(async () => {
  const siteKey = process.env.RECAPTCHA_SITE_KEY || process.env.RECAPTCHA_LOGIN_SITE_KEY || "";
  return { siteKey: siteKey.trim() };
});
