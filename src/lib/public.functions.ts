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
