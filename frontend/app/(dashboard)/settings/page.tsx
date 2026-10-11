"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile?tab=settings");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-mutedText text-sm">
      Redirecting to Profile & Settings (Account Settings)...
    </div>
  );
}
