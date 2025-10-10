
// 日本の祝日を判定するユーティリティ
export const getJapaneseHolidays = (year: number): Date[] => {
  const holidays: Date[] = [];
  
  // 固定祝日
  holidays.push(new Date(year, 0, 1));   // 元日
  holidays.push(new Date(year, 1, 11));  // 建国記念の日
  holidays.push(new Date(year, 3, 29));  // 昭和の日
  holidays.push(new Date(year, 4, 3));   // 憲法記念日
  holidays.push(new Date(year, 4, 4));   // みどりの日
  holidays.push(new Date(year, 4, 5));   // こどもの日
  holidays.push(new Date(year, 7, 11));  // 山の日
  holidays.push(new Date(year, 10, 3));  // 文化の日
  holidays.push(new Date(year, 10, 23)); // 勤労感謝の日
  
  // 移動祝日の計算（簡略化）
  const secondMondayOfJan = getSecondMondayOfMonth(year, 0);
  const thirdMondayOfJul = getThirdMondayOfMonth(year, 6);
  const thirdMondayOfSep = getThirdMondayOfMonth(year, 8);
  const secondMondayOfOct = getSecondMondayOfMonth(year, 9);
  
  holidays.push(secondMondayOfJan);  // 成人の日
  holidays.push(thirdMondayOfJul);   // 海の日
  holidays.push(thirdMondayOfSep);   // 敬老の日
  holidays.push(secondMondayOfOct);  // 体育の日/スポーツの日
  
  // 春分の日・秋分の日（近似計算）
  const vernalEquinox = new Date(year, 2, Math.floor(20.8431 + 0.242194 * (year - 1851) - Math.floor((year - 1851) / 4)));
  const autumnalEquinox = new Date(year, 8, Math.floor(23.2488 + 0.242194 * (year - 1851) - Math.floor((year - 1851) / 4)));
  
  holidays.push(vernalEquinox);
  holidays.push(autumnalEquinox);
  
  return holidays;
};

const getSecondMondayOfMonth = (year: number, month: number): Date => {
  const firstDay = new Date(year, month, 1);
  const firstMonday = new Date(year, month, 1 + (7 - firstDay.getDay() + 1) % 7);
  return new Date(year, month, firstMonday.getDate() + 7);
};

const getThirdMondayOfMonth = (year: number, month: number): Date => {
  const firstDay = new Date(year, month, 1);
  const firstMonday = new Date(year, month, 1 + (7 - firstDay.getDay() + 1) % 7);
  return new Date(year, month, firstMonday.getDate() + 14);
};

export const isHoliday = (date: Date): boolean => {
  const holidays = getJapaneseHolidays(date.getFullYear());
  return holidays.some(holiday => 
    holiday.getFullYear() === date.getFullYear() &&
    holiday.getMonth() === date.getMonth() &&
    holiday.getDate() === date.getDate()
  );
};

export const hasHolidayInWeek = (date: Date): boolean => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(startOfWeek);
    checkDate.setDate(startOfWeek.getDate() + i);
    if (isHoliday(checkDate)) {
      return true;
    }
  }
  
  return false;
};
