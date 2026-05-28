"use client";

import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  List,
  Plus,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/_components/ui/button";
import {
  type AppointmentStatus,
  appointmentStatusLabels,
  type MockAppointment,
  mockAppointments,
} from "@/_lib/mock-data";

import { NewAppointmentDrawer } from "./_components/NewAppointmentDrawer";

const statusColor: Record<AppointmentStatus, string> = {
  confirmed:
    "bg-status-completed/20 text-status-completed border-status-completed/30",
  pending:
    "bg-status-pending/20 text-on-surface-variant border-status-pending/30",
  cancelled: "bg-error/20 text-error border-error/30",
  completed: "bg-secondary/20 text-secondary border-secondary/30",
};

const statusDot: Record<AppointmentStatus, string> = {
  confirmed: "bg-status-completed",
  pending: "bg-status-pending",
  cancelled: "bg-error",
  completed: "bg-secondary",
};

function AppointmentBadge({ appt }: { appt: MockAppointment }) {
  return (
    <div
      className={`flex items-center gap-1 truncate rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium ${statusColor[appt.status]}`}
    >
      <span
        className={`size-1.5 shrink-0 rounded-full ${statusDot[appt.status]}`}
      />
      <span className="truncate">
        {appt.time} {appt.customer.split(" ")[0]}
      </span>
    </div>
  );
}

