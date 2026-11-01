import { defineAction, z } from "./space";
import * as schema from "./schema";
import { asc } from "drizzle-orm";

const catalogEntryOut = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().optional(),
});

const listCatalogResponse = z.object({
  vehicleTypes: z.array(catalogEntryOut),
  scales: z.array(catalogEntryOut),
  carBrands: z.array(catalogEntryOut),
});

export const listCatalog = defineAction({
  request: z.object({}),
  response: listCatalogResponse,
  async handler(ctx) {
    const db = ctx.db;
    const vehicleTypes = await db
      .select({ id: schema.catalogVehicleTypes.id, name: schema.catalogVehicleTypes.name })
      .from(schema.catalogVehicleTypes)
      .orderBy(asc(schema.catalogVehicleTypes.id));

    const scales = await db
      .select({ id: schema.catalogScales.id, name: schema.catalogScales.name, code: schema.catalogScales.code })
      .from(schema.catalogScales)
      .orderBy(asc(schema.catalogScales.id));

    const carBrands = await db
      .select({ id: schema.catalogCarBrands.id, name: schema.catalogCarBrands.name, code: schema.catalogCarBrands.code })
      .from(schema.catalogCarBrands)
      .orderBy(asc(schema.catalogCarBrands.name));

    return { vehicleTypes, scales, carBrands };
  },
});

