
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface PreferredDate {
  date: Date | undefined;
  timeSlot: string | undefined;
}

export const usePreferredDates = () => {
  const location = useLocation();
  const [preferredDates, setPreferredDates] = useState<PreferredDate[]>([
    { date: undefined, timeSlot: undefined },
    { date: undefined, timeSlot: undefined },
    { date: undefined, timeSlot: undefined },
  ]);

  // Handle AI booking data for dates and times
  useEffect(() => {
    if (location.state?.fromAI && location.state?.aiBookingData) {
      const aiData = location.state.aiBookingData;
      
      // AIが抽出した日付を設定
      if (aiData.date) {
        const date = new Date(
          aiData.date.year || new Date().getFullYear(),
          (aiData.date.month || 1) - 1,
          aiData.date.day || 1
        );
        
        // 最初の希望日として設定
        setPreferredDates(prev => {
          const newDates = [...prev];
          newDates[0] = { ...newDates[0], date };
          return newDates;
        });
        
        console.log('AI set date:', date);
      }
      
      // AIが抽出した時間を設定
      if (aiData.time) {
        const timeSlot = aiData.time;
        
        // 最初の希望時間として設定
        setPreferredDates(prev => {
          const newDates = [...prev];
          newDates[0] = { ...newDates[0], timeSlot };
          return newDates;
        });
        
        console.log('AI set time:', timeSlot);
      }
    }
  }, [location.state]);

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
