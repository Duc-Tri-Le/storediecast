import { listProductsPaginated } from "./ops/productPaginatedOps";
import { listInventoryPaginated } from "./ops/inventoryPaginatedOps";
import { listOrdersPaginated } from "./ops/orderPaginatedOps";
import { listCollectionsPaginated } from "./ops/collectionPaginatedOps";
import { Database } from "bun:sqlite";
import { existsSync } from "node:fs";
import {
  definePrivilegedContracts,
  definePrivilegedHandlers,
  z,
} from "./space";
import {
  type ProductInput,
  type Row,
  SHOP_DB_PATH,
  fail,
  num,
  str,
} from "./ops/dbCommon";
import { ensureCollectionTables } from "./ops/catalogInit";
import {
  deleteOneProduct,
  deleteProductsBulk,
  deleteVariantsBulk,
  listProducts,
} from "./ops/productOps";
import { upsertProduct } from "./ops/productUpsertOps";
import {
  listOrders,
  updateOrderInfo,
  updateOrderStatus,
} from "./ops/orderOps";
import {
  listDiscounts,
  upsertDiscount,
} from "./ops/discountOps";
import {
  createCollection,
  deleteCollectionsBulk,
  listCollections,
  setCollectionProducts,
  updateCollection,
} from "./ops/collectionOps";
import {
  createCatalogEntry,
  deleteCatalogEntry,
  listCatalog,
  updateCatalogEntry,
} from "./ops/catalogOps";
import {
  applyBulkUpdate,
  listBulkUpdates,
} from "./ops/bulkUpdateOps";
import { analytics } from "./ops/analyticsOps";
import { overview } from "./ops/overviewOps";

export const privileged = definePrivilegedContracts({
  shopDb: {
    request: z.object({
      op: z.enum([
        "overview",
        "listProducts",
        "upsertProduct",
        "deleteProduct",
        "listOrders",
        "updateOrderStatus",
        "updateOrderInfo",
        "listDiscounts",
        "upsertDiscount",
        "deleteDiscount",
        "importProducts",
        "deleteProductsBulk",
        "deleteVariantsBulk",
        "deleteCollectionsBulk",
        "listCollections",
        "createCollection",
        "updateCollection",
        "setCollectionProducts",
        "deleteCollection",
        "listCatalog",
        "createCatalogEntry",
        "updateCatalogEntry",
        "deleteCatalogEntry",
        "listBulkUpdates",
        "applyBulkUpdate",
        "analytics",
        "listProductsPaginated",
        "listInventoryPaginated",
        "listOrdersPaginated",
        "listCollectionsPaginated",
      ]),
      paramsJson: z.string().default("{}"),
    }),
    response: z.object({
      ok: z.boolean(),
      payload: z.string(),
      error: z.string(),
    }),
    timeoutMs: 60000,
  },
});

