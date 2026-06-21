import { CheckCircle2, Clock, User } from "lucide-react";

import type { AppointmentRow } from "@/_data-access/appointments";
import { formatTime } from "@/_helpers/format";

type AppointmentStatus = AppointmentRow["status"];

const statusLabels: Record<AppointmentStatus, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const statusColor: Record<AppointmentStatus, string> = {
  confirmed:
    "bg-status-completed/20 text-status-completed border-status-completed/30",
  scheduled:
    "bg-status-pending/20 text-on-surface-variant border-status-pending/30",
  cancelled: "bg-error/20 text-error border-error/30",
  completed: "bg-secondary/20 text-secondary border-secondary/30",
};

type Props = {
  appt: AppointmentRow;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
};

export function AppointmentCard({ appt, onStatusChange }: Props) {
  return (
    <div className="bg-surface-container border-outline-variant/30 hover:border-secondary/40 space-y-3 rounded-xl border p-4 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-body-md text-on-surface truncate font-semibold">
            {appt.customer ?? "Cliente não informado"}
          </p>
          <p className="text-label-sm text-on-surface-variant mt-0.5 font-mono">
            {appt.vehicle ?? "Veículo não informado"}
            {appt.plate ? ` · ${appt.plate}` : ""}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-1 font-mono text-[10px] font-bold tracking-wider uppercase ${statusColor[appt.status]}`}
        >
          {statusLabels[appt.status]}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        <span className="text-label-sm text-on-surface-variant flex items-center gap-1.5">
          <Clock className="text-secondary size-3.5 shrink-0" />
          {formatTime(appt.scheduledAt)}
        </span>
        {appt.mechanic && (
          <span className="text-label-sm text-on-surface-variant flex items-center gap-1.5">
            <User className="text-secondary size-3.5 shrink-0" />
            {appt.mechanic}
          </span>
        )}
        {appt.phone && (
          <span className="text-label-sm text-tertiary flex items-center gap-1.5 font-mono">
            <CheckCircle2 className="size-3.5 shrink-0" />
            {appt.phone}
          </span>
        )}
      </div>
      {appt.notes && (
        <p className="text-label-sm text-on-surface-variant/70 border-outline-variant/20 border-t pt-2 italic">
          {appt.notes}
        </p>
      )}
      {appt.status !== "cancelled" && appt.status !== "completed" && (
        <div className="border-outline-variant/20 flex gap-2 border-t pt-2">
          {appt.status === "scheduled" && (
            <button
              onClick={() => onStatusChange(appt.id, "confirmed")}
              className="text-label-xs bg-status-completed/10 text-status-completed hover:bg-status-completed/20 rounded px-2 py-1 font-mono transition-colors"
            >
              Confirmar
            </button>
          )}
          {appt.status === "confirmed" && (
            <button
              onClick={() => onStatusChange(appt.id, "completed")}
              className="text-label-xs bg-secondary/10 text-secondary hover:bg-secondary/20 rounded px-2 py-1 font-mono transition-colors"
            >
              Concluir
            </button>
          )}
          <button
            onClick={() => onStatusChange(appt.id, "cancelled")}
            className="text-label-xs bg-error/10 text-error hover:bg-error/20 rounded px-2 py-1 font-mono transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
