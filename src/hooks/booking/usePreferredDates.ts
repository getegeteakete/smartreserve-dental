
import { useState } from "react";

interface PreferredDate {
  date: Date | undefined;
  timeSlot: string | undefined;
}

export const usePreferredDates = () => {
  const [preferredDates, setPreferredDates] = useState<PreferredDate[]>([
    { date: undefined, timeSlot: undefined },
    { date: undefined, timeSlot: undefined },
    { date: undefined, timeSlot: undefined },
  ]);

  const handleDateSelect = (index: number, date: Date | undefined) => {
    setPreferredDates(prev => {
      const newDates = [...prev];
      newDates[index] = { ...newDates[index], date };
      return newDates;
    });
  };

  const handleTimeSlotSelect = (index: number, timeSlot: string) => {
    setPreferredDates(prev => {
      const newDates = [...prev];
      newDates[index] = { ...newDates[index], timeSlot };
      return newDates;
    });
  };

  const resetPreferredDates = () => {
    setPreferredDates([
      { date: undefined, timeSlot: undefined },
      { date: undefined, timeSlot: undefined },
      { date: undefined, timeSlot: undefined },
    ]);
  };

  return {
    preferredDates,
    handleDateSelect,
    handleTimeSlotSelect,
    resetPreferredDates
  };
};
