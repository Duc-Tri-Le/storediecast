import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Product, ProductInput } from "../types";
import type { DraftVariant, ProductFormShape } from "../utils/productFormTypes";
import {
  buildDuplicateProductInput,
  validateProductDraft,
} from "../utils/productValidation";

export interface UseProductDetailMutationsOptions {
  product: Product | null;
  name: string;
  brand: string;
  scale: string;
  modelMaker: string;
  vehicleType: string;
  isFeatured: boolean;
  description: string;
  tags: string[];
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  variants: DraftVariant[];
  currentShape: () => ProductFormShape;
  setSavedSnapshot: (s: string) => void;
  setNotice: (msg: string | null) => void;
  setFormError: (err: string | null) => void;
  onSaved: (msg: string) => void;
  onDeleted: (msg: string) => void;
  onDuplicated: (msg: string) => void;
}

export function useProductDetailMutations({
  product,
  name,
  brand,
  scale,
  modelMaker,
  vehicleType,
  isFeatured,
  description,
  tags,
  slug,
  seoTitle,
  seoDescription,
  variants,
  currentShape,
  setSavedSnapshot,
  setNotice,
  setFormError,
  onSaved,
  onDeleted,
  onDuplicated,
}: UseProductDetailMutationsOptions) {
  const queryClient = useQueryClient();

  const saveMut = useMutation({
    mutationFn: ({ input }: { input: ProductInput; _snapshot: string }) =>
      api.adminUpsertProduct(input),
    onSuccess: (res, vars) => {
      if (!res.ok) {
        setFormError(res.error ?? "Không lưu được sản phẩm.");
        return;
      }
      setSavedSnapshot(vars._snapshot);
      setFormError(null);
      setNotice("Đã lưu sản phẩm vào database chung — web bán hàng cập nhật ngay.");
      queryClient.invalidateQueries();
      onSaved(
        product
          ? `Đã lưu sản phẩm “${name.trim()}”.`
          : `Đã thêm sản phẩm “${name.trim()}”.`,
      );
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.adminDeleteProduct({ productId: id }),
    onSuccess: (res) => {
      if (!res.ok) {
        setFormError(res.error ?? "Không xóa được sản phẩm.");
        return;
      }
      queryClient.invalidateQueries();
      onDeleted(`Đã xóa “${product?.name}” khỏi database chung.`);
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  const duplicateMut = useMutation({
    mutationFn: () => {
      if (!product) throw new Error("Chưa có sản phẩm để nhân bản.");
      return api.adminUpsertProduct(
        buildDuplicateProductInput({
          name,
          brand,
          scale,
          modelMaker,
          vehicleType,
          description,
          tags,
          variants,
        }),
      );
    },
    onSuccess: (res) => {
      if (!res.ok) {
        setFormError(res.error ?? "Không nhân bản được sản phẩm.");
        return;
      }
      queryClient.invalidateQueries();
      onDuplicated(`Đã tạo bản sao “Bản sao của ${name.trim()}” trong database chung.`);
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  const submit = () => {
    setFormError(null);
    setNotice(null);
    const result = validateProductDraft({
      name,
      brand,
      scale,
      vehicleType,
      description,
      tags,
      isFeatured,
      modelMaker,
      slug,
      seoTitle,
      seoDescription,
      variants,
      productId: product?.id ?? null,
    });
    if (!result.ok) {
      return setFormError(result.error);
    }

    saveMut.mutate({
      input: result.input,
      _snapshot: JSON.stringify(currentShape()),
    });
  };

  return {
    saveMut,
    deleteMut,
    duplicateMut,
    submit,
  };
}
