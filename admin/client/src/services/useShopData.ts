import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export function useShopData() {
  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => api.adminOverview({}),
  });
  const products = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => api.adminListProducts({}),
  });
  const orders = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => api.adminListOrders({}),
  });
  const discounts = useQuery({
    queryKey: ["admin-discounts"],
    queryFn: () => api.adminListDiscounts({}),
  });
  const collections = useQuery({
    queryKey: ["admin-collections"],
    queryFn: () => api.adminListCollections({}),
  });
  const catalog = useQuery({
    queryKey: ["admin-catalog"],
    queryFn: () => api.adminListCatalog({}),
  });
  return { overview, products, orders, discounts, collections, catalog };
}

