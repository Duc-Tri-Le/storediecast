import { defineAction, z } from "./space";
import { asc, desc, eq } from "drizzle-orm";
import * as schema from "./schema";
import { collectionOut } from "./catalog";

export const listCollections = defineAction({
  request: z.object({}),
  response: z.object({
    collections: z.array(collectionOut),
  }),
  async handler(ctx) {
    const db = ctx.db;
    const rows = await db
      .select()
      .from(schema.collections)
      .where(eq(schema.collections.visibleOnList, 1))
      .orderBy(desc(schema.collections.isScale), asc(schema.collections.id));

    const collections = rows
      .filter((r: any) => r.status === "published" || !r.status)
      .map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description || "",
        slug: r.slug || "",
        imageKey: r.imageKey || "",
        seoTitle: r.seoTitle || r.seo_title || "",
        seoDescription: r.seoDescription || r.seo_description || "",
        isScale: r.isScale === 1 || r.is_scale === 1,
      }));

    return { collections };
  },
});

