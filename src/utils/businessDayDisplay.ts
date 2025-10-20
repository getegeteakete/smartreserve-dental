import { format, getDay, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isAfter } from 'date-fns';
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

interface BusinessHour {
  start: number;
  end: number;
  isOpen: boolean;
  breakStart?: number;
  breakEnd?: number;
  isMorningClosed?: boolean;
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
export const getTodayBusinessStatus = () => {
  const today = new Date();
  const dayOfWeek = getDay(today);
  const currentHour = today.getHours();
  
  // 基本の営業時間設定（型を統一）

  const businessHours: Record<string, BusinessHour> = {
    monday: { start: 15, end: 19, isOpen: true, isMorningClosed: true },
    tuesday: { start: 10, end: 19.5, isOpen: true, breakStart: 13.5, breakEnd: 15 },
    wednesday: { start: 10, end: 19.5, isOpen: true, breakStart: 13.5, breakEnd: 15 },
    thursday: { start: 10, end: 19.5, isOpen: true, breakStart: 13.5, breakEnd: 15 },
    friday: { start: 10, end: 19.5, isOpen: true, breakStart: 13.5, breakEnd: 15 },
    saturday: { start: 9, end: 17.5, isOpen: true, breakStart: 12.5, breakEnd: 14 },
    sunday: { start: 0, end: 0, isOpen: false }
  };

  const getDayName = (dayOfWeek: number) => {
    switch (dayOfWeek) {
      case 0: return 'sunday';
      case 1: return 'monday';
      case 2: return 'tuesday';
      case 3: return 'wednesday';
      case 4: return 'thursday';
      case 5: return 'friday';
      case 6: return 'saturday';
      default: return 'sunday';
    }
  };

  const todayKey = getDayName(dayOfWeek) as keyof typeof businessHours;
  const todayHours = businessHours[todayKey];

  // 日曜日は基本休診
  if (dayOfWeek === 0) {
    return { isOpen: false, message: '本日はお休み', nextOpen: getNextOpenMessage() };
  }

  // 木曜日は基本休診（祝日週除く）
  if (dayOfWeek === 4 && !checkHolidayInWeek(today)) {
    return { isOpen: false, message: '本日はお休み', nextOpen: getNextOpenMessage() };
  }

  // 営業時間内かチェック
  if (todayHours.isOpen) {
    let isCurrentlyOpen = false;
    
    if (todayKey === 'monday') {
      // 月曜日は午後のみ
      isCurrentlyOpen = currentHour >= todayHours.start && currentHour < todayHours.end;
    } else if (todayKey === 'saturday') {
      // 土曜日は午前と午後に分かれる
      const breakStart = todayHours.breakStart || 12.5;
      const breakEnd = todayHours.breakEnd || 14;
      isCurrentlyOpen = (currentHour >= todayHours.start && currentHour < breakStart) ||
                       (currentHour >= breakEnd && currentHour < todayHours.end);
    } else {
      // 火水金は午前と午後に分かれる
      const breakStart = todayHours.breakStart || 13.5;
      const breakEnd = todayHours.breakEnd || 15;
      isCurrentlyOpen = (currentHour >= todayHours.start && currentHour < breakStart) ||
                       (currentHour >= breakEnd && currentHour < todayHours.end);
    }

    if (isCurrentlyOpen) {
      return { isOpen: true, message: '本日は営業中', nextOpen: null };
    } else {
      // 営業時間外だが営業日
      const nextOpen = getNextOpenTime(today, todayHours, todayKey);
      return { isOpen: false, message: '本日は営業中', nextOpen };
    }
  }

  return { isOpen: false, message: '本日はお休み', nextOpen: getNextOpenMessage() };
};

// 次の営業時間を取得
const getNextOpenTime = (today: Date, todayHours: BusinessHour, todayKey: string): string => {
  const currentHour = today.getHours();
  
  if (todayKey === 'monday') {
    if (currentHour < 15) {
      return '次は15:00から営業';
    }
  } else if (todayKey === 'saturday') {
    if (currentHour < 9) {
      return '次は9:00から営業';
    } else if (currentHour >= 12.5 && currentHour < 14) {
      return '次は14:00から営業';
    }
  } else {
    // 火水金
    if (currentHour < 10) {
      return '次は10:00から営業';
    } else if (currentHour >= 13.5 && currentHour < 15) {
      return '次は15:00から営業';
    }
  }
  
  return getNextOpenMessage();
};

// 次の営業日メッセージを取得
const getNextOpenMessage = (): string => {
  const today = new Date();
  let nextDay = addDays(today, 1);
  
  // 最大7日先までチェック
  for (let i = 1; i <= 7; i++) {
    const dayOfWeek = getDay(nextDay);
    
    if (dayOfWeek === 0) {
      // 日曜日は基本休診
      nextDay = addDays(nextDay, 1);
      continue;
    }
    
    if (dayOfWeek === 4 && !checkHolidayInWeek(nextDay)) {
      // 木曜日は基本休診
      nextDay = addDays(nextDay, 1);
      continue;
    }
    
    // 営業日を見つけた
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const nextDayName = dayNames[dayOfWeek];
    
    if (dayOfWeek === 1) {
      return `次は${nextDayName}曜日15:00から営業`;
    } else {
      return `次は${nextDayName}曜日10:00から営業`;
    }
  }
  
  return '次回営業は未定です';
};
