// AI予約解析ユーティリティ
export interface ParsedBookingData {
  date?: {
    year: number;
    month: number;
    day: number;
  };
  time?: {
    hour: number;
    minute: number;
  };
  treatment?: string;
  patientName?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface BookingIntent {
  type: 'new_booking' | 'modify_booking' | 'cancel_booking' | 'view_schedule' | 'consultation';
  confidence: number;
  extractedData: ParsedBookingData;
}

/**
 * 自然言語から予約情報を解析する
 */
export class AIBookingParser {
  private static readonly DATE_PATTERNS = [
    // 12月25日, 12/25, 12-25
    /(\d{1,2})[月\/\-](\d{1,2})日?/,
    // 今日, 明日, 明後日
    /(今日|明日|明後日)/,
    // 来週, 来月
    /(来週|来月)/,
    // 相対的な日付表現
    /(\d+)日後/,
    /(\d+)週間後/,
  ];

  private static readonly TIME_PATTERNS = [
    // 14:30, 14時30分
    /(\d{1,2}):(\d{2})/,
    /(\d{1,2})時(\d{2})分?/,
    // 午前・午後
    /(午前|午後)(\d{1,2})時/,
    // 時間帯
    /(朝|昼|夕方|夜)(\d{1,2})時?/,
  ];

  private static readonly TREATMENT_PATTERNS = [
    // 具体的な治療名
    /(虫歯|むし歯|カリエス)/,
    /(定期検診|検診)/,
    /(クリーニング|PMTC)/,
    /(ホワイトニング|漂白)/,
    /(矯正|歯列矯正)/,
    /(インプラント)/,
    /(入れ歯|義歯)/,
    /(根管治療|神経治療)/,
    /(抜歯)/,
    /(詰め物|被せ物)/,
    /(歯周病治療)/,
    /(予防歯科)/,
    /(審美歯科)/,
  ];

  private static readonly INTENT_PATTERNS = {
    new_booking: [
      /予約.*(したい|取りたい|お願い)/,
      /(予約|取りたい|取りたいです)/,
      /(時間|空いてる)/,
      /(取れる|可能)/,
    ],
    modify_booking: [
      /(変更|変更したい|変更お願い)/,
      /(時間.*変更|日時.*変更)/,
      /(ずらしたい|遅らせたい)/,
    ],
    cancel_booking: [
      /(キャンセル|取り消し|中止)/,
      /(やめる|止める)/,
    ],
    view_schedule: [
      /(空き|空いてる|予約可能)/,
      /(スケジュール|予定)/,
      /(いつ.*可能|どの時間)/,
    ],
    consultation: [
      /(相談|悩み|心配)/,
      /(痛い|痛み)/,
      /(どうしたら|アドバイス)/,
    ],
  };

  /**
   * 自然言語メッセージから予約意図を解析
   */
  static parseBookingIntent(message: string): BookingIntent {
    const lowerMessage = message.toLowerCase();
    
    // 意図の判定
    let detectedIntent: BookingIntent['type'] = 'new_booking';
    let maxConfidence = 0;

    for (const [intent, patterns] of Object.entries(this.INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(lowerMessage)) {
          const confidence = this.calculateConfidence(lowerMessage, pattern);
          if (confidence > maxConfidence) {
            maxConfidence = confidence;
            detectedIntent = intent as BookingIntent['type'];
          }
        }
      }
    }

    // データの抽出
    const extractedData = this.extractBookingData(message);

    return {
      type: detectedIntent,
      confidence: maxConfidence,
      extractedData,
    };
  }

  /**
   * メッセージから予約データを抽出
   */
  static extractBookingData(message: string): ParsedBookingData {
    const data: ParsedBookingData = {};

    // 日付の抽出
    data.date = this.extractDate(message);
    
    // 時間の抽出
    data.time = this.extractTime(message);
    
    // 治療内容の抽出
    data.treatment = this.extractTreatment(message);
    
    // 患者名の抽出（簡易版）
    data.patientName = this.extractPatientName(message);
    
    // 電話番号の抽出
    data.phone = this.extractPhone(message);
    
    // メールアドレスの抽出
    data.email = this.extractEmail(message);

    return data;
  }

