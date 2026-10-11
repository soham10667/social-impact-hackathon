"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface InterviewSessionContextType {
  isInterviewActive: boolean;
  setIsInterviewActive: (active: boolean) => void;
}

const InterviewSessionContext = createContext<InterviewSessionContextType>({
  isInterviewActive: false,
  setIsInterviewActive: () => {},
});

export function InterviewSessionProvider({ children }: { children: ReactNode }) {
  const [isInterviewActive, setIsInterviewActive] = useState<boolean>(false);

  return (
    <InterviewSessionContext.Provider value={{ isInterviewActive, setIsInterviewActive }}>
      {children}
    </InterviewSessionContext.Provider>
  );
}

export function useInterviewSession() {
  return useContext(InterviewSessionContext);
}
