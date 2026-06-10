import {
  listAppointments,
  listCustomerOptions,
  listMechanics,
} from "@/_data-access/appointments";

import { AppointmentsClient } from "./appointments-client";

export const metadata = { title: "Agendamentos — Precision Auto" };

export default async function AppointmentsPage() {
  const [appointments, mechanics, customers] = await Promise.all([
    listAppointments(),
    listMechanics(),
    listCustomerOptions(),
  ]);

  return (
    <AppointmentsClient
      initialAppointments={appointments}
      mechanics={mechanics}
      customers={customers}
    />
  );
}
