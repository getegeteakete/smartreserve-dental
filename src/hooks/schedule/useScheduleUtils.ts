
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateTimeSlots } from "@/utils/timeSlotUtils";
import { TimeSlot } from "@/types/schedule";

export const useScheduleUtils = () => {
  const { toast } = useToast();
  const timeSlots = generateTimeSlots();
  const operationInProgress = useRef(false);

  const showToast = (title: string, description: string, variant?: "default" | "destructive") => {
    toast({
      variant,
      title,
      description,
    });
  };

  return {
    toast: showToast,
    timeSlots,
    operationInProgress,
  };
};
