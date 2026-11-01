import { useState } from "react";
import type { Page, OrderTab } from "./types";
import {
  PRODUCT_CHILD_PAGES,
  CATALOG_CHILD_PAGES,
} from "./types";
import { useAdminRouter } from "./router";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";
import { useShopData } from "./services/useShopData";
import { AdminMainRouter } from "./components/AdminMainRouter";

function SafeAreaTopScrim(_props?: { backgroundColor?: string }) {
  return null;
}

export function App() {
  const { route, navigate } = useAdminRouter();
  const page = route.page;
  const [navSeq, setNavSeq] = useState(0);

  const goPage = (key: Page) => {
    setNavSeq((s) => s + 1);
    navigate({ page: key });
  };

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navTo = (key: Page) => {
    setMobileNavOpen(false);
    goPage(key);
  };

  const orderTab = route.orderTab ?? "all";
  const selectedOrderId = route.orderId ?? null;

  const [productOpenRequest, setProductOpenRequest] = useState<{
    id: number;
    key: number;
  } | null>(null);

  const openProductDetail = (id: number) => {
    setProductOpenRequest({ id, key: Date.now() });
    setNavSeq((s) => s + 1);
    navigate({ page: "products", productId: id });
  };

  const [productsOpen, setProductsOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const data = useShopData();

  const inProductGroup = PRODUCT_CHILD_PAGES.includes(page);
  const inCatalogGroup = CATALOG_CHILD_PAGES.includes(page);

  const goOrders = (tab?: OrderTab) => {
    navigate({
      page: "orders",
      orderTab: tab ?? "all",
      orderId: null,
    });
  };

  const openOrder = (id: number) => {
    navigate({ page: "orders", orderId: id });
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
            if (key === "orders") {
              navigate({ page: "orders", orderId: null });
              setMobileNavOpen(false);
            } else {
              navTo(key);
            }
          }}
          mobileNavOpen={mobileNavOpen}
          onCloseMobileNav={() => setMobileNavOpen(false)}
          totalOrdersBadge={data.overview.data?.totalOrders}
          productsOpen={productsOpen}
          onToggleProductsOpen={() => setProductsOpen((o: boolean) => !o)}
          onOpenProducts={() => {
            setProductsOpen(true);
            navTo("products");
          }}
          catalogOpen={catalogOpen}
          onToggleCatalogOpen={() => setCatalogOpen((o: boolean) => !o)}
          onOpenCatalog={() => {
            setCatalogOpen(true);
            navTo("catalogVehicleTypes");
          }}
          inProductGroup={inProductGroup}
          inCatalogGroup={inCatalogGroup}
        />

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 md:ml-20 lg:ml-60 lg:px-10 lg:py-8">
          <div className="mx-auto max-w-5xl">
            <AdminMainRouter
              page={page}
              route={route}
              navigate={(r) => navigate(r)}
              data={data}
              navSeq={navSeq}
              goPage={goPage}
              goOrders={goOrders}
              openOrder={openOrder}
              openProductDetail={openProductDetail}
              productOpenRequest={productOpenRequest}
              setProductOpenRequest={setProductOpenRequest}
              orderTab={orderTab}
              selectedOrder={selectedOrder}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
