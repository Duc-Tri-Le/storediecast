import { useEffect, useLayoutEffect, useState } from "react";
import { useCustomRouter } from "./router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { defaultVariant, variantPrice } from "./services/pricing";
import { useCart } from "./hooks/useCart";
import { scrollToPageTop } from "./services/scroll";
import type { Page, Product, ScaleFilter, VehicleFilter, Variant } from "./types";
import { PRICE_RANGES, type PriceRangeKey, type SortKey } from "./data/filters";
import type { PolicyKey } from "./data/policies";
import { Header, Footer } from "./components";
import { StorefrontRouter } from "./components/StorefrontRouter";
import { useStorefrontCatalog } from "./hooks/useStorefrontCatalog";
import { AppOverlays } from "./components/AppOverlays";

export function App() {
  const queryClient = useQueryClient();
  const { route, navigate } = useCustomRouter();
  const page = route.page;
  const setPage = (p: Page) => navigate(p);
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

  // Khi chuyển trang trên web khách, tự động làm mới dữ liệu từ server
  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: ["products"] });
    void queryClient.invalidateQueries({ queryKey: ["orders"] });
    void queryClient.invalidateQueries({ queryKey: ["collections"] });
    void queryClient.invalidateQueries({ queryKey: ["catalog"] });
  }, [page, queryClient]);

  const allProducts = allProductsQ.data?.products ?? [];

  const collectionsQ = useQuery({
    queryKey: ["collections"],
    queryFn: () => api.listCollections({}),
  });
  const allCollections = collectionsQ.data?.collections ?? [];

  const catalogQ = useQuery({
    queryKey: ["catalog"],
    queryFn: () => api.listCatalog({}),
  });
  const catalogData = catalogQ.data;

  const cartState = useCart(allProducts, (msg) => setToast(msg));

  // Đồng bộ bộ lọc và trang từ đường dẫn URL khi tải trang hoặc điều hướng
  useEffect(() => {
    if (route.page === "products") {
      if (route.scale && route.scale !== scale) setScale(route.scale);
      if (route.vehicle && route.vehicle !== vehicle) setVehicle(route.vehicle);
      if (route.brand && route.brand !== brand) setBrand(route.brand);
      if (route.search !== undefined && route.search !== search) setSearch(route.search);
      if (route.sort && route.sort !== sort) setSort(route.sort);
      if (route.priceRange && route.priceRange !== priceRange) setPriceRange(route.priceRange);
    }
  }, [route.page, route.scale, route.vehicle, route.brand, route.search, route.sort, route.priceRange]);

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

  function goProductsWithScale(s: ScaleFilter) {
    setScale(s);
    setVehicle("all");
    setBrand("all");
    setPriceRange("all");
    setSort("featured");
    setSearch("");
    navigate({ page: "products", scale: s, vehicle: "all", brand: "all", priceRange: "all", sort: "featured", search: "", pageNumber: 1 });
  }

  function goProductsWithVehicle(v: VehicleFilter) {
    setScale("all");
    setVehicle(v);
    setBrand("all");
    setPriceRange("all");
    setSort("featured");
    setSearch("");
    navigate({ page: "products", scale: "all", vehicle: v, brand: "all", priceRange: "all", sort: "featured", search: "", pageNumber: 1 });
  }

  function goProductsWithBrand(b: string) {
    setScale("all");
    setVehicle("all");
    setBrand(b);
    setPriceRange("all");
    setSort("featured");
    setSearch("");
    navigate({ page: "products", scale: "all", vehicle: "all", brand: b, priceRange: "all", sort: "featured", search: "", pageNumber: 1 });
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
    navigate({ page: "product", productId: p.id });
  }

  useEffect(() => {
    if (route.page === "product") {
      const target = allProducts.find((p) =>
        route.productId
          ? p.id === route.productId
          : route.productSlug
            ? String(p.id) === route.productSlug || p.slug === route.productSlug
            : false,
      );
      if (target) {
        setDetail(target);
        const expectedPath = `/products/${target.id}`;
        if (typeof window !== "undefined" && window.location.pathname !== expectedPath) {
          window.history.replaceState(null, "", expectedPath);
        }
      }
    }
  }, [route.page, route.productId, route.productSlug, allProducts]);

  const detailProduct: Product | null = detail
    ? (allProducts.find((p) => p.id === detail.id) ?? detail)
    : (route.page === "product"
      ? (allProducts.find((p) =>
        route.productSlug
          ? p.slug === route.productSlug || String(p.id) === route.productSlug
          : p.id === route.productId,
      ) ?? null)
      : null);

  const {
    vehicleOptions,
    scaleOptions,
    brandOptions,
    featured,
    newest,
    onSale,
  } = useStorefrontCatalog({
    catalogData,
    allProducts,
    allCollections,
    route,
    page,
    detailProduct,
  });

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
        collections={allCollections}
        onNavigateCollection={(slug) => navigate(slug ? `/collections/${slug}` : "/collections")}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          if (page !== "products") setPage("products");
        }}
        onSearchSubmit={() => setPage("products")}
        cartCount={cartState.cartCount}
      />

      <StorefrontRouter
        page={page}
        route={route}
        allProducts={allProducts}
        allCollections={allCollections}
        allProductsPending={allProductsQ.isPending}
        allProductsError={allProductsQ.error != null}
        collectionsPending={collectionsQ.isPending}
        refetchProducts={() => void allProductsQ.refetch()}
        cartState={cartState}
        featured={featured}
        newest={newest}
        onSale={onSale}
        vehicleOptions={vehicleOptions}
        scaleOptions={scaleOptions}
        brandOptions={brandOptions}
        scale={scale}
        setScale={setScale}
        vehicle={vehicle}
        setVehicle={setVehicle}
        brand={brand}
        setBrand={setBrand}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        sort={sort}
        setSort={setSort}
        search={search}
        setSearch={setSearch}
        hasActiveFilters={hasActiveFilters}
        resetFilters={resetFilters}
        goProductsWithScale={goProductsWithScale}
        goProductsWithVehicle={goProductsWithVehicle}
        goProductsWithBrand={goProductsWithBrand}
        openDetail={openDetail}
        buyNow={buyNow}
        setPage={setPage}
        navigate={navigate}
        detailProduct={detailProduct}
        detailVariantId={detailVariantId}
      />

      <Footer
        onNavigate={setPage}
        onOpenContact={() => setContactOpen(true)}
        onOpenPolicy={(k) => setPolicy(k)}
        onScrollTop={() => scrollToPageTop("smooth")}
      />

      <AppOverlays
        toast={toast}
        policy={policy}
        setPolicy={setPolicy}
        contactOpen={contactOpen}
        setContactOpen={setContactOpen}
        setPage={setPage}
        buyNowTarget={buyNowTarget}
        setBuyNowTarget={setBuyNowTarget}
        allProducts={allProducts}
      />
    </div>
  );
}
