
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export const formatDate = (dateString: string) => {
  try {
    // 日付文字列をローカル時間として解釈するため、時間部分を固定
    const date = new Date(dateString + 'T00:00:00');
    return format(date, "yyyy年MM月dd日(E)", { locale: ja });
  } catch (error) {
    return dateString;
  }
};

/**
 * 時間を日本語形式でフォーマット（0分の場合は分を省略）
 */
const formatTimeJapanese = (timeString: string): string => {
  try {
    let hours = 0;
    let minutes = 0;
    
    if (timeString.includes(':')) {
      const timeParts = timeString.split(':');
      if (timeParts.length >= 2) {
        hours = parseInt(timeParts[0], 10);
        minutes = parseInt(timeParts[1], 10);
      }
    }
    
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

export const formatDateTime = (dateString: string, timeString: string) => {
  try {
    console.log("フォーマット前の日付:", dateString, "時間:", timeString);
    
    // 日付文字列を直接解析して時差問題を完全に回避
    let dateOnly = dateString;
    if (dateString.includes('T')) {
      dateOnly = dateString.split('T')[0];
    }
    
    // 日付文字列を直接解析
    const dateParts = dateOnly.split('-');
    if (dateParts.length !== 3) {
      console.error("無効な日付形式:", dateOnly);
      return `${dateString} ${timeString}`;
    }
    
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);
    
    // 曜日を取得するために一時的にDateオブジェクトを作成（JST固定）
    const tempDate = new Date(year, month - 1, day);
    const weekday = tempDate.toLocaleDateString('ja-JP', { weekday: 'long' });
    
    let timeFormatted = '';
    if (timeString) {
      console.log("Formatting time string:", timeString);
      
      if (timeString.includes('-') && timeString.includes(':')) {
        const parts = timeString.split('-');
        if (parts.length >= 4) {
          const timePart = parts[parts.length - 1];
          timeFormatted = formatTimeJapanese(timePart);
        }
      }
      else if (timeString.includes(':') && !timeString.includes('T') && !timeString.includes(' ')) {
        timeFormatted = formatTimeJapanese(timeString);
      }
      else if (timeString.includes('T')) {
        const timeDate = new Date(timeString);
        const hours = timeDate.getHours();
        const minutes = timeDate.getMinutes();
        timeFormatted = formatTimeJapanese(`${hours}:${minutes}`);
      }
      else if (timeString.includes(' ') && timeString.includes(':')) {
        const parts = timeString.split(' ');
        if (parts.length === 2) {
          const timePart = parts[1];
          timeFormatted = formatTimeJapanese(timePart);
        }
      }
    }
    
    const formattedResult = `${year}年${month}月${day}日（${weekday}）${timeFormatted}`;
    console.log("フォーマット後の結果:", formattedResult);
    
    return formattedResult;
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return `${dateString} ${timeString}`;
  }
};

export const formatTimeSlot = (timeSlot: string) => {
  if (!timeSlot) return '';
  
  console.log("Formatting time slot:", timeSlot);
  
  if (timeSlot.includes('-') && timeSlot.includes(':')) {
    const parts = timeSlot.split('-');
    if (parts.length >= 4) {
      const timePart = parts[parts.length - 1];
      return formatTimeJapanese(timePart);
    }
  }
  
  if (timeSlot.includes(':') && !timeSlot.includes('T') && !timeSlot.includes(' ')) {
    return formatTimeJapanese(timeSlot);
  }
  
  if (timeSlot.includes('T')) {
    try {
      const date = new Date(timeSlot);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return formatTimeJapanese(`${hours}:${minutes}`);
    } catch (error) {
      console.error("Error formatting datetime:", error);
    }
  }
  
  return timeSlot;
};
