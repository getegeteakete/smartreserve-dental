import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface TimeRangeSliderProps {
  startTime: string; // "HH:MM" format
  endTime: string; // "HH:MM" format
  onChange: (startTime: string, endTime: string) => void;
  minHour?: number;
  maxHour?: number;
  disabled?: boolean;
  className?: string;
}

export const TimeRangeSlider = ({
  startTime,
  endTime,
  onChange,
  minHour = 0,
  maxHour = 24,
  disabled = false,
  className = ''
}: TimeRangeSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);

  // 時間を分に変換
  const timeToMinutes = useCallback((time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }, []);

  // 分を時間に変換
  const minutesToTime = useCallback((minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }, []);

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const totalMinutes = (maxHour - minHour) * 60;

  // パーセンテージに変換
  const startPercent = ((startMinutes - minHour * 60) / totalMinutes) * 100;
  const endPercent = ((endMinutes - minHour * 60) / totalMinutes) * 100;

  const handleMouseDown = (isStart: boolean) => (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    if (isStart) {
      setIsDraggingStart(true);
    } else {
      setIsDraggingEnd(true);
    }
  };

  const updateTime = useCallback((clientX: number, isStart: boolean) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const minutes = Math.round((percent / 100) * totalMinutes + minHour * 60);
    
    // 15分単位に丸める
    const roundedMinutes = Math.round(minutes / 15) * 15;
    
    const currentStartMinutes = timeToMinutes(startTime);
    const currentEndMinutes = timeToMinutes(endTime);
    
    if (isStart) {
      const newStartTime = minutesToTime(Math.min(roundedMinutes, currentEndMinutes - 30));
      onChange(newStartTime, endTime);
    } else {
      const newEndTime = minutesToTime(Math.max(roundedMinutes, currentStartMinutes + 30));
      onChange(startTime, newEndTime);
    }
  }, [totalMinutes, minHour, timeToMinutes, minutesToTime, onChange, startTime, endTime]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingStart) {
        updateTime(e.clientX, true);
      } else if (isDraggingEnd) {
        updateTime(e.clientX, false);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingStart(false);
      setIsDraggingEnd(false);
    };

    if (isDraggingStart || isDraggingEnd) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingStart, isDraggingEnd, updateTime]);

  // 時間ラベルを生成
  const generateTimeLabels = () => {
    const labels = [];
    for (let hour = minHour; hour <= maxHour; hour += 2) {
      labels.push(
        <div
          key={hour}
          className="absolute text-xs text-gray-500"
          style={{ left: `${((hour - minHour) / (maxHour - minHour)) * 100}%`, transform: 'translateX(-50%)' }}
        >
          {hour}:00
        </div>
      );
    }
    return labels;
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="relative pt-2 pb-8">
        {/* 時間軸 */}
        <div ref={sliderRef} className="relative h-12 bg-gray-100 rounded-lg border-2 border-gray-300">
          {/* 選択範囲のバー */}
          <div
            className="absolute h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded transition-all"
            style={{
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`
            }}
          >
            {/* 時間表示 */}
            <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
              {startTime.substring(0, 5)} - {endTime.substring(0, 5)}
            </div>
          </div>

          {/* 開始ハンドル */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-6 h-10 bg-blue-600 border-3 border-white rounded-lg shadow-lg cursor-ew-resize transition-all hover:scale-110 flex items-center justify-center',
              isDraggingStart && 'scale-125 bg-blue-700',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            style={{ left: `${startPercent}%`, transform: 'translate(-50%, -50%)' }}
            onMouseDown={handleMouseDown(true)}
          >
            <div className="flex flex-col gap-0.5">
              <div className="w-0.5 h-1 bg-white rounded"></div>
              <div className="w-0.5 h-1 bg-white rounded"></div>
              <div className="w-0.5 h-1 bg-white rounded"></div>
            </div>
          </div>

          {/* 終了ハンドル */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-6 h-10 bg-blue-600 border-3 border-white rounded-lg shadow-lg cursor-ew-resize transition-all hover:scale-110 flex items-center justify-center',
              isDraggingEnd && 'scale-125 bg-blue-700',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            style={{ left: `${endPercent}%`, transform: 'translate(-50%, -50%)' }}
            onMouseDown={handleMouseDown(false)}
          >
            <div className="flex flex-col gap-0.5">
              <div className="w-0.5 h-1 bg-white rounded"></div>
              <div className="w-0.5 h-1 bg-white rounded"></div>
              <div className="w-0.5 h-1 bg-white rounded"></div>
            </div>
          </div>
        </div>

        {/* 時間ラベル */}
        <div className="relative mt-2 h-6">
          {generateTimeLabels()}
        </div>
      </div>

      {/* 選択時間の詳細表示 */}
      <div className="flex items-center justify-between text-sm bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">開始:</span>
          <span className="font-bold text-blue-700">{startTime.substring(0, 5)}</span>
        </div>
        <div className="text-gray-400">〜</div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">終了:</span>
          <span className="font-bold text-blue-700">{endTime.substring(0, 5)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">時間:</span>
          <span className="font-semibold text-gray-800">
            {Math.floor((endMinutes - startMinutes) / 60)}時間{(endMinutes - startMinutes) % 60}分
          </span>
        </div>
      </div>
    </div>
  );
};

