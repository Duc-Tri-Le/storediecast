import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { anyVariantOnSale, defaultVariant, variantPrice } from "./services/pricing";
import { useCart } from "./services/useCart";
import { scrollToPageTop } from "./services/scroll";
import type { Page, Product, ScaleFilter, VehicleFilter, Variant } from "./types";
import { PRICE_RANGES, type PriceRangeKey, type SortKey } from "./data/filters";
import type { PolicyKey } from "./data/policies";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/HomePage";
import { CollectionPage } from "./components/CollectionPage";
import { ProductsPage } from "./components/ProductsPage";
import { ProductDetailPage } from "./components/ProductDetailPage";
import { CartPage } from "./components/CartPage";
import { CheckoutPage } from "./components/CheckoutPage";
import { OrdersView } from "./components/OrdersView";
import { FaqPage, AboutPage } from "./components/InfoPages";
import { PolicyDialog } from "./components/PolicyDialog";
import { ContactDialog } from "./components/ContactDialog";
import { BuyNowDialog } from "./components/BuyNowDialog";

export function App() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<Page>("home");
  const [scale, setScale] = useState<ScaleFilter>("all");
  const [vehicle, setVehicle] = useState<VehicleFilter>("all");
  const [brand, setBrand] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [priceRange, setPriceRange] = useState<PriceRangeKey>("all");
  const [detail, setDetail] = useState<Product | null>(null);
  const [detailVariantId, setDetailVariantId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [policy, setPolicy] = useState<PolicyKey | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  useLayoutEffect(() => {
    scrollToPageTop();
  }, [page, detail?.id]);

  const allProductsQ = useQuery({
    queryKey: ["products", "all", ""],
    queryFn: () =>
      api.listProducts({
        scale: "all",
        search: "",
        vehicleType: "all",
        brand: "all",
        priceMin: null,
        priceMax: null,
        sort: "featured",
        page: 1,
        pageSize: 200,
      }),
  });

  const allProducts = allProductsQ.data?.products ?? [];

  const cartState = useCart(allProducts, (msg) => setToast(msg));

  const brandOptions = useMemo(() => {
    const seen: string[] = [];
    for (const p of allProducts) {
      if (!seen.includes(p.brand)) seen.push(p.brand);
    }
    return seen;
  }, [allProducts]);

  const hasActiveFilters =
    scale !== "all" ||
    vehicle !== "all" ||
    brand !== "all" ||
    priceRange !== "all" ||
    search.trim() !== "" ||
    sort !== "featured";

  function resetFilters() {
    setSearch("");
    setScale("all");
    setVehicle("all");
    setBrand("all");
    setPriceRange("all");
    setSort("featured");
  }

  const featured = useMemo(
    () => allProducts.filter((p) => p.isFeatured),
    [allProducts],
  );
  const newest = useMemo(
    () => [...allProducts].sort((a, b) => b.id - a.id).slice(0, 8),
    [allProducts],
  );
  const onSale = useMemo(() => allProducts.filter((p) => anyVariantOnSale(p)), [allProducts]);

  function goProductsWithScale(s: ScaleFilter) {
    setScale(s);
    setVehicle("all");
    setBrand("all");
    setPriceRange("all");
    setSort("featured");
    setSearch("");
    setPage("products");
  }

  function goProductsWithVehicle(v: VehicleFilter) {
    setScale("all");
    setVehicle(v);
    setBrand("all");
    setPriceRange("all");
    setSort("featured");
    setSearch("");
    setPage("products");
  }

  function goProductsWithBrand(b: string) {
    setScale("all");
    setVehicle("all");
    setBrand(b);
    setPriceRange("all");
    setSort("featured");
    setSearch("");
    setPage("products");
  }

  function openDetail(p: Product, priceHint?: PriceRangeKey) {
    let hintVariantId: number | null = null;
    if (priceHint && priceHint !== "all") {
      const range = PRICE_RANGES.find((r) => r.key === priceHint);
      if (range) {
        hintVariantId =
          p.variants.find((v) => range.test(variantPrice(v)))?.id ?? null;
      }
    }
    setDetailVariantId(hintVariantId);
    setDetail(p);
    setPage("product");
  }

  const detailProduct: Product | null = detail
    ? (allProducts.find((p) => p.id === detail.id) ?? detail)
    : null;

  const [buyNowTarget, setBuyNowTarget] = useState<{
    product: Product;
    qty: number;
    variantId: number | null;
  } | null>(null);

  function buyNow(p: Product, qty = 1, variant?: Variant | null) {
    const v = variant ?? defaultVariant(p);
    const stock = v ? v.stock : p.stock;
    if (stock <= 0) return;
    setBuyNowTarget({
      product: p,
      qty: Math.max(1, Math.min(stock, qty)),
      variantId: v?.id ?? null,
    });
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Header
        page={page}
        onNavigate={setPage}
        onPickScale={goProductsWithScale}
        onPickBrand={goProductsWithBrand}
        brandOptions={brandOptions}
        allProducts={allProducts}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          if (page !== "products") setPage("products");
        }}
        onSearchSubmit={() => setPage("products")}
        cartCount={cartState.cartCount}
      />

      {page === "home" && (
        <HomePage
          featured={featured}
          newest={newest}
          onSale={onSale}
          allProducts={allProducts}
          loading={allProductsQ.isPending}
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
          loading={allProductsQ.isPending}
          onViewScale={goProductsWithScale}
        />
      )}

      {page === "products" && (
        <ProductsPage
          allProducts={allProducts}
          loading={allProductsQ.isPending}
          error={allProductsQ.error != null}
          onRetry={() => void allProductsQ.refetch()}
          scale={scale}
          onScaleChange={setScale}
          vehicle={vehicle}
          onVehicleChange={setVehicle}
          brand={brand}
          onBrandChange={setBrand}
          brandOptions={brandOptions}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          sort={sort}
          onSortChange={setSort}
          search={search}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
          hotProducts={featured.slice(0, 3)}
          saleProducts={onSale.slice(0, 3)}
          onDetail={(p) => openDetail(p, priceRange)}
          onAdd={cartState.addToCart}
          onBuyNow={(p) => buyNow(p, 1)}
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
              className="mt-4 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white"
            >
              Tới trang Sản phẩm
            </button>
          </main>
        ))}

      {page === "orders" && (
        <OrdersView
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
          onOpenProducts={() => goProductsWithScale("all")}
          onOpenCollection={() => setPage("collection")}
          onPickScale={goProductsWithScale}
        />
      )}

      <Footer
        onNavigate={setPage}
        onOpenContact={() => setContactOpen(true)}
        onOpenPolicy={(k) => setPolicy(k)}
        onScrollTop={() => scrollToPageTop("smooth")}
      />

      {toast && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-20 z-50 mx-auto w-fit max-w-[92vw] rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-lg"
        >
          {toast}
        </div>
      )}

      {policy && (
        <PolicyDialog policyKey={policy} onClose={() => setPolicy(null)} />
      )}

      {contactOpen && (
        <ContactDialog
          onClose={() => setContactOpen(false)}
          onOpenFaq={() => {
            setContactOpen(false);
            setPage("faq");
          }}
          onOpenOrders={() => {
            setContactOpen(false);
            setPage("orders");
          }}
        />
      )}

      {buyNowTarget && (
        <BuyNowDialog
          key={`${buyNowTarget.product.id}:${buyNowTarget.variantId ?? "default"}:${buyNowTarget.qty}`}
          product={
            allProducts.find((p) => p.id === buyNowTarget.product.id) ?? buyNowTarget.product
          }
          initialVariantId={buyNowTarget.variantId}
          initialQty={buyNowTarget.qty}
          onClose={() => setBuyNowTarget(null)}
          onPlaced={() => {
            void queryClient.invalidateQueries({ queryKey: ["products"] });
            void queryClient.invalidateQueries({ queryKey: ["orders"] });
          }}
        />
      )}
    </div>
  );
}