  /**
   * 日付の抽出
   */
  private static extractDate(message: string): ParsedBookingData['date'] {
    const currentDate = new Date();
    
    for (const pattern of this.DATE_PATTERNS) {
      const match = message.match(pattern);
      if (match) {
        if (pattern.source.includes('今日|明日|明後日')) {
          const relativeDay = match[1];
          const daysToAdd = relativeDay === '今日' ? 0 : 
                           relativeDay === '明日' ? 1 : 2;
          
          const targetDate = new Date(currentDate);
          targetDate.setDate(currentDate.getDate() + daysToAdd);
          
          return {
            year: targetDate.getFullYear(),
            month: targetDate.getMonth() + 1,
            day: targetDate.getDate(),
          };
        } else if (pattern.source.includes('月')) {
          const month = parseInt(match[1]);
          const day = parseInt(match[2]);
          
          return {
            year: currentDate.getFullYear(),
            month,
            day,
          };
        }
      }
    }
    
    return undefined;
  }

  /**
   * 時間の抽出
   */
  private static extractTime(message: string): ParsedBookingData['time'] {
    for (const pattern of this.TIME_PATTERNS) {
      const match = message.match(pattern);
      if (match) {
        if (pattern.source.includes(':')) {
          // 14:30 形式
          return {
            hour: parseInt(match[1]),
            minute: parseInt(match[2]),
          };
        } else if (pattern.source.includes('時')) {
          // 14時30分 形式
          const hour = parseInt(match[1]);
          const minute = match[2] ? parseInt(match[2]) : 0;
          return { hour, minute };
        } else if (pattern.source.includes('午前|午後')) {
          // 午前10時, 午後2時 形式
          const period = match[1];
          const hour = parseInt(match[2]);
          const adjustedHour = period === '午後' && hour !== 12 ? hour + 12 : hour;
          return { hour: adjustedHour, minute: 0 };
        }
      }
    }
    
    return undefined;
  }

  /**
   * 治療内容の抽出
   */
  private static extractTreatment(message: string): string | undefined {
    for (const pattern of this.TREATMENT_PATTERNS) {
      const match = message.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return undefined;
  }

  /**
   * 患者名の抽出（簡易版）
   */
  private static extractPatientName(message: string): string | undefined {
    // 簡単なパターンマッチング
    const namePattern = /(私|僕|俺)は(.+?)です/;
    const match = message.match(namePattern);
    return match ? match[2] : undefined;
  }

  /**
   * 電話番号の抽出
   */
  private static extractPhone(message: string): string | undefined {
    const phonePattern = /(\d{3}[-.\s]?\d{4}[-.\s]?\d{4}|\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{4})/;
    const match = message.match(phonePattern);
    return match ? match[1] : undefined;
  }

  /**
   * メールアドレスの抽出
   */
  private static extractEmail(message: string): string | undefined {
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const match = message.match(emailPattern);
    return match ? match[1] : undefined;
  }

  /**
   * パターンマッチングの信頼度を計算
   */
  private static calculateConfidence(message: string, pattern: RegExp): number {
    const matches = message.match(new RegExp(pattern, 'g'));
    if (!matches) return 0;
    
    // マッチした回数と文字列の長さに基づいて信頼度を計算
    const matchLength = matches.join('').length;
    const messageLength = message.length;
    
    return Math.min(1.0, (matchLength / messageLength) * 2);
  }

  /**
   * 抽出したデータを検証
   */
  static validateBookingData(data: ParsedBookingData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.date) {
      const { year, month, day } = data.date;
      const date = new Date(year, month - 1, day);
      
      if (date < new Date()) {
        errors.push('過去の日付は指定できません');
      }
      
      if (month < 1 || month > 12) {
        errors.push('月は1-12の範囲で指定してください');
      }
      
      if (day < 1 || day > 31) {
        errors.push('日は1-31の範囲で指定してください');
      }
    }

    if (data.time) {
      const { hour, minute } = data.time;
      
      if (hour < 0 || hour > 23) {
        errors.push('時間は0-23の範囲で指定してください');
      }
      
      if (minute < 0 || minute > 59) {
        errors.push('分は0-59の範囲で指定してください');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 予約データを人間が読みやすい形式に変換
   */
  static formatBookingData(data: ParsedBookingData): string {
    const parts: string[] = [];

    if (data.date) {
      parts.push(`📅 ${data.date.year}年${data.date.month}月${data.date.day}日`);
    }

    if (data.time) {
      parts.push(`🕐 ${data.time.hour}:${data.time.minute.toString().padStart(2, '0')}`);
    }

    if (data.treatment) {
      parts.push(`🦷 ${data.treatment}`);
    }

    if (data.patientName) {
      parts.push(`👤 ${data.patientName}様`);
    }

    return parts.join('\n');
  }
}

