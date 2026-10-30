import { useState, useEffect } from "react";
import type { Page, OrderTab } from "./types";
import {
  PRODUCT_CHILD_PAGES,
  CATALOG_CHILD_PAGES,
  CATALOG_PAGE_KIND,
} from "./types";
import { useShopData } from "./services/useShopData";
import { AdminHeader } from "./components/AdminHeader";
import { AdminSidebar } from "./components/AdminSidebar";
import { HomePage } from "./pages/HomePage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { ProductsPage } from "./pages/ProductsPage";
import { InventoryPage } from "./pages/InventoryPage";
import { CollectionsPage } from "./pages/CollectionsPage";
import { BulkUpdatePage } from "./pages/BulkUpdatePage";
import { DiscountsPage } from "./pages/DiscountsPage";
import { CatalogPage } from "./pages/CatalogPage";
import { CustomerSitePage } from "./pages/CustomerSitePage";

function SafeAreaTopScrim(_props?: { backgroundColor?: string }) {
  return null;
}

export function App() {
  const [page, setPage] = useState<Page>("home");
  const [navSeq, setNavSeq] = useState(0);

  const goPage = (key: Page) => {
    setPage(key);
    setNavSeq((n) => n + 1);
  };

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navTo = (key: Page) => {
    goPage(key);
    setMobileNavOpen(false);
  };

  const [orderTab, setOrderTab] = useState<OrderTab>("all");
  const [productScale, setProductScale] = useState<string | null>(null);
  const [productExtraFilter, setProductExtraFilter] = useState<{
    kind: "brand" | "vehicleType";
    value: string;
  } | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const [productOpenRequest, setProductOpenRequest] = useState<{
    id: number;
    key: number;
  } | null>(null);

  const openProductDetail = (id: number) => {
    setProductOpenRequest({ id, key: Date.now() });
    setPage("products");
    setNavSeq((n) => n + 1);
  };

  const [productsOpen, setProductsOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const data = useShopData();

  const inProductGroup = PRODUCT_CHILD_PAGES.includes(page);
  const inCatalogGroup = CATALOG_CHILD_PAGES.includes(page);

  useEffect(() => {
    if (PRODUCT_CHILD_PAGES.includes(page)) setProductsOpen(true);
  }, [page]);

  useEffect(() => {
    if (CATALOG_CHILD_PAGES.includes(page)) setCatalogOpen(true);
  }, [page]);

  const goOrders = (tab: OrderTab) => {
    setOrderTab(tab);
    setSelectedOrderId(null);
    goPage("orders");
    setMobileNavOpen(false);
  };

  const openOrder = (id: number) => {
    setSelectedOrderId(id);
    setPage("orders");
  };

  const selectedOrder =
    selectedOrderId != null
      ? (data.orders.data?.orders ?? []).find((o) => o.id === selectedOrderId) ?? null
      : null;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SafeAreaTopScrim backgroundColor="#ffffff" />
      <div className="flex flex-col md:min-h-screen md:flex-row">
        <AdminHeader
          page={page}
          selectedOrder={selectedOrder}
          newOrdersCount={data.overview.data?.newOrders ?? 0}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onGoOrders={() => goOrders("hold")}
        />

        <AdminSidebar
          page={page}
          navTo={(key) => {
            if (key === "orders") setSelectedOrderId(null);
            navTo(key);
          }}
          mobileNavOpen={mobileNavOpen}
          onCloseMobileNav={() => setMobileNavOpen(false)}
          totalOrdersBadge={data.overview.data?.totalOrders}
          productsOpen={productsOpen}
          onToggleProductsOpen={() => setProductsOpen((o) => !o)}
          onOpenProducts={() => {
            setProductsOpen(true);
            navTo("products");
          }}
          catalogOpen={catalogOpen}
          onToggleCatalogOpen={() => setCatalogOpen((o) => !o)}
          onOpenCatalog={() => {
            setCatalogOpen(true);
            navTo("catalogVehicleTypes");
          }}
          inProductGroup={inProductGroup}
          inCatalogGroup={inCatalogGroup}
        />

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 md:ml-20 lg:ml-60 lg:px-10 lg:py-8">
          <div className="mx-auto max-w-5xl">
            {page === "home" && (
              <HomePage data={data} goOrders={goOrders} setPage={goPage} />
            )}
            {page === "orders" &&
              (selectedOrder ? (
                <OrderDetailPage
                  key={selectedOrder.id}
                  order={selectedOrder}
                  allOrders={data.orders.data?.orders ?? []}
                  products={data.products.data?.products ?? []}
                  onBack={() => setSelectedOrderId(null)}
                />
              ) : (
                <OrdersPage
                  orders={data.orders.data?.orders ?? []}
                  products={data.products.data?.products ?? []}
                  loading={data.orders.isPending}
                  error={
                    data.orders.error
                      ? String(data.orders.error.message ?? data.orders.error)
                      : null
                  }
                  tab={orderTab}
                  setTab={setOrderTab}
                  onOpenOrder={openOrder}
                />
              ))}
            {page === "analytics" && (
              <AnalyticsPage
                key={`analytics-${navSeq}`}
                onOpenProduct={openProductDetail}
                onOpenOrder={openOrder}
              />
            )}
            {page === "products" && (
              <ProductsPage
                key={`products-${navSeq}`}
                openProductId={productOpenRequest?.id ?? null}
                openRequestKey={productOpenRequest?.key ?? 0}
                onConsumeOpenRequest={() => setProductOpenRequest(null)}
                orders={data.orders.data?.orders ?? []}
                products={data.products.data?.products ?? []}
                loading={data.products.isPending}
                error={
                  data.products.error
                    ? String(data.products.error.message ?? data.products.error)
                    : null
                }
                collections={data.collections.data?.collections ?? []}
                catalog={data.catalog.data ?? null}
                scaleFilter={productScale}
                setScaleFilter={setProductScale}
                extraFilter={productExtraFilter}
                setExtraFilter={setProductExtraFilter}
              />
            )}
            {page === "inventory" && (
              <InventoryPage
                key={`inventory-${navSeq}`}
                products={data.products.data?.products ?? []}
                loading={data.products.isPending}
                error={
                  data.products.error
                    ? String(data.products.error.message ?? data.products.error)
                    : null
                }
                collections={data.collections.data?.collections ?? []}
                catalog={data.catalog.data ?? null}
                onGoProducts={() => goPage("products")}
              />
            )}
            {page === "collections" && (
              <CollectionsPage
                key={`collections-${navSeq}`}
                products={data.products.data?.products ?? []}
                loading={data.products.isPending}
                collections={data.collections.data?.collections ?? []}
                catalog={data.catalog.data ?? null}
                collectionsError={
                  data.collections.error
                    ? String(data.collections.error.message ?? data.collections.error)
                    : null
                }
                orders={data.orders.data?.orders ?? []}
                onViewScale={(s) => {
                  setProductScale(s);
                  setProductExtraFilter(null);
                  goPage("products");
                }}
                onViewBrand={(b) => {
                  setProductScale(null);
                  setProductExtraFilter({ kind: "brand", value: b });
                  goPage("products");
                }}
                onViewType={(t) => {
                  setProductScale(null);
                  setProductExtraFilter({ kind: "vehicleType", value: t });
                  goPage("products");
                }}
              />
            )}
            {page === "bulkUpdate" && (
              <BulkUpdatePage
                key={`bulkUpdate-${navSeq}`}
                products={data.products.data?.products ?? []}
                loading={data.products.isPending}
                error={
                  data.products.error
                    ? String(data.products.error.message ?? data.products.error)
                    : null
                }
                catalog={data.catalog.data ?? null}
              />
            )}
            {page === "discounts" && (
              <DiscountsPage
                discounts={data.discounts.data?.discounts ?? []}
                loading={data.discounts.isPending}
                error={
                  data.discounts.error
                    ? String(data.discounts.error.message ?? data.discounts.error)
                    : null
                }
              />
            )}
            {CATALOG_CHILD_PAGES.includes(page) && (
              <CatalogPage
                key={`${page}-${navSeq}`}
                kind={CATALOG_PAGE_KIND[page] ?? "vehicleTypes"}
                catalog={data.catalog.data ?? null}
                loading={data.catalog.isPending}
                error={
                  data.catalog.error
                    ? String(data.catalog.error.message ?? data.catalog.error)
                    : null
                }
              />
            )}
            {page === "customerSite" && <CustomerSitePage />}
          </div>
        </main>
      </div>
    </div>
  );
}
export default App;
