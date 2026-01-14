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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-xl bg-white rounded-xl border shadow-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            Fechar
          </button>
        </div>
        <div className="p-4 bg-white">{children}</div>
      </div>
    </div>
  );
}
