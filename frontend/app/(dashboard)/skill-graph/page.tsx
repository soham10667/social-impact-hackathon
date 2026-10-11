"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SkillGraphRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/roadmap?tab=graph");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-mutedText text-sm">
      Redirecting to Learning Roadmap (Skill Knowledge Graph)...
    </div>
  );
}
