import type { TicketPriority, TicketStatus } from "../../../types/model-types";

export function StatusBadge({ status }: { status: TicketStatus }) {
  const map = {
    OPEN: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    DONE: "bg-green-100 text-green-700",
  } as const;

  const label =
    status === "OPEN"
      ? "Aberto"
      : status === "IN_PROGRESS"
      ? "Em Progresso"
      : "Concluído";

  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${map[status]}`}>
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const map = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-red-100 text-red-700",
  } as const;

  const label =
    priority === "LOW" ? "Baixa" : priority === "MEDIUM" ? "Média" : "Alta";

  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${map[priority]}`}>
      {label}
    </span>
  );
}