export function runOp(op: string, params: Row): unknown {
  if (!existsSync(SHOP_DB_PATH)) {
    throw new Error(
      "Không tìm thấy database chung của web bán hàng trên máy này.",
    );
  }
  const db = new Database(SHOP_DB_PATH);
  try {
    db.exec("PRAGMA busy_timeout = 5000");
    switch (op) {
      case "listProductsPaginated":
        return listProductsPaginated(db, params as any);
      case "listInventoryPaginated":
        return listInventoryPaginated(db, params as any);
      case "listOrdersPaginated":
        return listOrdersPaginated(db, params as any);
      case "listCollectionsPaginated":
        return listCollectionsPaginated(db, params as any);

      case "overview":
        return overview(db);
      case "listProducts":
        return { products: listProducts(db) };
      case "upsertProduct": {
        let result: Row = fail("Dữ liệu sản phẩm không hợp lệ.");
        db.transaction(() => {
          result = upsertProduct(db, params as unknown as ProductInput);
        })();
        return result;
      }
      case "importProducts": {
        const items = (params.items as ProductInput[] | undefined) ?? [];
        const results: Row[] = [];
        for (const item of items) {
          let r: Row = fail("Dữ liệu sản phẩm không hợp lệ.");
          db.transaction(() => {
            r = upsertProduct(db, item);
          })();
          results.push(r);
        }
        return { results };
      }
      case "deleteProduct": {
        const productId = num(params.productId);
        let deleted = false;
        db.transaction(() => {
          deleted = deleteOneProduct(db, productId);
        })();
        if (!deleted) return { ok: false, error: "Không tìm thấy sản phẩm." };
        return { ok: true, error: null };
      }
      case "deleteProductsBulk":
        return deleteProductsBulk(db, params.productIds);
      case "deleteVariantsBulk":
        return deleteVariantsBulk(db, params.variantIds);
      case "deleteCollectionsBulk":
        return deleteCollectionsBulk(db, params.collectionIds);
      case "listCatalog":
        return listCatalog(db);
      case "createCatalogEntry": {
        let result: Row = { ok: false, error: "Dữ liệu danh mục không hợp lệ.", entryId: null };
        db.transaction(() => {
          result = createCatalogEntry(db, {
            catalog: str(params.catalog),
            name: str(params.name),
            code: str(params.code),
          });
        })();
        return result;
      }
      case "updateCatalogEntry": {
        let result = { ok: false, error: "Không rõ lỗi." as string | null };
        db.transaction(() => {
          result = updateCatalogEntry(db, {
            catalog: str(params.catalog),
            id: num(params.id),
            name: str(params.name),
            code: str(params.code),
          });
        })();
        return result;
      }
      case "deleteCatalogEntry":
        return deleteCatalogEntry(db, {
          catalog: str(params.catalog),
          id: num(params.id),
        });
      case "listBulkUpdates":
        return listBulkUpdates(db);
      case "applyBulkUpdate": {
        let result: Row = { ok: false, error: "Dữ liệu cập nhật hàng loạt không hợp lệ.", updateId: null, updatedProducts: 0, updatedVariants: 0 };
        db.transaction(() => {
          result = applyBulkUpdate(db, {
            conditions: params.conditions,
            matchMode: str(params.matchMode),
            variantMustMatch: params.variantMustMatch === true,
            actions: params.actions,
          });
        })();
        return result;
      }
      case "listCollections":
        return { collections: listCollections(db) };
      case "createCollection": {
        let result: Row = {
          ok: false,
          error: "Dữ liệu bộ sưu tập không hợp lệ.",
          collectionId: null,
        };
        db.transaction(() => {
          result = createCollection(db, {
            title: str(params.title),
            status: str(params.status),
            kind: str(params.kind),
            conditions: params.conditions,
            productIds: params.productIds,
            description: params.description == null ? undefined : str(params.description),
            matchMode: params.matchMode == null ? undefined : str(params.matchMode),
            visible: params.visible == null ? undefined : params.visible === true,
            imageKey: params.imageKey == null ? undefined : str(params.imageKey),
            thumbnailConfig: params.thumbnailConfig,
            seoTitle: params.seoTitle == null ? undefined : str(params.seoTitle),
            seoDescription:
              params.seoDescription == null ? undefined : str(params.seoDescription),
          });
        })();
        return result;
      }
      case "updateCollection":
        return updateCollection(db, {
          id: num(params.id),
          title: str(params.title),
          status: str(params.status),
          conditions: params.conditions,
          kind: params.kind == null ? undefined : str(params.kind),
          description: params.description == null ? undefined : str(params.description),
          matchMode: params.matchMode == null ? undefined : str(params.matchMode),
          visible: params.visible == null ? undefined : params.visible === true,
          imageKey: params.imageKey == null ? undefined : str(params.imageKey),
          thumbnailConfig: params.thumbnailConfig,
          seoTitle: params.seoTitle == null ? undefined : str(params.seoTitle),
          seoDescription:
            params.seoDescription == null ? undefined : str(params.seoDescription),
        });
      case "setCollectionProducts": {
        let result = { ok: false, error: "Không rõ lỗi." as string | null };
        db.transaction(() => {
          result = setCollectionProducts(db, {
            collectionId: num(params.collectionId),
            productIds: params.productIds,
          });
        })();
        return result;
      }
      case "deleteCollection": {
        const collectionId = num(params.collectionId);
        ensureCollectionTables(db);
        const rows = db
          .query("SELECT id, base_scale FROM collections WHERE id = ?")
          .all(collectionId) as Row[];
        if (rows.length === 0) return { ok: false, error: "Không tìm thấy bộ sưu tập." };
        if (rows[0] && rows[0].base_scale != null && str(rows[0].base_scale) !== "") {
          return {
            ok: false,
            error: "Bộ sưu tập theo tỉ lệ không được phép xóa.",
          };
        }
        db.transaction(() => {
          db.query("DELETE FROM collection_products WHERE collection_id = ?").run(
            collectionId,
          );
          db.query("DELETE FROM collections WHERE id = ?").run(collectionId);
        })();
        return { ok: true, error: null };
      }
      case "analytics":
        return analytics(db, str(params.range));
      case "listOrders":
        return { orders: listOrders(db) };
      case "updateOrderStatus": {
        let result = { ok: false, error: "Không rõ lỗi." as string | null };
        db.transaction(() => {
          result = updateOrderStatus(db, num(params.orderId), str(params.status));
        })();
        return result;
      }
      case "updateOrderInfo":
        return updateOrderInfo(db, {
          orderId: num(params.orderId),
          customerName: str(params.customerName),
          customerPhone: str(params.customerPhone),
          customerAddress: str(params.customerAddress),
          note: str(params.note),
        });
      case "listDiscounts":
        return { discounts: listDiscounts(db) };
      case "upsertDiscount":
        return upsertDiscount(db, {
          id: params.id == null ? null : num(params.id),
          code: str(params.code),
          kind: str(params.kind),
          value: num(params.value),
          isActive: params.isActive === true,
          note: str(params.note),
        });
      case "deleteDiscount":
        db.query("DELETE FROM discount_codes WHERE id = ?").run(num(params.discountId));
        return { ok: true, error: null };
      default:
        throw new Error(`Op không được phép: ${op}`);
    }
  } finally {
    db.close();
  }
}

export const privilegedHandlers = definePrivilegedHandlers(privileged, {
  shopDb(args: z.infer<typeof privileged.shopDb.request>) {
    const params = JSON.parse(args.paramsJson || "{}") as Row;
    let lastError: unknown = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const result = runOp(args.op, params);
        return { ok: true, payload: JSON.stringify(result), error: "" };
      } catch (e) {
        lastError = e;
        const msg = e instanceof Error ? e.message : String(e);
        if (!/locked|busy/i.test(msg) || attempt === 3) break;
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 150 * (attempt + 1));
      }
    }
    return {
      ok: false,
      payload: "",
      error: lastError instanceof Error ? lastError.message : String(lastError),
    };
  },
});
