import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { ShopCollection } from "../types";
import type {
  CollectionCondition,
  CollectionKind,
  CollectionStatus,
  MatchMode,
} from "../utils/collectionRules";
import {
  type CollectionFormShape,
  shapeOfCollectionForm,
} from "../utils/collectionFormHelpers";

export interface UseCollectionDetailMutationsOptions {
  collection: ShopCollection;
  title: string;
  description: string;
  status: CollectionStatus;
  setStatus: (s: CollectionStatus) => void;
  mode: CollectionKind;
  validConditions: CollectionCondition[];
  matchMode: MatchMode;
  visibleOnList: boolean;
  imageKey: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  manualIds: number[];
  imageError: string | null;
  currentCollectionShape: () => CollectionFormShape;
  setSavedSnapshot: React.Dispatch<React.SetStateAction<string>>;
  setNotice: (msg: string | null) => void;
  setFormError: (err: string | null) => void;
  onDeleted: (msg: string) => void;
}

export function useCollectionDetailMutations({
  collection,
  title,
  description,
  status,
  setStatus,
  mode,
  validConditions,
  matchMode,
  visibleOnList,
  imageKey,
  seoTitle,
  seoDescription,
  slug,
  manualIds,
  imageError,
  currentCollectionShape,
  setSavedSnapshot,
  setNotice,
  setFormError,
  onDeleted,
}: UseCollectionDetailMutationsOptions) {
  const queryClient = useQueryClient();

  const [duplicatePrompt, setDuplicatePrompt] = useState<{
    open: boolean;
    message: string;
    duplicateTitle?: string;
    scale?: string;
  } | null>(null);

  const toggleStatusMut = useMutation({
    mutationFn: (next: CollectionStatus) =>
      api.adminUpdateCollection({ id: collection.id, title: collection.title, status: next }),
    onSuccess: (res, next) => {
      if (!res.ok) {
        setFormError(res.error ?? "Không đổi được trạng thái bộ sưu tập.");
        return;
      }
      setStatus(next);
      setSavedSnapshot((prev) => {
        try {
          const parsed = JSON.parse(prev) as CollectionFormShape;
          return shapeOfCollectionForm({ ...parsed, status: next });
        } catch {
          return prev;
        }
      });
      setFormError(null);
      setNotice(
        next === "published"
          ? `Đã bật bộ sưu tập “${collection.title}” — trạng thái Đang hoạt động.`
          : `Đã tắt bộ sưu tập “${collection.title}”.`,
      );
      queryClient.invalidateQueries();
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  const saveMut = useMutation({
    mutationFn: async (args: {
      snapshot: string;
      force?: boolean;
    }): Promise<{
      ok: boolean;
      error: string | null;
      duplicateWarning?: boolean;
      duplicateTitle?: string;
      scale?: string;
    }> => {
      const res = await api.adminUpdateCollection({
        id: collection.id,
        title: title.trim(),
        status,
        kind: mode,
        conditions: validConditions,
        description,
        matchMode,
        visible: visibleOnList,
        imageKey,
        seoTitle,
        seoDescription,
        slug: slug.trim() || undefined,
        force: args.force,
      });
      if (!res.ok) return res;
      if (mode === "manual") {
        const res2 = await api.adminSetCollectionProducts({
          collectionId: collection.id,
          productIds: manualIds,
        });
        if (!res2.ok) return res2;
      }
      return res;
    },
    onSuccess: (res, vars) => {
      if (res.duplicateWarning) {
        setDuplicatePrompt({
          open: true,
          message:
            res.error ||
            `Tỉ lệ ${res.scale || ""} đã có bộ sưu tập riêng là “${res.duplicateTitle || ""}”. Bạn có muốn tiếp tục lưu không?`,
          duplicateTitle: res.duplicateTitle,
          scale: res.scale,
        });
        return;
      }
      if (!res.ok) {
        if (res.error && res.error.includes("đã có bộ sưu tập theo tỉ lệ riêng là")) {
          setDuplicatePrompt({
            open: true,
            message: res.error,
          });
          return;
        }
        setFormError(res.error ?? "Không lưu được bộ sưu tập.");
        return;
      }
      setDuplicatePrompt(null);
      setSavedSnapshot(vars.snapshot);
      setFormError(null);
      setNotice(
        `Đã lưu bộ sưu tập “${title.trim()}” vào database chung — thẻ tag và danh sách sản phẩm đã khớp theo.`,
      );
      queryClient.invalidateQueries();
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  const submit = () => {
    setFormError(null);
    setNotice(null);
    if (title.trim().length < 2)
      return setFormError("Tiêu đề bộ sưu tập cần ít nhất 2 ký tự.");
    if (mode === "auto" && validConditions.length === 0)
      return setFormError(
        "Chế độ Tự động cần ít nhất một điều kiện có giá trị — thêm điều kiện ở khối Điều kiện.",
      );
    if (imageError) return setFormError(`Ảnh bộ sưu tập: ${imageError}`);
    saveMut.mutate({
      snapshot: shapeOfCollectionForm(currentCollectionShape()),
      force: false,
    });
  };

  const confirmDuplicateSave = () => {
    setFormError(null);
    setNotice(null);
    setDuplicatePrompt(null);
    saveMut.mutate({
      snapshot: shapeOfCollectionForm(currentCollectionShape()),
      force: true,
    });
  };

  const cancelDuplicateSave = () => {
    setDuplicatePrompt(null);
  };

  const deleteMut = useMutation({
    mutationFn: () => api.adminDeleteCollection({ collectionId: collection.id }),
    onSuccess: (res) => {
      if (!res.ok) {
        setFormError(res.error ?? "Không xóa được bộ sưu tập.");
        return;
      }
      queryClient.invalidateQueries();
      onDeleted(
        `Đã xóa bộ sưu tập “${collection.title}” khỏi database chung — sản phẩm trong bộ vẫn giữ nguyên, chỉ mất thẻ tag của bộ này.`,
      );
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  return {
    duplicatePrompt,
    toggleStatusMut,
    saveMut,
    submit,
    confirmDuplicateSave,
    cancelDuplicateSave,
    deleteMut,
  };
}
