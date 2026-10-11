"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MistakesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/analytics?tab=mistakes");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-mutedText text-sm">
      Redirecting to Analytics (Mistake Intelligence)...
    </div>
  );
}
