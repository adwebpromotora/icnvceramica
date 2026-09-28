import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSessionFn } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const session = await getSessionFn();
    if (!session.userId) throw redirect({ to: "/admin/login" });
    return { user: session };
  },
  component: () => <Outlet />,
});
