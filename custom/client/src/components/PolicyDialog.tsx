import { POLICIES, type PolicyKey } from "../data/policies";

export function PolicyDialog({
  policyKey,
  onClose,
}: {
  policyKey: PolicyKey;
  onClose: () => void;
}) {
  const p = POLICIES[policyKey];
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={p.title}
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[var(--surface)] md:rounded-3xl">
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <h2 className="text-xl font-black tracking-tight">{p.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Đóng ${p.title}`}
            className="flex min-h-[44px] shrink-0 items-center rounded-full bg-[var(--dark)] px-4 py-2 text-sm font-bold text-white"
          >
            Đóng ✕
          </button>
        </div>
        <div className="px-5 pb-6 pt-3">
          <p className="text-[15px] leading-relaxed">{p.intro}</p>
          <ul className="mt-4 list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-[var(--dim)]">
            {p.points.map((point) => (
              <li key={point.slice(0, 32)}>{point}</li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-[var(--dim)]">
            Cần hỗ trợ thêm? Xem mục Hỏi đáp hoặc dùng mục Liên hệ ở chân trang.
          </p>
        </div>
      </div>
    </div>
  );
}

