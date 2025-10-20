import { format, getDay, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isToday, isTomorrow } from 'date-fns';
import { ja } from 'date-fns/locale';

export interface BusinessDayInfo {
  type: 'business' | 'saturday' | 'closed';
  label: string;
  color: {
    bg: string;
    text: string;
    border: string;
  };
  days: number[]; // その月の該当する日にちの配列
}

export const getBusinessDayColors = () => ({
  'business': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-400'
  },
  'saturday': {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-400'
  },
  'closed': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-400'
  }
});

export const getBusinessDayLabels = () => ({
  'business': '営業日',
  'saturday': '土曜営業',
  'closed': '休み'
});

export const getMonthlyBusinessDays = (year: number, month: number) => {
  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(new Date(year, month - 1));
  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  const businessDays: { [key: string]: number[] } = {
    'business': [],
    'saturday': [],
    'closed': []
  };

  monthDays.forEach(day => {
    const dayOfWeek = getDay(day);
    const dayNumber = day.getDate();

    // 土曜日は特別に分離
    if (dayOfWeek === 6) {
      businessDays['saturday'].push(dayNumber);
    }
    // 営業日判定（月、火、水、金）
    else if ([1, 2, 3, 5].includes(dayOfWeek)) {
      businessDays['business'].push(dayNumber);
    }
    // 日曜日は休み
    else if (dayOfWeek === 0) {
      businessDays['closed'].push(dayNumber);
    }
    // 木曜日（基本休診、祝日週は営業）
    else if (dayOfWeek === 4) {
      // 祝日チェック（簡易版）
      const hasHoliday = checkHolidayInWeek(day);
      if (hasHoliday) {
        businessDays['business'].push(dayNumber);
      } else {
        businessDays['closed'].push(dayNumber);
      }
    }
  });

  return businessDays;
};

// 祝日チェック（簡易版）
const checkHolidayInWeek = (date: Date): boolean => {
  // 実際の実装では、より詳細な祝日判定が必要
  // ここでは簡易的に月の第3週の木曜日を祝日週として扱う
  const weekOfMonth = Math.ceil(date.getDate() / 7);
  return weekOfMonth === 3;
};

export const formatBusinessDaysDisplay = (businessDays: { [key: string]: number[] }) => {
  const labels = getBusinessDayLabels();
  const colors = getBusinessDayColors();
  
  return Object.entries(businessDays).map(([type, days]) => ({
    type: type as keyof typeof labels,
    label: labels[type as keyof typeof labels],
    color: colors[type as keyof typeof colors],
    days: days.sort((a, b) => a - b),
    displayText: days.length > 0 ? `${days.join('、')}日` : 'なし'
  })).filter(item => item.days.length > 0);
};

export const getCalendarModifiers = (year: number, month: number) => {
  const businessDays = getMonthlyBusinessDays(year, month);
  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(new Date(year, month - 1));
  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  const modifiers: { [key: string]: Date[] } = {
    business: [],
    saturday: [],
    closed: []
  };

  monthDays.forEach(day => {
    const dayNumber = day.getDate();

    if (businessDays['business'].includes(dayNumber)) {
      modifiers.business.push(day);
    } else if (businessDays['saturday'].includes(dayNumber)) {
      modifiers.saturday.push(day);
    } else if (businessDays['closed'].includes(dayNumber)) {
      modifiers.closed.push(day);
    }
  });

  return modifiers;
};

export const getCalendarModifierStyles = () => {
  const colors = getBusinessDayColors();
  
  return {
    business: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      border: '2px solid #3b82f6',
      fontWeight: 'bold'
    },
    saturday: {
      backgroundColor: '#fed7aa',
      color: '#c2410c',
      border: '2px solid #fb923c',
      fontWeight: 'bold'
    },
    closed: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      border: '2px solid #ef4444',
      fontWeight: 'bold'
    }
  };
};

// 営業状況を判定する関数
export interface BusinessStatus {
  isOpen: boolean;
  message: string;
  nextOpenMessage?: string;
}

export const getCurrentBusinessStatus = (): BusinessStatus => {
  const now = new Date();
  const today = now;
  const tomorrow = addDays(today, 1);
  const dayOfWeek = getDay(today);
  
  // 現在の営業状況を判定
  let isCurrentlyOpen = false;
  let todayMessage = '';
  
  // 今日の営業状況
  if (dayOfWeek === 0) { // 日曜日
    todayMessage = '本日はお休み';
    isCurrentlyOpen = false;
  } else if (dayOfWeek === 6) { // 土曜日
    todayMessage = '本日は土曜営業（9:00〜12:30 / 14:00〜17:30）';
    isCurrentlyOpen = true;
  } else if (dayOfWeek === 1) { // 月曜日
    todayMessage = '本日は午前休診（15:00〜19:00）';
    isCurrentlyOpen = true;
  } else if ([2, 3, 5].includes(dayOfWeek)) { // 火・水・金曜日
    todayMessage = '本日は営業中（10:00〜13:30 / 15:00〜19:00）';
    isCurrentlyOpen = true;
  } else if (dayOfWeek === 4) { // 木曜日
    todayMessage = '本日はお休み';
    isCurrentlyOpen = false;
  }
  
  // 明日の営業状況
  const tomorrowDayOfWeek = getDay(tomorrow);
  let nextOpenMessage = '';
  
  if (!isCurrentlyOpen) {
    if (tomorrowDayOfWeek === 0) { // 明日が日曜日
      nextOpenMessage = '次は明日営業（月曜日 15:00〜19:00）';
    } else if (tomorrowDayOfWeek === 6) { // 明日が土曜日
      nextOpenMessage = '次は明日営業（土曜日 9:00〜12:30）';
    } else if (tomorrowDayOfWeek === 1) { // 明日が月曜日
      nextOpenMessage = '次は明日営業（月曜日 15:00〜19:00）';
    } else if ([2, 3, 5].includes(tomorrowDayOfWeek)) { // 明日が火・水・金曜日
      nextOpenMessage = '次は明日営業（10:00〜13:30 / 15:00〜19:00）';
    } else if (tomorrowDayOfWeek === 4) { // 明日が木曜日
      // 明後日が金曜日なので
      nextOpenMessage = '次はあさって営業（金曜日 10:00〜13:30）';
    }
  }
  
  return {
    isOpen: isCurrentlyOpen,
    message: todayMessage,
    nextOpenMessage: !isCurrentlyOpen ? nextOpenMessage : undefined
  };
};
