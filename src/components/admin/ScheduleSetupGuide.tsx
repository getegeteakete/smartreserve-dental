
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, X } from "lucide-react";

interface ScheduleSetupGuideProps {
  currentStep: number;
  onStepComplete: (step: number) => void;
  onClose: () => void;
  targetElements: {
    scheduleTab?: HTMLElement | null;
    monthSelector?: HTMLElement | null;
    batchApply?: HTMLElement | null;
    dayOff?: HTMLElement | null;
    specialTab?: HTMLElement | null;
  };
}

const steps = [
  {
    id: 1,
    title: "①診療時間設定",
    description: "ここを選択して診療時間設定を開始しましょう",
    target: "scheduleTab"
  },
  {
    id: 2,
    title: "②月次設定",
    description: "月を選んで設定対象の月を決めましょう",
    target: "monthSelector"
  },
  {
    id: 3,
    title: "③時間スロット一括適用",
    description: "基本診療日と基本診療時間を選んで一括適用しましょう",
    target: "batchApply"
  },
  {
    id: 4,
    title: "④曜日別休業日設定",
    description: "基本休みの曜日を設定しましょう",
    target: "dayOff"
  },
  {
    id: 5,
    title: "⑤特別診療日設定",
    description: "特別診療日タブに移動して特別診療日を入力しましょう",
    target: "specialTab"
  }
];

export const ScheduleSetupGuide = ({ 
  currentStep, 
  onStepComplete, 
  onClose, 
  targetElements 
}: ScheduleSetupGuideProps) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const currentStepData = steps.find(step => step.id === currentStep);

  useEffect(() => {
    if (!currentStepData) {
      setIsVisible(false);
      return;
    }

    const targetElement = targetElements[currentStepData.target as keyof typeof targetElements];
    
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 10,
        left: rect.left + window.scrollX
      });
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [currentStep, currentStepData, targetElements]);

  if (!currentStepData || !isVisible) {
    return null;
  }

  return (
    <div
      className="fixed z-50 animate-pulse"
      style={{
        top: position.top,
        left: position.left,
        maxWidth: '300px'
      }}
    >
      <Card className="border-primary border-2 shadow-lg bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-primary text-sm">
              {currentStepData.title}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {currentStepData.description}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              次に入力
            </span>
            <Button
              size="sm"
              onClick={() => onStepComplete(currentStep)}
              className="flex items-center gap-1"
            >
              完了
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
