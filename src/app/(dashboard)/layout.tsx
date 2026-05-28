import { redirect } from "next/navigation";

import { Header } from "@/_components/shared/header";
import { Sidebar } from "@/_components/shared/sidebar";
import { getSession } from "@/_lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="bg-surface min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:ml-64">
        <Header
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          }}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
