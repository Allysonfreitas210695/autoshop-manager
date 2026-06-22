"use client";

import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  List,
  Plus,
  XCircle,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { updateAppointmentStatusAction } from "@/_actions/appointments";
import { Button } from "@/_components/ui/button";
import type {
  AppointmentRow,
  CustomerOption,
  MechanicOption,
} from "@/_data-access/appointments";

import { AppointmentBadge } from "./_components/AppointmentBadge";
import { AppointmentCard } from "./_components/AppointmentCard";
import { EditAppointmentDrawer } from "./_components/EditAppointmentDrawer";
import { NewAppointmentDrawer } from "./_components/NewAppointmentDrawer";

type AppointmentStatus = AppointmentRow["status"];

const statusLabels: Record<AppointmentStatus, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

type View = "calendar" | "week" | "list";

type Props = {
  initialAppointments: AppointmentRow[];
  mechanics: MechanicOption[];
  customers: CustomerOption[];
};

export function AppointmentsClient({
  initialAppointments,
  mechanics,
  customers,
}: Props) {
  const today = new Date();
  const [appointments, setAppointments] =
    useState<AppointmentRow[]>(initialAppointments);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentWeek, setCurrentWeek] = useState(
    startOfWeek(today, { weekStartsOn: 0 }),
  );
  const [view, setView] = useState<View>("calendar");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<AppointmentRow | null>(null);

  // M12 — list view date range state
  const [listStart, setListStart] = useState(subDays(today, 7));
  const [listEnd, setListEnd] = useState(addDays(today, 14));

  const { execute: execStatus } = useAction(updateAppointmentStatusAction, {
    onSuccess: ({ data }) => {
      if (!data) return;
      setAppointments((prev) =>
        prev.map((a) => (a.id === data.id ? { ...a, status: data.status } : a)),
      );
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao atualizar status.");
    },
  });

  function handleEdit(id: string) {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;
    setEditingAppt(appt);
    setEditDrawerOpen(true);
  }

  function handleStatusChange(id: string, status: AppointmentStatus) {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    );
    execStatus({ id, status });
    toast.success(`Agendamento ${statusLabels[status].toLowerCase()}.`);
  }

  const prevWeek = () => setCurrentWeek((w) => addDays(w, -7));
  const nextWeek = () => setCurrentWeek((w) => addDays(w, 7));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const byTime = (a: AppointmentRow, b: AppointmentRow) =>
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();

  const selectedDayAppts = appointments
    .filter((a) => isSameDay(new Date(a.scheduledAt), selectedDate))
    .sort(byTime);

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const countByDate = (date: Date) =>
    appointments.filter((a) => isSameDay(new Date(a.scheduledAt), date));

  const todayTotal = appointments.filter(
    (a) =>
      isSameDay(new Date(a.scheduledAt), today) && a.status !== "cancelled",
  ).length;

  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
  const weekTotal = appointments.filter((a) => {
    const d = new Date(a.scheduledAt);
    return d >= weekStart && d <= weekEnd && a.status !== "cancelled";
  }).length;

  const pendingTotal = appointments.filter(
    (a) => a.status === "scheduled",
  ).length;

  // M12 — list view days from listStart to listEnd
  const listDays = eachDayOfInterval({ start: listStart, end: listEnd });

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
              onClick={() => setView("week")}
              className={`text-label-sm flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
                view === "week"
                  ? "bg-secondary text-on-secondary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <CalendarRange className="size-4" />
              <span className="hidden sm:inline">Semana</span>
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
          { label: "Agendados", value: pendingTotal, color: "text-tertiary" },
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
                  <AppointmentCard
                    key={appt.id}
                    appt={appt}
                    onStatusChange={handleStatusChange}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : view === "week" ? (
        /* Week View */
        <div className="bg-surface-container border-outline-variant/30 space-y-4 rounded-2xl border p-5">
          {/* Week nav */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevWeek}
              className="text-on-surface-variant hover:bg-outline-variant/20 rounded-lg p-1.5 transition-colors"
            >
              <ChevronLeft className="size-5" />
            </button>
            <h2 className="text-title-md text-on-surface font-semibold">
              {format(currentWeek, "dd 'de' MMM", { locale: ptBR })} –{" "}
              {format(
                endOfWeek(currentWeek, { weekStartsOn: 0 }),
                "dd 'de' MMM",
                { locale: ptBR },
              )}
            </h2>
            <button
              onClick={nextWeek}
              className="text-on-surface-variant hover:bg-outline-variant/20 rounded-lg p-1.5 transition-colors"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* 7-column week grid */}
          <div className="grid grid-cols-7 gap-1">
            {eachDayOfInterval({
              start: currentWeek,
              end: endOfWeek(currentWeek, { weekStartsOn: 0 }),
            }).map((day, i) => {
              const appts = countByDate(day).sort(byTime);
              const todayDay = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className="flex min-h-32 flex-col gap-1"
                >
                  {/* Day header */}
                  <div className="mb-1 flex flex-col items-center gap-0.5">
                    <span className="text-label-xs text-on-surface-variant font-mono tracking-wider uppercase">
                      {weekDays[i]}
                    </span>
                    <span
                      className={`text-label-sm flex size-6 items-center justify-center rounded-full font-mono font-bold ${todayDay ? "bg-secondary text-on-secondary" : "text-on-surface-variant"}`}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                  {/* Appointments */}
                  <div className="max-h-48 space-y-0.5 overflow-y-auto">
                    {appts.slice(0, 3).map((a) => (
                      <AppointmentBadge key={a.id} appt={a} />
                    ))}
                    {appts.length > 3 && (
                      <p className="text-on-surface-variant px-1 font-mono text-[10px]">
                        +{appts.length - 3} mais
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View — M12: date range controls */
        <div className="space-y-4">
          {/* Date range controls */}
          <div className="bg-surface-container border-outline-variant/30 flex flex-wrap items-center gap-3 rounded-xl border p-4">
            <span className="text-label-sm text-on-surface-variant font-mono">
              Período:
            </span>
            <div className="flex items-center gap-2">
              <label className="text-label-xs text-on-surface-variant font-mono">
                De
              </label>
              <input
                type="date"
                value={format(listStart, "yyyy-MM-dd")}
                onChange={(e) =>
                  e.target.value &&
                  setListStart(new Date(e.target.value + "T00:00:00"))
                }
                className="bg-surface border-outline-variant/50 text-label-sm text-on-surface focus:ring-secondary rounded-lg border px-2 py-1 font-mono focus:ring-1 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-label-xs text-on-surface-variant font-mono">
                Até
              </label>
              <input
                type="date"
                value={format(listEnd, "yyyy-MM-dd")}
                onChange={(e) =>
                  e.target.value &&
                  setListEnd(endOfDay(new Date(e.target.value)))
                }
                className="bg-surface border-outline-variant/50 text-label-sm text-on-surface focus:ring-secondary rounded-lg border px-2 py-1 font-mono focus:ring-1 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setListStart(subDays(today, 7));
                  setListEnd(addDays(today, 14));
                }}
                className="text-label-xs border-outline-variant/50 text-on-surface-variant hover:bg-outline-variant/10 rounded border px-2 py-1 font-mono"
              >
                Padrão
              </button>
              <button
                onClick={() => {
                  setListStart(subDays(today, 30));
                  setListEnd(today);
                }}
                className="text-label-xs border-outline-variant/50 text-on-surface-variant hover:bg-outline-variant/10 rounded border px-2 py-1 font-mono"
              >
                Últimos 30d
              </button>
              <button
                onClick={() => {
                  setListStart(today);
                  setListEnd(addDays(today, 30));
                }}
                className="text-label-xs border-outline-variant/50 text-on-surface-variant hover:bg-outline-variant/10 rounded border px-2 py-1 font-mono"
              >
                Próximos 30d
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {listDays.map((day) => {
              const appts = countByDate(day).sort(byTime);
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
                      <AppointmentCard
                        key={appt.id}
                        appt={appt}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <NewAppointmentDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mechanics={mechanics}
        customers={customers}
      />
      {editingAppt && (
        <EditAppointmentDrawer
          key={editingAppt.id}
          open={editDrawerOpen}
          onClose={() => {
            setEditDrawerOpen(false);
            setEditingAppt(null);
          }}
          mechanics={mechanics}
          customers={customers}
          appt={editingAppt}
          onUpdated={(updated) =>
            setAppointments((prev) =>
              prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)),
            )
          }
        />
      )}
    </div>
  );
}
