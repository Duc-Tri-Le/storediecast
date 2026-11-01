import type { Page, OrderTab, CatalogKind } from "../types";
import type { AdminRoute } from "../router";
import type { Order } from "../types";
import { HomePage } from "../pages/HomePage";
import { OrdersPage } from "../pages/OrdersPage";
import { OrderDetailPage } from "../pages/OrderDetailPage";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { ProductsPage } from "../pages/ProductsPage";
import { InventoryPage } from "../pages/InventoryPage";
import { CollectionsPage } from "../pages/CollectionsPage";
import { BulkUpdatePage } from "../pages/BulkUpdatePage";
import { DiscountsPage } from "../pages/DiscountsPage";
import { CatalogPage } from "../pages/CatalogPage";
import { CustomerSitePage } from "../pages/CustomerSitePage";
import {
  CATALOG_CHILD_PAGES,
  CATALOG_PAGE_KIND,
} from "../types";
import type { useShopData } from "../services/useShopData";

export interface AdminMainRouterProps {
  page: Page;
  route: AdminRoute;
  navigate: (target: AdminRoute) => void;
  data: ReturnType<typeof useShopData>;
  navSeq: number;
  goPage: (key: Page) => void;
  goOrders: (tab?: OrderTab) => void;
  openOrder: (id: number) => void;
  openProductDetail: (id: number) => void;
  productOpenRequest: { id: number; key: number } | null;
  setProductOpenRequest: (v: { id: number; key: number } | null) => void;
  orderTab: OrderTab;
  selectedOrder: Order | null;
}

export function AdminMainRouter({
  page,
  route,
  navigate,
  data,
  navSeq,
  goPage,
  goOrders,
  openOrder,
  openProductDetail,
  productOpenRequest,
  setProductOpenRequest,
  orderTab,
  selectedOrder,
}: AdminMainRouterProps) {
  return (
    <>
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
            onBack={() => navigate({ page: "orders", orderId: null })}
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
            setTab={(t) => navigate({ page: "orders", orderTab: t, orderId: null })}
            onOpenOrder={openOrder}
            routePageNumber={route.pageNumber}
            routeSearch={route.search}
            onNavigateRoute={(params) =>
              navigate({
                page: "orders",
                orderTab: params.tab as OrderTab,
                pageNumber: params.pageNumber,
                search: params.search,
              })
            }
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
          routeProductId={route.productId ?? null}
          routeIsNewProduct={route.isNewProduct ?? false}
          onNavigateProduct={(target) => {
            if (target === "new") {
              navigate({ page: "products", isNewProduct: true });
            } else if (typeof target === "number") {
              navigate({ page: "products", productId: target });
            } else {
              navigate({ page: "products" });
            }
          }}
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
          scaleFilter={route.scale && route.scale !== "all" ? route.scale : null}
          setScaleFilter={(s) =>
            navigate({
              page: "products",
              pageNumber: 1,
              tab: route.tab,
              scale: s || "all",
              brand: route.brand,
              vehicleType: route.vehicleType,
              search: route.search,
              sort: route.sort,
            })
          }
          extraFilter={
            route.brand && route.brand !== "all"
              ? { kind: "brand", value: route.brand }
              : route.vehicleType && route.vehicleType !== "all"
                ? { kind: "vehicleType", value: route.vehicleType }
                : null
          }
          setExtraFilter={(f) => {
            if (f?.kind === "brand") {
              navigate({
                page: "products",
                pageNumber: 1,
                tab: route.tab,
                scale: route.scale,
                brand: f.value,
                vehicleType: "all",
                search: route.search,
                sort: route.sort,
              });
            } else if (f?.kind === "vehicleType") {
              navigate({
                page: "products",
                pageNumber: 1,
                tab: route.tab,
                scale: route.scale,
                brand: "all",
                vehicleType: f.value,
                search: route.search,
                sort: route.sort,
              });
            } else {
              navigate({
                page: "products",
                pageNumber: 1,
                tab: route.tab,
                scale: route.scale,
                brand: "all",
                vehicleType: "all",
                search: route.search,
                sort: route.sort,
              });
            }
          }}
          routePageNumber={route.pageNumber}
          routeTab={route.tab}
          routeSearch={route.search}
          routeSort={route.sort}
          onNavigateRoute={(params) =>
            navigate({
              page: "products",
              pageNumber: params.pageNumber,
              tab: params.tab,
              scale: params.scale,
              brand: params.brand,
              vehicleType: params.vehicleType,
              search: params.search,
              sort: params.sort,
            })
          }
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
          onOpenProduct={openProductDetail}
          routePageNumber={route.pageNumber}
          routeFilter={route.filter}
          routeSearch={route.search}
          routeSortDir={route.sortDir}
          onNavigateRoute={(params) =>
            navigate({
              page: "inventory",
              pageNumber: params.pageNumber,
              filter: params.filter,
              search: params.search,
              sortDir: params.sortDir,
            })
          }
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
          routeIsNewCollection={route.isNewCollection ?? false}
          routeCollectionId={route.collectionId}
          onNavigateCreating={(creating) => {
            if (creating) {
              navigate({ page: "collections", isNewCollection: true });
            } else {
              navigate({ page: "collections" });
            }
          }}
          onNavigateCollection={(id) => {
            if (id != null && id !== "") {
              navigate({ page: "collections", collectionId: id });
            } else {
              navigate({
                page: "collections",
                pageNumber: route.pageNumber,
                tab: route.tab,
                search: route.search,
                sort: route.sort,
              });
            }
          }}
          onViewScale={(s) => {
            navigate({ page: "products", scale: s, pageNumber: 1 });
          }}
          onViewBrand={(b) => {
            navigate({ page: "products", brand: b, pageNumber: 1 });
          }}
          onViewType={(t) => {
            navigate({ page: "products", vehicleType: t, pageNumber: 1 });
          }}
          onOpenProduct={openProductDetail}
          routePageNumber={route.pageNumber}
          routeTab={route.tab}
          routeSearch={route.search}
          routeSort={route.sort}
          onNavigateRoute={(params) =>
            navigate({
              page: "collections",
              pageNumber: params.pageNumber,
              tab: params.tab,
              search: params.search,
              sort: params.sort,
            })
          }
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
          routeIsNew={route.isNewBulkUpdate ?? false}
          onNavigateCreating={(creating) => {
            if (creating) {
              navigate({ page: "bulkUpdate", isNewBulkUpdate: true });
            } else {
              navigate({ page: "bulkUpdate" });
            }
          }}
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
          kind={(CATALOG_PAGE_KIND[page] as CatalogKind) ?? "vehicleTypes"}
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
    </>
  );
}