function AppointmentCard({ appt }: { appt: MockAppointment }) {
  return (
    <div className="bg-surface-container border-outline-variant/30 hover:border-secondary/40 space-y-3 rounded-xl border p-4 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-body-md text-on-surface truncate font-semibold">
            {appt.customer}
          </p>
          <p className="text-label-sm text-on-surface-variant mt-0.5 font-mono">
            {appt.vehicle} · {appt.plate}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-1 font-mono text-[10px] font-bold tracking-wider uppercase ${statusColor[appt.status]}`}
        >
          {appointmentStatusLabels[appt.status]}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        <span className="text-label-sm text-on-surface-variant flex items-center gap-1.5">
          <Clock className="text-secondary size-3.5 shrink-0" />
          {appt.time} · {appt.duration} min
        </span>
        <span className="text-label-sm text-on-surface-variant flex items-center gap-1.5">
          <User className="text-secondary size-3.5 shrink-0" />
          {appt.mechanic}
        </span>
        <span className="text-label-sm text-tertiary flex items-center gap-1.5 font-mono">
          <CheckCircle2 className="size-3.5 shrink-0" />
          {appt.serviceType}
        </span>
      </div>
      {appt.notes && (
        <p className="text-label-sm text-on-surface-variant/70 border-outline-variant/20 border-t pt-2 italic">
          {appt.notes}
        </p>
      )}
    </div>
  );
}

type View = "calendar" | "list";

export function AppointmentsClient() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1)); // May 2026
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 4, 28));
  const [view, setView] = useState<View>("calendar");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const selectedDayAppts = mockAppointments
    .filter((a) => isSameDay(new Date(a.date + "T00:00:00"), selectedDate))
    .sort((a, b) => a.time.localeCompare(b.time));

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const countByDate = (date: Date) =>
    mockAppointments.filter((a) =>
      isSameDay(new Date(a.date + "T00:00:00"), date),
    );

  const todayTotal = mockAppointments.filter(
    (a) =>
      isSameDay(new Date(a.date + "T00:00:00"), new Date(2026, 4, 28)) &&
      a.status !== "cancelled",
  ).length;

  const weekTotal = mockAppointments.filter((a) => {
    const d = new Date(a.date + "T00:00:00");
    const weekStart = startOfWeek(new Date(2026, 4, 28), { weekStartsOn: 0 });
    const weekEnd = endOfWeek(new Date(2026, 4, 28), { weekStartsOn: 0 });
    return d >= weekStart && d <= weekEnd && a.status !== "cancelled";
  }).length;

  const pendingTotal = mockAppointments.filter(
    (a) => a.status === "pending",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface font-bold">
            Agendamentos
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Gerencie a agenda da oficina e confirme compromissos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-surface-container border-outline-variant/30 flex rounded-lg border p-0.5">
            <button
              onClick={() => setView("calendar")}
              className={`text-label-sm flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
                view === "calendar"
                  ? "bg-secondary text-on-secondary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <CalendarDays className="size-4" />
              <span className="hidden sm:inline">Calendário</span>
            </button>
            <button
              onClick={() => setView("list")}
              className={`text-label-sm flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
                view === "list"
                  ? "bg-secondary text-on-secondary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <List className="size-4" />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>
          <Button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Novo Agendamento</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Hoje", value: todayTotal, color: "text-secondary" },
          {
            label: "Esta Semana",
            value: weekTotal,
            color: "text-status-completed",
          },
          { label: "Pendentes", value: pendingTotal, color: "text-tertiary" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-surface-container border-outline-variant/30 rounded-xl border p-4 text-center"
          >
            <p className={`text-display-sm font-mono font-bold ${kpi.color}`}>
              {kpi.value}
            </p>
            <p className="text-label-sm text-on-surface-variant mt-1">
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {view === "calendar" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Calendar */}
          <div className="bg-surface-container border-outline-variant/30 space-y-4 rounded-2xl border p-5">
            {/* Month nav */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                className="text-on-surface-variant hover:bg-outline-variant/20 rounded-lg p-1.5 transition-colors"
              >
                <ChevronLeft className="size-5" />
              </button>
              <h2 className="text-title-md text-on-surface font-semibold capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </h2>
              <button
                onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                className="text-on-surface-variant hover:bg-outline-variant/20 rounded-lg p-1.5 transition-colors"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            {/* Week headers */}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((d) => (
                <div
                  key={d}
                  className="text-label-xs text-on-surface-variant py-1 text-center font-mono tracking-wider uppercase"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {calDays.map((day) => {
                const appts = countByDate(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const todayDay = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`relative min-h-18 rounded-xl border p-1.5 text-left transition-all ${isSelected ? "border-secondary bg-secondary/10" : "hover:border-outline-variant/30 hover:bg-surface border-transparent"} ${!isCurrentMonth ? "opacity-40" : ""} `}
                  >
                    <span
                      className={`text-label-sm mb-1 flex size-6 items-center justify-center rounded-full font-mono font-medium ${todayDay ? "bg-secondary text-on-secondary" : "text-on-surface-variant"} ${isSelected && !todayDay ? "text-secondary" : ""} `}
                    >
                      {format(day, "d")}
                    </span>
                    <div className="space-y-0.5">
                      {appts.slice(0, 2).map((a) => (
                        <AppointmentBadge key={a.id} appt={a} />
                      ))}
                      {appts.length > 2 && (
                        <p className="text-on-surface-variant px-1 font-mono text-[10px]">
                          +{appts.length - 2} mais
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day detail */}
          <div className="bg-surface-container border-outline-variant/30 space-y-4 rounded-2xl border p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-title-md text-on-surface font-semibold capitalize">
                  {format(selectedDate, "EEEE", { locale: ptBR })}
                </h3>
                <p className="text-label-sm text-on-surface-variant font-mono">
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
              <span className="text-label-sm text-secondary bg-secondary/10 rounded-lg px-2 py-1 font-mono">
                {
                  selectedDayAppts.filter((a) => a.status !== "cancelled")
                    .length
                }{" "}
                agendamentos
              </span>
            </div>

            {selectedDayAppts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <XCircle className="text-on-surface-variant/30 size-10" />
                <p className="text-body-sm text-on-surface-variant">
                  Nenhum agendamento neste dia
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDrawerOpen(true)}
                >
                  <Plus className="mr-1 size-4" />
                  Agendar
                </Button>
              </div>
            ) : (
              <div className="max-h-130 space-y-3 overflow-y-auto pr-1">
                {selectedDayAppts.map((appt) => (
                  <AppointmentCard key={appt.id} appt={appt} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-6">
          {[
            addDays(new Date(2026, 4, 28), 0),
            addDays(new Date(2026, 4, 28), 1),
            addDays(new Date(2026, 4, 28), 2),
            addDays(new Date(2026, 4, 28), 5),
            addDays(new Date(2026, 4, 28), 6),
            addDays(new Date(2026, 4, 28), 7),
          ].map((day) => {
            const appts = countByDate(day).sort((a, b) =>
              a.time.localeCompare(b.time),
            );
            if (appts.length === 0) return null;
            return (
              <div key={day.toISOString()} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-label-sm font-mono font-bold tracking-wider uppercase ${isToday(day) ? "text-secondary" : "text-on-surface-variant"}`}
                    >
                      {format(day, "EEE", { locale: ptBR })}
                    </span>
                    <span
                      className={`text-display-xs font-mono font-bold ${isToday(day) ? "text-secondary" : "text-on-surface"}`}
                    >
                      {format(day, "dd")}
                    </span>
                    <span className="text-label-sm text-on-surface-variant font-mono capitalize">
                      {format(day, "MMMM", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="bg-outline-variant/30 h-px flex-1" />
                  <span className="text-label-xs text-on-surface-variant font-mono">
                    {appts.filter((a) => a.status !== "cancelled").length}{" "}
                    agend.
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {appts.map((appt) => (
                    <AppointmentCard key={appt.id} appt={appt} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NewAppointmentDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
