import { format, getDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale';

export interface BusinessDayInfo {
  type: 'business' | 'closed';
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
  'closed': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-400'
  }
});

export const getBusinessDayLabels = () => ({
  'business': '営業日',
  'closed': '休み'
});

export const getMonthlyBusinessDays = (year: number, month: number) => {
  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(new Date(year, month - 1));
  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  const businessDays: { [key: string]: number[] } = {
    'business': [],
    'closed': []
  };

  monthDays.forEach(day => {
    const dayOfWeek = getDay(day);
    const dayNumber = day.getDate();

    // 営業日判定（土曜日も含む）
    if ([1, 2, 3, 5, 6].includes(dayOfWeek)) {
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
    closed: []
  };

  monthDays.forEach(day => {
    const dayNumber = day.getDate();

    if (businessDays['business'].includes(dayNumber)) {
      modifiers.business.push(day);
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
    closed: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      border: '2px solid #ef4444',
      fontWeight: 'bold'
    }
  };
};
