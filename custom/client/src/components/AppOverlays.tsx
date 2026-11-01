import { useQueryClient } from "@tanstack/react-query";
import type { Product, Page } from "../types";
import type { PolicyKey } from "../data/policies";
import {
  PolicyDialog,
  ContactDialog,
  BuyNowDialog,
} from "./index";

export function AppOverlays({
  toast,
  policy,
  setPolicy,
  contactOpen,
  setContactOpen,
  setPage,
  buyNowTarget,
  setBuyNowTarget,
  allProducts,
}: {
  toast: string | null;
  policy: PolicyKey | null;
  setPolicy: (p: PolicyKey | null) => void;
  contactOpen: boolean;
  setContactOpen: (v: boolean) => void;
  setPage: (p: Page) => void;
  buyNowTarget: {
    product: Product;
    qty: number;
    variantId: number | null;
  } | null;
  setBuyNowTarget: (t: null) => void;
  allProducts: Product[];
}) {
  const queryClient = useQueryClient();

  return (
    <>
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
    </>
  );
}

