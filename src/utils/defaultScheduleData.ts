// デフォルトの診療日スケジュールデータ
export const defaultScheduleData = [
  // 月曜日（午前中休診）
  {
    day_of_week: 1, // 月曜日
    start_time: "15:00:00",
    end_time: "19:00:00", 
    is_available: true
  },
  
  // 火曜日
  {
    day_of_week: 2, // 火曜日
    start_time: "10:00:00",
    end_time: "13:30:00",
    is_available: true
  },
  {
    day_of_week: 2,
    start_time: "15:00:00", 
    end_time: "19:00:00",
    is_available: true
  },
  
  // 水曜日
  {
    day_of_week: 3, // 水曜日
    start_time: "10:00:00",
    end_time: "13:30:00",
    is_available: true
  },
  {
    day_of_week: 3,
    start_time: "15:00:00",
    end_time: "19:00:00", 
    is_available: true
  },
  
  // 木曜日（休診）
  {
    day_of_week: 4, // 木曜日
    start_time: "00:00:00",
    end_time: "00:00:00",
    is_available: false
  },
  
  // 金曜日
  {
    day_of_week: 5, // 金曜日
    start_time: "10:00:00",
    end_time: "13:30:00",
    is_available: true
  },
  {
    day_of_week: 5,
    start_time: "15:00:00",
    end_time: "19:00:00",
    is_available: true
  },
  
  // 土曜日
  {
    day_of_week: 6, // 土曜日
    start_time: "09:00:00", 
    end_time: "12:30:00",
    is_available: true
  },
  {
    day_of_week: 6,
    start_time: "14:00:00",
    end_time: "17:30:00",
    is_available: true
  },
  
  // 日曜日（基本休診）
  {
    day_of_week: 0, // 日曜日
    start_time: "00:00:00",
    end_time: "00:00:00", 
    is_available: false
  }
];

/**
 * デフォルトスケジュールをデータベースに登録（拡張版）
 */
export const ensureDefaultSchedule = async () => {
  const { supabase } = await import("@/integrations/supabase/client");
  
  try {
    console.log("🔍 ensureDefaultSchedule 開始");
    
    // 現在の日付から向こう6ヶ月分のスケジュールを作成
    const currentDate = new Date();
    const monthsToCreate = [];
    
    for (let i = 0; i < 6; i++) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      monthsToCreate.push({
        year: targetDate.getFullYear(),
        month: targetDate.getMonth() + 1
      });
    }
    
    console.log("🔍 作成対象月:", monthsToCreate);
    
    // 各年月について既存スケジュールを確認し、不足分を作成
    for (const { year, month } of monthsToCreate) {
      const { data: existingSchedules, error: selectError } = await supabase
        .from("clinic_schedules")
        .select("day_of_week, start_time, end_time")
        .eq("year", year)
        .eq("month", month);
      
      if (selectError) {
        console.error(`${year}年${month}月のスケジュール確認エラー:`, selectError);
        continue;
      }
      
      // その年月のスケジュールが存在しない場合のみ作成
      if (!existingSchedules || existingSchedules.length === 0) {
        console.log(`🔍 ${year}年${month}月のデフォルトスケジュールを登録します...`);
        
        const scheduleDataWithYearMonth = defaultScheduleData.map(schedule => ({
          ...schedule,
          year,
          month
        }));
        
        console.log(`🔍 登録予定のスケジュールデータ:`, scheduleDataWithYearMonth);
        
        const { error: insertError } = await supabase
          .from("clinic_schedules") 
          .insert(scheduleDataWithYearMonth);
        
        if (insertError) {
          console.error(`❌ ${year}年${month}月のスケジュール登録エラー:`, insertError);
          continue;
        }
        
        console.log(`✅ ${year}年${month}月のデフォルトスケジュールを登録しました`);
      } else {
        console.log(`🔍 ${year}年${month}月のスケジュールは既に存在します:`, existingSchedules.length, "件");
      }
    }
    
  } catch (error) {
    console.error("デフォルトスケジュール確保エラー:", error);
  }
}; 