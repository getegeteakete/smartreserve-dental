
/**
 * 時間を日本語形式でフォーマット（0分の場合は分を省略）
 * 例: 12:00 -> "12時", 12:30 -> "12時30分"
 */
export const formatTimeJapanese = (timeString: string): string => {
  try {
    // 時間文字列から時と分を抽出
    let hours = 0;
    let minutes = 0;
    
    // 様々な時間フォーマットに対応
    if (timeString.includes(':')) {
      const timeParts = timeString.split(':');
      if (timeParts.length >= 2) {
        hours = parseInt(timeParts[0], 10);
        minutes = parseInt(timeParts[1], 10);
      }
    }
    
    // 0分の場合は分を省略、それ以外は分も表示
    if (minutes === 0) {
      return `${hours}時`;
    } else {
      return `${hours}時${minutes.toString().padStart(2, '0')}分`;
    }
  } catch (error) {
    console.error("時間フォーマットエラー:", error);
    return timeString;
  }
};

/**
 * タイムスロットから時間を抽出してフォーマット
 */
export const formatTimeSlotJapanese = (timeSlot: string): string => {
  try {
    // "2025-06-16-16:30:00" 形式の場合
    if (timeSlot.includes('-') && timeSlot.includes(':')) {
      const parts = timeSlot.split('-');
      if (parts.length >= 4) {
        const timePart = parts[parts.length - 1];
        return formatTimeJapanese(timePart);
      }
    }
    
    // "16:30:00" や "16:30" 形式の場合
    if (timeSlot.includes(':')) {
      return formatTimeJapanese(timeSlot);
    }
    
    return timeSlot;
  } catch (error) {
    console.error("タイムスロットフォーマットエラー:", error);
    return timeSlot;
  }
};

/**
 * 日時を日本語形式でフォーマット（改良版）- 時差問題を解決
 */
export const formatDateTimeJapanese = (date: string, timeSlot: string): string => {
  try {
    // 日付文字列をローカル時間として解釈するため、時間を00:00:00で固定
    const dateObj = new Date(date + 'T00:00:00');
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const weekday = dateObj.toLocaleDateString('ja-JP', { weekday: 'long' });
    
    const timeFormatted = formatTimeSlotJapanese(timeSlot);
    
    return `${year}年${month}月${day}日（${weekday}）${timeFormatted}`;
  } catch (error) {
    console.error("日時フォーマットエラー:", error);
    return `${date} ${timeSlot}`;
  }
};
