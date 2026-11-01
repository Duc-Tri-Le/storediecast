import type { CatalogData } from "../types";
import type { CollectionCondition, MatchMode } from "../utils/collectionRules";
import { cardCls } from "./shared";
import { CollectionConditionsSection } from "./CollectionDetailSections";

export function CollectionDetailModeSection({
  isBase,
  mode,
  setMode,
  conditions,
  setConditions,
  matchMode,
  setMatchMode,
  setCondition,
  catalog,
  allTags,
}: {
  isBase: boolean;
  mode: "manual" | "auto";
  setMode: (m: "manual" | "auto") => void;
  conditions: CollectionCondition[];
  setConditions: React.Dispatch<React.SetStateAction<CollectionCondition[]>>;
  matchMode: MatchMode;
  setMatchMode: (m: MatchMode) => void;
  setCondition: (i: number, patch: Partial<CollectionCondition>) => void;
  catalog: CatalogData | null;
  allTags: string[];
}) {
  return (
    <section className={`${cardCls} p-5 space-y-4`} aria-label="Loại bộ sưu tập">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--dim)]">
        Loại bộ sưu tập
      </h2>

      {isBase ? (
        <div className="rounded-xl border border-[#f9ab00]/30 bg-[#fef7e0] p-4 text-xs text-[#8a5d08]">
          <p className="font-bold flex items-center gap-1.5 text-sm">
            <span>⭐</span>
            <span>Bộ sưu tập tự động theo tỉ lệ cố định</span>
          </p>
          <p className="mt-1 leading-relaxed">
            Bộ sưu tập này được hệ thống tạo sẵn dựa trên danh mục tỉ lệ. Sản phẩm mang tỉ lệ tương ứng sẽ luôn tự động nằm trong bộ này.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
              mode === "manual"
                ? "border-[var(--accent)] bg-[var(--accent-soft)]/20 shadow-xs ring-1 ring-[var(--accent)]"
                : "border-[var(--border)] hover:bg-[var(--sidebar)]"
            }`}
          >
            <input
              type="radio"
              name="mode"
              checked={mode === "manual"}
              onChange={() => setMode("manual")}
              className="mt-1 h-4 w-4 text-[var(--accent)]"
            />
            <div className="flex-1 text-xs">
              <span className="font-bold text-[var(--text)] block text-sm">Thủ công</span>
              <span className="text-[var(--dim)] mt-0.5 block leading-relaxed">
                Bạn tự tay chọn từng mẫu xe cụ thể muốn đưa vào bộ sưu tập.
              </span>
            </div>
          </label>

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
              mode === "auto"
                ? "border-[var(--accent)] bg-[var(--accent-soft)]/20 shadow-xs ring-1 ring-[var(--accent)]"
                : "border-[var(--border)] hover:bg-[var(--sidebar)]"
            }`}
          >
            <input
              type="radio"
              name="mode"
              checked={mode === "auto"}
              onChange={() => setMode("auto")}
              className="mt-1 h-4 w-4 text-[var(--accent)]"
            />
            <div className="flex-1 text-xs">
              <span className="font-bold text-[var(--text)] block text-sm">Tự động</span>
              <span className="text-[var(--dim)] mt-0.5 block leading-relaxed">
                Sản phẩm hiện tại và tương lai khớp với điều kiện sẽ tự động được thêm vào.
              </span>
            </div>
          </label>
        </div>
      )}

      {/* Điều kiện tự động khi ở chế độ auto */}
      {mode === "auto" && !isBase && (
        <div className="border-t border-[var(--border)] pt-4">
          <CollectionConditionsSection
            conditions={conditions}
            matchMode={matchMode}
            onChangeMatchMode={setMatchMode}
            onChangeCondition={setCondition}
            onAddCondition={() =>
              setConditions((cs) => [
                ...cs,
                { kind: "scale", operator: "eq", value: "" },
              ])
            }
            onRemoveCondition={(i) =>
              setConditions((cs) => cs.filter((_, idx) => idx !== i))
            }
            catalog={catalog}
            allTags={allTags}
          />
        </div>
      )}
    </section>
  );
}

