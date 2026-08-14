"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon } from "@hugeicons/core-free-icons";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export default function LogoutButton({ label }: { label: string }) {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
    router.refresh();
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      <HugeiconsIcon icon={Logout01Icon} />
      {label}
    </Button>
  );
}
