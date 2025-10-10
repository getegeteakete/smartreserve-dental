import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useBookedTimeSlots } from "./useBookedTimeSlots";
import { checkTimeSlotCapacity } from "@/utils/treatmentReservationUtils";
import { 
  generateDynamicTimeSlots, 
  generateDynamicTimeSlotsForTreatment,
  TimeSlot 
} from "@/utils/dynamicScheduleUtils";

export { type TimeSlot } from "@/utils/dynamicScheduleUtils";

export const useTimeSlots = (
  date: Date | undefined, 
  treatmentName?: string, 
  userEmail?: string,
  treatmentDuration?: number
) => {
  const { data: bookedSlots = [], refetch: refetchBookedSlots } = useBookedTimeSlots(userEmail);
  
  return useQuery<TimeSlot[]>({
    queryKey: ["timeSlots", date ? format(date, 'yyyy-MM-dd') : 'undefined', treatmentName, userEmail, bookedSlots.length, treatmentDuration],
    queryFn: async () => {
      // 最新の予約済み時間を再取得
      await refetchBookedSlots();
      
      if (!date) return [];

      try {
        // 治療時間に応じて動的に時間枠を生成
        const timeSlots = treatmentDuration 
          ? await generateDynamicTimeSlotsForTreatment(date, treatmentDuration)
          : await generateDynamicTimeSlots(date);
        
        console.log(`時間枠生成完了: ${timeSlots.length}件 (治療時間: ${treatmentDuration || 30}分)`);
        
        if (!treatmentName) {
          return timeSlots;
        }
        
        // 各時間枠について容量をチェックして利用可能性を判定
        const dateString = format(date, 'yyyy-MM-dd');
        const checkedSlots = await Promise.all(
          timeSlots.map(async (slot) => {
            // 時間枠の容量チェック
            const { canReserve, currentCount, maxCapacity } = await checkTimeSlotCapacity(
              treatmentName,
              dateString,
              slot.start_time
            );
            
            return {
              ...slot,
              is_available: canReserve
            };
          })
        );
        
        return checkedSlots;
      } catch (error) {
        console.error("時間枠取得エラー:", error);
        throw error;
      }
    },
    enabled: !!date,
    staleTime: 10 * 1000, // 10秒間キャッシュ（より頻繁に更新）
    refetchInterval: 30 * 1000, // 30秒ごとに自動更新
  });
};
