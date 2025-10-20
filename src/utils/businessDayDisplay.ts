import { format, getDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale';

export interface BusinessDayInfo {
  type: 'full-open' | 'saturday-open' | 'morning-closed' | 'special-open' | 'closed';
  label: string;
  color: {
    bg: string;
    text: string;
    border: string;
  };
  days: number[]; // その月の該当する日にちの配列
}

export const getBusinessDayColors = () => ({
  'full-open': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-400'
  },
  'saturday-open': {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-400'
  },
  'morning-closed': {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-400'
  },
  'special-open': {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-400'
  },
  'closed': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-400'
  }
});

export const getBusinessDayLabels = () => ({
  'full-open': '終日営業',
  'saturday-open': '土曜営業',
  'morning-closed': '午前休診',
  'special-open': '特別営業',
  'closed': '休診'
});

export const getMonthlyBusinessDays = (year: number, month: number) => {
  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(new Date(year, month - 1));
  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  const businessDays: { [key: string]: number[] } = {
    'full-open': [],
    'saturday-open': [],
    'morning-closed': [],
    'special-open': [],
    'closed': []
  };

  monthDays.forEach(day => {
    const dayOfWeek = getDay(day);
    const dayNumber = day.getDate();

    // 土曜日
    if (dayOfWeek === 6) {
      businessDays['saturday-open'].push(dayNumber);
    }
    // 日曜日
    else if (dayOfWeek === 0) {
      businessDays['closed'].push(dayNumber);
    }
    // 月曜日（午前休診）
    else if (dayOfWeek === 1) {
      businessDays['morning-closed'].push(dayNumber);
    }
    // 火・水・金（終日営業）
    else if ([2, 3, 5].includes(dayOfWeek)) {
      businessDays['full-open'].push(dayNumber);
    }
    // 木曜日（基本休診、祝日週は営業）
    else if (dayOfWeek === 4) {
      // 祝日チェック（簡易版）
      const hasHoliday = checkHolidayInWeek(day);
      if (hasHoliday) {
        businessDays['full-open'].push(dayNumber);
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
    fullOpen: [],
    saturdayOpen: [],
    morningClosed: [],
    specialOpen: [],
    closed: []
  };

  monthDays.forEach(day => {
    const dayNumber = day.getDate();
    const dayOfWeek = getDay(day);

    if (businessDays['full-open'].includes(dayNumber)) {
      modifiers.fullOpen.push(day);
    } else if (businessDays['saturday-open'].includes(dayNumber)) {
      modifiers.saturdayOpen.push(day);
    } else if (businessDays['morning-closed'].includes(dayNumber)) {
      modifiers.morningClosed.push(day);
    } else if (businessDays['special-open'].includes(dayNumber)) {
      modifiers.specialOpen.push(day);
    } else if (businessDays['closed'].includes(dayNumber)) {
      modifiers.closed.push(day);
    }
  });

  return modifiers;
};

export const getCalendarModifierStyles = () => {
  const colors = getBusinessDayColors();
  
  return {
    fullOpen: {
      backgroundColor: colors['full-open'].bg.replace('bg-', '#').replace('-50', ''),
      color: colors['full-open'].text.replace('text-', '#').replace('-700', ''),
      border: `2px solid ${colors['full-open'].border.replace('border-', '#').replace('-400', '')}`,
      fontWeight: 'bold'
    },
    saturdayOpen: {
      backgroundColor: colors['saturday-open'].bg.replace('bg-', '#').replace('-50', ''),
      color: colors['saturday-open'].text.replace('text-', '#').replace('-700', ''),
      border: `2px solid ${colors['saturday-open'].border.replace('border-', '#').replace('-400', '')}`,
      fontWeight: 'bold'
    },
    morningClosed: {
      backgroundColor: colors['morning-closed'].bg.replace('bg-', '#').replace('-50', ''),
      color: colors['morning-closed'].text.replace('text-', '#').replace('-700', ''),
      border: `2px solid ${colors['morning-closed'].border.replace('border-', '#').replace('-400', '')}`,
      fontWeight: 'bold'
    },
    specialOpen: {
      backgroundColor: colors['special-open'].bg.replace('bg-', '#').replace('-50', ''),
      color: colors['special-open'].text.replace('text-', '#').replace('-700', ''),
      border: `2px solid ${colors['special-open'].border.replace('border-', '#').replace('-400', '')}`,
      fontWeight: 'bold'
    },
    closed: {
      backgroundColor: colors['closed'].bg.replace('bg-', '#').replace('-50', ''),
      color: colors['closed'].text.replace('text-', '#').replace('-700', ''),
      border: `2px solid ${colors['closed'].border.replace('border-', '#').replace('-400', '')}`,
      fontWeight: 'bold'
    }
  };
};
