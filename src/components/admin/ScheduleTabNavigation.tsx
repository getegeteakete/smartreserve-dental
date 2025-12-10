
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScheduleTabNavigationProps {
  currentStep: number;
  isGuideActive: boolean;
  targetRefs: {
    monthSelector: React.RefObject<HTMLDivElement>;
  };
}

export const ScheduleTabNavigation = ({
  currentStep,
  isGuideActive,
  targetRefs
}: ScheduleTabNavigationProps) => {
  return (
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="schedule">スケジュール設定</TabsTrigger>
      <TabsTrigger value="limits">診療種別制限</TabsTrigger>
      <TabsTrigger value="calendar">診療日カレンダー</TabsTrigger>
      <TabsTrigger value="reservations">予約カレンダー</TabsTrigger>
    </TabsList>
  );
};
