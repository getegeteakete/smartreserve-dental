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
  const [isDraggingBar, setIsDraggingBar] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

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

  const handleStartHandleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    console.log('✅ 開始ハンドルマウスダウン - イベント発火確認');
    setIsDraggingStart(true);
    // マウスが離れたときに確実に終了するように
    const handleMouseUp = () => {
      console.log('✅ 開始ハンドルマウスアップ');
      setIsDraggingStart(false);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleEndHandleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    console.log('終了ハンドルマウスダウン');
    setIsDraggingEnd(true);
  };

  const handleBarMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    
    // ハンドルの領域をクリックした場合は処理をスキップ
    const target = e.target as HTMLElement;
    if (target.closest('[data-handle="start"]') || target.closest('[data-handle="end"]')) {
      console.log('バー: ハンドル領域をクリックしたためスキップ');
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const clickX = e.clientX;
    
    // ハンドルの領域（左右各25px）を除外
    const handleWidth = 25; // ハンドルの幅（px換算）
    const barLeft = rect.left + (startPercent / 100) * rect.width;
    const barRight = rect.left + (endPercent / 100) * rect.width;
    
    // ハンドル領域をクリックした場合は処理をスキップ
    if (clickX >= barLeft - handleWidth && clickX <= barLeft + handleWidth) {
      console.log('バー: 開始ハンドル領域をクリックしたためスキップ');
      return; // 開始ハンドル領域
    }
    if (clickX >= barRight - handleWidth && clickX <= barRight + handleWidth) {
      console.log('バー: 終了ハンドル領域をクリックしたためスキップ');
      return; // 終了ハンドル領域
    }
    
    console.log('バー: ドラッグ開始');
    const offset = clickX - barLeft;
    setDragOffset(offset);
    setIsDraggingBar(true);
  };

  const updateTime = useCallback((clientX: number, isStart: boolean) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const minutes = Math.round((percent / 100) * totalMinutes + minHour * 60);
    
    // 15分単位に丸める（最小値と最大値を考慮）
    let roundedMinutes = Math.round(minutes / 15) * 15;
    roundedMinutes = Math.max(minHour * 60, Math.min((maxHour * 60), roundedMinutes));
    
    // 最新の値を取得（propsから直接取得）
    const currentStartMinutes = timeToMinutes(startTime);
    const currentEndMinutes = timeToMinutes(endTime);
    
    console.log('updateTime:', { 
      isStart, 
      clientX, 
      rectLeft: rect.left,
      rectWidth: rect.width,
      percent, 
      minutes, 
      roundedMinutes, 
      currentStartMinutes, 
      currentEndMinutes,
      startTime,
      endTime
    });
    
    if (isStart) {
      // 開始時間は終了時間より30分以上前でなければならない
      const maxStartMinutes = currentEndMinutes - 30;
      let newStartMinutes = Math.min(roundedMinutes, maxStartMinutes);
      // 最小値チェック
      newStartMinutes = Math.max(minHour * 60, newStartMinutes);
      
      // 開始時間が実際に変更された場合のみ更新
      if (newStartMinutes !== currentStartMinutes) {
        const newStartTime = minutesToTime(newStartMinutes);
        console.log('開始時間更新:', { 
          newStartTime, 
          newStartMinutes, 
          maxStartMinutes,
          roundedMinutes,
          currentStartMinutes,
          minHour: minHour * 60
        });
        onChange(newStartTime, endTime);
      } else {
        console.log('開始時間変更なし:', { newStartMinutes, currentStartMinutes });
      }
    } else {
      // 終了時間は開始時間より30分以上後でなければならない
      const minEndMinutes = currentStartMinutes + 30;
      let newEndMinutes = Math.max(roundedMinutes, minEndMinutes);
      // 最大値チェック
      newEndMinutes = Math.min((maxHour * 60), newEndMinutes);
      
      // 終了時間が実際に変更された場合のみ更新
      if (newEndMinutes !== currentEndMinutes) {
        const newEndTime = minutesToTime(newEndMinutes);
        console.log('終了時間更新:', { 
          newEndTime, 
          newEndMinutes, 
          minEndMinutes,
          roundedMinutes,
          currentEndMinutes,
          maxHour: maxHour * 60
        });
        onChange(startTime, newEndTime);
      } else {
        console.log('終了時間変更なし:', { newEndMinutes, currentEndMinutes });
      }
    }
  }, [totalMinutes, minHour, maxHour, timeToMinutes, minutesToTime, onChange, startTime, endTime]);

  const updateBarPosition = useCallback((clientX: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((clientX - dragOffset - rect.left) / rect.width) * 100));
    const minutes = Math.round((percent / 100) * totalMinutes + minHour * 60);
    
    // 15分単位に丸める
    const roundedMinutes = Math.round(minutes / 15) * 15;
    
    const currentStartMinutes = timeToMinutes(startTime);
    const currentEndMinutes = timeToMinutes(endTime);
    const duration = currentEndMinutes - currentStartMinutes;
    
    const newStartMinutes = Math.max(minHour * 60, Math.min(roundedMinutes, (maxHour * 60) - duration));
    const newEndMinutes = newStartMinutes + duration;
    
    const newStartTime = minutesToTime(newStartMinutes);
    const newEndTime = minutesToTime(newEndMinutes);
    
    onChange(newStartTime, newEndTime);
  }, [totalMinutes, minHour, maxHour, timeToMinutes, minutesToTime, onChange, startTime, endTime, dragOffset]);

  useEffect(() => {
    if (!isDraggingStart && !isDraggingEnd && !isDraggingBar) {
      return;
    }

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      
      if (isDraggingStart) {
        console.log('🔄 開始ハンドルドラッグ中:', clientX);
        updateTime(clientX, true);
      } else if (isDraggingEnd) {
        updateTime(clientX, false);
      } else if (isDraggingBar) {
        updateBarPosition(clientX);
      }
    };

    const handleMouseUp = () => {
      console.log('🛑 ドラッグ終了');
      setIsDraggingStart(false);
      setIsDraggingEnd(false);
      setIsDraggingBar(false);
      setDragOffset(0);
    };

    console.log('📌 イベントリスナー登録:', { isDraggingStart, isDraggingEnd, isDraggingBar });
    
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove, { passive: false });
    document.addEventListener('touchend', handleMouseUp);
    
    return () => {
      console.log('🗑️ イベントリスナー削除');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingStart, isDraggingEnd, isDraggingBar, updateTime, updateBarPosition]);

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
          {/* 開始ハンドル（バーの前に配置） */}
          <div
            data-handle="start"
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-12 h-16 bg-blue-600 border-3 border-white rounded-lg shadow-lg cursor-ew-resize transition-all hover:scale-110 flex items-center justify-center select-none',
              isDraggingStart && 'scale-125 bg-blue-700 ring-2 ring-blue-300 z-50',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            style={{ 
              left: `${startPercent}%`, 
              transform: 'translate(-50%, -50%)',
              zIndex: 30,
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              pointerEvents: disabled ? 'none' : 'auto'
            }}
            onMouseDown={handleStartHandleMouseDown}
            onTouchStart={(e) => {
              if (disabled) return;
              e.preventDefault();
              e.stopPropagation();
              console.log('開始ハンドルタッチ開始');
              setIsDraggingStart(true);
            }}
          >
            <div className="flex flex-col gap-0.5 pointer-events-none">
              <div className="w-1 h-1.5 bg-white rounded"></div>
              <div className="w-1 h-1.5 bg-white rounded"></div>
              <div className="w-1 h-1.5 bg-white rounded"></div>
            </div>
          </div>

          {/* 選択範囲のバー */}
          <div
            className={cn(
              'absolute h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded transition-all',
              !disabled && 'cursor-move hover:from-blue-500 hover:to-blue-700',
              isDraggingBar && 'ring-2 ring-blue-300 ring-offset-2',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
              zIndex: 1,
              pointerEvents: isDraggingStart || isDraggingEnd ? 'none' : 'auto'
            }}
            onMouseDown={handleBarMouseDown}
          >
            {/* 時間表示 */}
            <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm pointer-events-none">
              {startTime.substring(0, 5)} - {endTime.substring(0, 5)}
            </div>
          </div>

          {/* 終了ハンドル（バーの後に配置） */}
          <div
            data-handle="end"
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-10 h-14 bg-blue-600 border-3 border-white rounded-lg shadow-lg cursor-ew-resize transition-all hover:scale-110 flex items-center justify-center',
              isDraggingEnd && 'scale-125 bg-blue-700',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            style={{ 
              left: `${endPercent}%`, 
              transform: 'translate(-50%, -50%)',
              zIndex: 30
            }}
            onMouseDown={handleEndHandleMouseDown}
          >
            <div className="flex flex-col gap-0.5 pointer-events-none">
              <div className="w-1 h-1.5 bg-white rounded"></div>
              <div className="w-1 h-1.5 bg-white rounded"></div>
              <div className="w-1 h-1.5 bg-white rounded"></div>
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

