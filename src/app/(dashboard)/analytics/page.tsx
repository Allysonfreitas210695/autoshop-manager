import {
  getAnalyticsKpis,
  getMechanicPerformance,
  getMonthlyRevenue,
  getServiceCategories,
} from "@/_lib/queries/analytics";

import { AnalyticsClient } from "./_components/AnalyticsClient";

export const metadata = { title: "Analytics — Precision Auto" };

export default async function AnalyticsPage() {
  const [kpis, monthlyRevenue, mechanicPerformance, serviceCategories] =
    await Promise.all([
      getAnalyticsKpis(),
      getMonthlyRevenue(12),
      getMechanicPerformance(),
      getServiceCategories(),
    ]);

  return (
    <AnalyticsClient
      kpis={kpis}
      monthlyRevenue={monthlyRevenue}
      mechanicPerformance={mechanicPerformance}
      serviceCategories={serviceCategories}
    />
  );
}
