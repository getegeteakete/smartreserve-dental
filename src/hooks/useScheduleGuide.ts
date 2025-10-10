
import { useState, useEffect, useRef } from "react";

export const useScheduleGuide = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  const targetRefs = {
    scheduleTab: useRef<HTMLButtonElement>(null),
    monthSelector: useRef<HTMLDivElement>(null),
    batchApply: useRef<HTMLDivElement>(null),
    dayOff: useRef<HTMLDivElement>(null),
    specialTab: useRef<HTMLButtonElement>(null),
  };

  const startGuide = () => {
    setIsGuideActive(true);
    setCurrentStep(1);
    setCompletedSteps(new Set());
  };

  const stopGuide = () => {
    setIsGuideActive(false);
    setCurrentStep(1);
  };

  const completeStep = (step: number) => {
    const newCompletedSteps = new Set(completedSteps);
    newCompletedSteps.add(step);
    setCompletedSteps(newCompletedSteps);

    if (step < 5) {
      setCurrentStep(step + 1);
    } else {
      // ガイド完了
      setIsGuideActive(false);
    }
  };

  const getTargetElements = () => {
    return {
      scheduleTab: targetRefs.scheduleTab.current,
      monthSelector: targetRefs.monthSelector.current,
      batchApply: targetRefs.batchApply.current,
      dayOff: targetRefs.dayOff.current,
      specialTab: targetRefs.specialTab.current,
    };
  };

  return {
    currentStep,
    isGuideActive,
    completedSteps,
    targetRefs,
    startGuide,
    stopGuide,
    completeStep,
    getTargetElements
  };
};
