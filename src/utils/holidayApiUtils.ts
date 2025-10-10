import { format } from "date-fns";

interface HolidayResponse {
  [date: string]: string; // "2024-01-01": "元日"
}

let holidayCache: HolidayResponse | null = null;
let cacheYear: number | null = null;

/**
 * 日本の祝日APIから祝日データを取得
 * https://holidays-jp.github.io/
 */
export const fetchJapaneseHolidays = async (year: number): Promise<HolidayResponse> => {
  // キャッシュがあり、同じ年の場合はキャッシュを返す
  if (holidayCache && cacheYear === year) {
    return holidayCache;
  }

  try {
    const response = await fetch(`https://holidays-jp.github.io/api/v1/${year}/date.json`);
    if (!response.ok) {
      throw new Error(`祝日API取得失敗: ${response.status}`);
    }
    
    const holidays: HolidayResponse = await response.json();
    
    // キャッシュに保存
    holidayCache = holidays;
    cacheYear = year;
    
    console.log(`${year}年の祝日データを取得:`, Object.keys(holidays).length, '件');
    return holidays;
  } catch (error) {
    console.error("祝日API取得エラー:", error);
    // エラー時は空のオブジェクトを返す（祝日なしとして扱う）
    return {};
  }
};

/**
 * 指定日が祝日かどうかを判定
 */
export const isJapaneseHoliday = async (date: Date): Promise<boolean> => {
  const year = date.getFullYear();
  const dateString = format(date, 'yyyy-MM-dd');
  
  try {
    const holidays = await fetchJapaneseHolidays(year);
    return dateString in holidays;
  } catch (error) {
    console.error("祝日判定エラー:", error);
    return false;
  }
};

/**
 * 指定日の祝日名を取得
 */
export const getHolidayName = async (date: Date): Promise<string | null> => {
  const year = date.getFullYear();
  const dateString = format(date, 'yyyy-MM-dd');
  
  try {
    const holidays = await fetchJapaneseHolidays(year);
    return holidays[dateString] || null;
  } catch (error) {
    console.error("祝日名取得エラー:", error);
    return null;
  }
};