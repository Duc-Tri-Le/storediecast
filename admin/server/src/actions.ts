// Actions for Web Quản Trị Bán Xe Mô Hình.
//
// Web quản trị này KHÔNG dùng database riêng: mọi action đều chuyển
// qua handler đặc quyền `shopDb` (server/src/privileged.ts) để đọc/ghi
// thẳng decast.db — đúng một database chung cho hai web. Tên action giữ
// nguyên bộ admin* mà khu quản trị trong web khách đã dùng.

import type { ActionsModule } from "./space";
import { productActions } from "./actions/productActions";
import { orderActions } from "./actions/orderActions";
import { collectionActions } from "./actions/collectionActions";
import { catalogActions } from "./actions/catalogActions";
import { analyticsAndBulkActions } from "./actions/analyticsAndBulkActions";

export { adminVariantOut, adminProductOut, adminOrderItemOut, adminOrderOut, discountOut, okErrorOut, productInput } from "./schemas/productSchemas";
export { collectionOut, catalogOut, bulkUpdateOut, bulkUpdatesOut, bulkApplyOut } from "./schemas/catalogSchemas";
export { overviewOut, analyticsOut } from "./schemas/analyticsSchemas";

export const Actions = {
  ...analyticsAndBulkActions,
  ...productActions,
  ...orderActions,
  ...collectionActions,
  ...catalogActions,
} satisfies ActionsModule;
