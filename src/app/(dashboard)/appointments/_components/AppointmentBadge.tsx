import type { AppointmentRow } from "@/_data-access/appointments";
import { formatTime } from "@/_helpers/format";

const statusColor: Record<AppointmentRow["status"], string> = {
  confirmed:
    "bg-status-completed/20 text-status-completed border-status-completed/30",
  scheduled:
    "bg-status-pending/20 text-on-surface-variant border-status-pending/30",
  cancelled: "bg-error/20 text-error border-error/30",
  completed: "bg-secondary/20 text-secondary border-secondary/30",
};

const statusDot: Record<AppointmentRow["status"], string> = {
  confirmed: "bg-status-completed",
  scheduled: "bg-status-pending",
  cancelled: "bg-error",
  completed: "bg-secondary",
};

export function AppointmentBadge({ appt }: { appt: AppointmentRow }) {
  return (
    <div
      className={`flex items-center gap-1 truncate rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium ${statusColor[appt.status]}`}
    >
      <span
        className={`size-1.5 shrink-0 rounded-full ${statusDot[appt.status]}`}
      />
      <span className="truncate">
        {formatTime(appt.scheduledAt)}{" "}
        {(appt.customer ?? "Cliente").split(" ")[0]}
      </span>
    </div>
  );
}
