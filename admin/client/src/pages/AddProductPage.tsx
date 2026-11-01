import { ProductDetailPage } from "./ProductDetailPage";
import type { CatalogData, Product, ShopCollection } from "../types";

/**
 * Trang thêm sản phẩm mới trong Admin.
 * Sử dụng chung giao diện tinh gọn, tối giản chuẩn SaaS của ProductDetailPage
 * với các trường thông tin xe mô hình, bảng quản lý màu sắc & ảnh hợp nhất.
 */
export function AddProductPage({
  allProducts,
  catalog,
  collections = [],
  onBack,
  onSaved,
}: {
  allProducts: Product[];
  catalog: CatalogData | null;
  collections?: ShopCollection[];
  onBack: () => void;
  onSaved: (msg: string) => void;
}) {
  return (
    <ProductDetailPage
      product={null}
      allProducts={allProducts}
      collections={collections}
      catalog={catalog}
      backLabel="Tất cả sản phẩm"
      onBack={onBack}
      onSaved={onSaved}
      onDeleted={() => {}}
      onDuplicated={() => {}}
    />
  );
}
