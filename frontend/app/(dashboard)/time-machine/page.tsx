"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TimeMachineRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/interview?tab=timemachine");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-mutedText text-sm">
      Redirecting to AI Mock Interview (Interview Time Machine)...
    </div>
  );
}
