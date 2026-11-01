import { useQueryClient } from "@tanstack/react-query";
import type { Page, Product, ScaleFilter, VehicleFilter, Variant, ShopCollection } from "../types";
import type { PriceRangeKey, SortKey } from "../data/filters";
import type { CustomRoute } from "../router";
import type { useCart } from "../hooks/useCart";
import {
  HomePage,
  ProductsPage,
  ProductDetailPage,
  CollectionPage,
  CartPage,
  CheckoutPage,
  OrdersPage,
  FaqPage,
  AboutPage,
} from "../pages";

export function StorefrontRouter({
  page,
  route,
  allProducts,
  allCollections,
  allProductsPending,
  allProductsError,
  collectionsPending,
  refetchProducts,
  cartState,
  featured,
  newest,
  onSale,
  vehicleOptions,
  scaleOptions,
  brandOptions,
  scale,
  setScale,
  vehicle,
  setVehicle,
  brand,
  setBrand,
  priceRange,
  setPriceRange,
  sort,
  setSort,
  search,
  setSearch,
  hasActiveFilters,
  resetFilters,
  goProductsWithScale,
  goProductsWithVehicle,
  goProductsWithBrand,
  openDetail,
  buyNow,
  setPage,
  navigate,
  detailProduct,
  detailVariantId,
}: {
  page: Page;
  route: CustomRoute;
  allProducts: Product[];
  allCollections: ShopCollection[];
  allProductsPending: boolean;
  allProductsError: boolean;
  collectionsPending: boolean;
  refetchProducts: () => void;
  cartState: ReturnType<typeof useCart>;
  featured: Product[];
  newest: Product[];
  onSale: Product[];
  vehicleOptions: string[];
  scaleOptions: string[];
  brandOptions: string[];
  scale: ScaleFilter;
  setScale: (s: ScaleFilter) => void;
  vehicle: VehicleFilter;
  setVehicle: (v: VehicleFilter) => void;
  brand: string;
  setBrand: (b: string) => void;
  priceRange: PriceRangeKey;
  setPriceRange: (pr: PriceRangeKey) => void;
  sort: SortKey;
  setSort: (st: SortKey) => void;
  search: string;
  setSearch: (s: string) => void;
  hasActiveFilters: boolean;
  resetFilters: () => void;
  goProductsWithScale: (s: ScaleFilter) => void;
  goProductsWithVehicle: (v: VehicleFilter) => void;
  goProductsWithBrand: (b: string) => void;
  openDetail: (p: Product, priceHint?: PriceRangeKey) => void;
  buyNow: (p: Product, qty?: number, variant?: Variant | null) => void;
  setPage: (p: Page) => void;
  navigate: (target: any) => void;
  detailProduct: Product | null;
  detailVariantId: number | null;
}) {
  const queryClient = useQueryClient();

  return (
    <>
      {page === "home" && (
        <HomePage
          featured={featured}
          newest={newest}
          onSale={onSale}
          allProducts={allProducts}
          loading={allProductsPending}
          collections={allCollections}
          vehicleOptions={vehicleOptions}
          scaleOptions={scaleOptions}
          onOpenCollection={() => setPage("collection")}
          onOpenProducts={() => goProductsWithScale("all")}
          onPickScale={goProductsWithScale}
          onPickVehicle={goProductsWithVehicle}
          onPickBrand={goProductsWithBrand}
          onDetail={openDetail}
          onAdd={cartState.addToCart}
          onBuyNow={(p) => buyNow(p, 1)}
          onOpenFaq={() => setPage("faq")}
        />
      )}

      {page === "collection" && (
        <CollectionPage
          allProducts={allProducts}
          collections={allCollections}
          selectedSlug={route.collectionId != null ? String(route.collectionId) : route.collectionSlug}
          loading={allProductsPending || collectionsPending}
          routeBrand={route.brand}
          routeVehicle={route.vehicle}
          routeScale={route.scale}
          routeSort={route.sort}
          routeSearch={route.search}
          routePageNumber={route.pageNumber}
          onNavigateRoute={(params) => {
            const colId =
              route.collectionId != null
                ? route.collectionId
                : route.collectionSlug
                  ? Number(route.collectionSlug) || null
                  : null;
            navigate({
              page: "collection",
              collectionId: colId,
              collectionSlug: route.collectionSlug,
              brand: params.brand,
              vehicle: params.vehicle as any,
              scale: params.scale as any,
              sort: params.sort as any,
              search: params.search,
              pageNumber: params.pageNumber ?? 1,
            });
          }}
          onViewScale={goProductsWithScale}
          onOpenProduct={openDetail}
          onNavigateCollection={(idOrSlug) => {
            if (!idOrSlug) {
              navigate({
                page: "collection",
                collectionId: null,
                collectionSlug: null,
                pageNumber: 1,
              });
              return;
            }
            const targetCol = allCollections.find(
              (c) => String(c.id) === idOrSlug || c.slug === idOrSlug,
            );
            const navId = targetCol ? String(targetCol.id) : idOrSlug;
            navigate({
              page: "collection",
              collectionId: Number(navId) || null,
              collectionSlug: navId,
              brand: "all",
              sort: "featured",
              pageNumber: 1,
            });
          }}
        />
      )}

      {page === "products" && (
        <ProductsPage
          allProducts={allProducts}
          loading={allProductsPending}
          error={allProductsError}
          onRetry={refetchProducts}
          scale={scale}
          onScaleChange={(s) => {
            setScale(s);
            navigate({ page: "products", scale: s, vehicle, brand, priceRange, sort, search, pageNumber: 1 });
          }}
          scaleOptions={scaleOptions}
          vehicle={vehicle}
          onVehicleChange={(v) => {
            setVehicle(v);
            navigate({ page: "products", scale, vehicle: v, brand, priceRange, sort, search, pageNumber: 1 });
          }}
          vehicleOptions={vehicleOptions}
          brand={brand}
          onBrandChange={(b) => {
            setBrand(b);
            navigate({ page: "products", scale, vehicle, brand: b, priceRange, sort, search, pageNumber: 1 });
          }}
          brandOptions={brandOptions}
          priceRange={priceRange}
          onPriceRangeChange={(pr) => {
            setPriceRange(pr);
            navigate({ page: "products", scale, vehicle, brand, priceRange: pr, sort, search, pageNumber: 1 });
          }}
          sort={sort}
          onSortChange={(st) => {
            setSort(st);
            navigate({ page: "products", scale, vehicle, brand, priceRange, sort: st, search, pageNumber: 1 });
          }}
          search={search}
          onSearchChange={(q) => {
            setSearch(q);
            navigate({ page: "products", scale, vehicle, brand, priceRange, sort, search: q, pageNumber: 1 });
          }}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={() => {
            resetFilters();
            navigate({ page: "products", scale: "all", vehicle: "all", brand: "all", priceRange: "all", sort: "featured", search: "", pageNumber: 1 });
          }}
          hotProducts={featured.slice(0, 3)}
          saleProducts={onSale.slice(0, 3)}
          onDetail={(p) => openDetail(p, priceRange)}
          onAdd={cartState.addToCart}
          onBuyNow={(p) => buyNow(p, 1)}
          pageNumber={route.pageNumber || 1}
          onPageChange={(p) => {
            navigate({ page: "products", scale, vehicle, brand, priceRange, sort, search, pageNumber: p });
          }}
        />
      )}

      {page === "product" &&
        (detailProduct ? (
          <ProductDetailPage
            key={detailProduct.id}
            product={detailProduct}
            initialVariantId={detailVariantId}
            allProducts={allProducts}
            onGoProducts={() => setPage("products")}
            onViewAllRelated={() => goProductsWithScale(detailProduct.scale as ScaleFilter)}
            onViewAllBestSelling={() => goProductsWithScale("all")}
            onViewAllNewest={() => goProductsWithScale("all")}
            onDetail={openDetail}
            onAdd={cartState.addToCart}
            onAddMany={cartState.addManyToCart}
            onBuyNow={buyNow}
          />
        ) : (
          <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
            <p className="font-semibold">Chưa chọn sản phẩm nào để xem chi tiết.</p>
            <button
              type="button"
              onClick={() => setPage("products")}
              className="mt-4 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white cursor-pointer"
            >
              Tới trang Sản phẩm
            </button>
          </main>
        ))}

      {page === "orders" && (
        <OrdersPage
          orderId={route.orderId ?? null}
          onShop={() => setPage("products")}
          invalidate={() => {
            void queryClient.invalidateQueries({ queryKey: ["orders"] });
            void queryClient.invalidateQueries({ queryKey: ["products"] });
          }}
        />
      )}

      {page === "cart" && (
        <CartPage
          items={cartState.cartItems}
          subtotalBefore={cartState.cartSubtotalBefore}
          bulkDiscount={cartState.cartBulkDiscount}
          subtotal={cartState.cartSubtotal}
          shipping={cartState.shipping}
          totalQty={cartState.cartCount}
          bulkPct={cartState.cartBulkPct}
          couponCode={cartState.cartCouponCode}
          couponDiscount={cartState.cartCouponDiscount}
          subtotalAfterCoupon={cartState.cartSubtotalAfterCoupon}
          onApplyCoupon={cartState.setCartCoupon}
          onRemoveCoupon={() => cartState.setCartCoupon(null)}
          onSetQty={cartState.setQty}
          onContinueShopping={() => setPage("products")}
          onCheckout={() => setPage("checkout")}
          onDetail={openDetail}
        />
      )}

      {page === "checkout" && (
        <CheckoutPage
          items={cartState.cartItems}
          subtotalBefore={cartState.cartSubtotalBefore}
          bulkDiscount={cartState.cartBulkDiscount}
          subtotal={cartState.cartSubtotal}
          shipping={cartState.shipping}
          totalQty={cartState.cartCount}
          bulkPct={cartState.cartBulkPct}
          couponCode={cartState.cartCouponCode}
          couponDiscount={cartState.cartCouponDiscount}
          subtotalAfterCoupon={cartState.cartSubtotalAfterCoupon}
          onApplyCoupon={cartState.setCartCoupon}
          onRemoveCoupon={() => cartState.setCartCoupon(null)}
          onBackToCart={() => setPage("cart")}
          onShop={() => setPage("products")}
          onPlaced={() => {
            cartState.clearCart();
            void queryClient.invalidateQueries({ queryKey: ["products"] });
            void queryClient.invalidateQueries({ queryKey: ["orders"] });
          }}
        />
      )}

      {page === "faq" && (
        <FaqPage
          onOpenOrders={() => setPage("orders")}
          onOpenProducts={() => goProductsWithScale("all")}
        />
      )}

      {page === "about" && (
        <AboutPage
          scaleOptions={scaleOptions}
          collections={allCollections}
          onOpenProducts={() => goProductsWithScale("all")}
          onOpenCollection={() => setPage("collection")}
          onPickScale={goProductsWithScale}
        />
      )}
    </>
  );
}

