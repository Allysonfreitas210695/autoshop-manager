import { headers } from "next/headers";

import { auth } from "@/_lib/auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
