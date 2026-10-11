"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BugsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/coding?tab=bugs");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-mutedText text-sm">
      Redirecting to Coding Arena (Bug Investigation)...
    </div>
  );
}
