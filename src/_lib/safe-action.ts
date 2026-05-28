import { headers } from "next/headers";
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";

import { auth } from "@/_lib/auth";

export class ActionError extends Error {}

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    if (error instanceof ActionError) {
      return error.message;
    }

    console.error("Action error:", error);
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new ActionError("Não autenticado.");
  }

  return next({
    ctx: {
      user: session.user,
      session: session.session,
    },
  });
});
