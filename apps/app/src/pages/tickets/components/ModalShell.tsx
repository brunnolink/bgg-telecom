export function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-xl bg-slate-950/90 backdrop-blur rounded-xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-sm text-slate-100 hover:text-white cursor-pointer"
          >
            {"X"}
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
