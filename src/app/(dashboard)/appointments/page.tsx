import { CalendarClock } from "lucide-react";

export default function AppointmentsPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="bg-secondary/10 text-secondary flex size-16 items-center justify-center rounded-2xl">
        <CalendarClock className="size-8" />
      </span>
      <h1 className="text-headline-md text-on-surface font-bold">
        Agendamentos
      </h1>
      <p className="text-body-md text-on-surface-variant max-w-sm">
        Módulo de agendamentos em desenvolvimento. Em breve disponível.
      </p>
    </div>
  );
}
