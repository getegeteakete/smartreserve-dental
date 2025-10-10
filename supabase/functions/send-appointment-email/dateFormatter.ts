
export const formatTimeJapanese = (timeString: string): string => {
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
      return `${hours}時${minutes}分`;
    }
  } catch (error) {
    console.error("時間フォーマットエラー:", error);
    return timeString;
  }
};

export const formatPreferredDateTime = (dateString: string, timeSlot: string) => {
  try {
    console.log("フォーマット前の日付:", dateString, "時間:", timeSlot);
    
    // ISO日付文字列から日付部分のみを抽出
    let dateOnly = dateString;
    if (dateString.includes('T')) {
      dateOnly = dateString.split('T')[0];
    }
    
    // 日付文字列を直接解析して時差問題を完全に回避
    const dateParts = dateOnly.split('-');
    if (dateParts.length !== 3) {
      console.error("無効な日付形式:", dateOnly);
      return `${dateOnly} ${timeSlot}`;
    }
    
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);
    
    // 曜日を取得するために一時的にDateオブジェクトを作成（JST固定）
    const tempDate = new Date(year, month - 1, day);
    const weekday = tempDate.toLocaleDateString('ja-JP', { weekday: 'long' });
    
    // タイムスロットのフォーマット処理
    let timeFormatted = '';
    if (timeSlot && timeSlot.trim()) {
      if (timeSlot.includes('-')) {
        const parts = timeSlot.split('-');
        if (parts.length >= 4) {
          const timePart = parts[3];
          timeFormatted = formatTimeJapanese(timePart);
        } else {
          timeFormatted = timeSlot;
        }
      } else if (timeSlot.includes(':')) {
        timeFormatted = formatTimeJapanese(timeSlot);
      } else {
        timeFormatted = timeSlot;
      }
    } else {
      timeFormatted = "時間未定";
    }
    
    const formattedResult = `${year}年${month}月${day}日（${weekday}）${timeFormatted}`;
    console.log("フォーマット後の結果:", formattedResult);
    
    return formattedResult;
  } catch (error) {
    console.error("日時フォーマットエラー:", error);
    return `${dateString} ${timeSlot}`;
  }
};
