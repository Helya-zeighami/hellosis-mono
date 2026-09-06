"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon } from "@hugeicons/core-free-icons";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/hooks/use-auth";
import { messagingSocket } from "@/services/socket";

export default function LogoutButton({ label }: { label: string }) {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const clearSession = useAuthStore((s) => s.clearSession);
  const logoutMutation = useLogout();

  const handleLogout = () => {
    const refreshToken = session?.refreshToken;

    const finishLogout = () => {
      messagingSocket.disconnect();
      clearSession();
      router.replace("/login");
      router.refresh();
    };

    if (refreshToken) {
      logoutMutation.mutate(refreshToken, {
        onSettled: finishLogout,
      });
    } else {
      finishLogout();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
    >
      <HugeiconsIcon icon={Logout01Icon} />
      {logoutMutation.isPending ? "Logging out..." : label}
    </Button>
  );
}
