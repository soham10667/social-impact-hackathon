"use client";

import { Suspense } from "react";
import AdaptiveExamContainer from "./AdaptiveExamContainer";

export default function AdaptiveExamPage() {
  return (
    <Suspense fallback={<div className="text-mutedText">Loading Adaptive Exam Session...</div>}>
      <AdaptiveExamContainer />
    </Suspense>
  );
}
