
import { useToast } from "@/hooks/use-toast";

interface AppointmentData {
  patient_name: string;
  phone: string;
  email: string;
  age: number;
  notes?: string;
  treatment_name: string;
  fee: number;
  reservation_type: string;
  preferredDates: Array<{
    date: string;
    timeSlot: string;
  }>;
}

export const useAppointmentValidation = () => {
  const { toast } = useToast();

  const validateAppointmentData = (data: AppointmentData): boolean => {
    console.log("予約データを作成中:", data);

    // 予約日時のバリデーション
    if (!data.preferredDates || data.preferredDates.length === 0) {
      throw new Error("予約希望日時を選択してください");
    }

    // メールアドレスの基本的なバリデーション
    if (!data.email || !data.email.includes('@')) {
      throw new Error("有効なメールアドレスを入力してください");
    }

    return true;
  };

  const getTreatmentType = (treatmentName: string): string => {
    if (treatmentName.includes('初診相談')) return '初診相談';
    if (treatmentName.includes('精密検査')) return '精密検査';
    if (treatmentName.includes('ホワイトニング')) return 'ホワイトニング';
    if (treatmentName.includes('PMTC')) return 'PMTC';
    return 'その他';
  };

  const getReservationLimitMessage = (treatmentType: string): string => {
    switch (treatmentType) {
      case '初診相談':
        return '初診相談は1回のみ予約可能です。既に予約済みです。';
      case '精密検査':
        return '精密検査は1回のみ予約可能です。既に予約済みです。';
      case 'ホワイトニング':
        return 'ホワイトニングは1回のみ予約可能です。既に予約済みです。';
      case 'PMTC':
        return 'PMTCは2回まで予約可能です。既に上限に達しています。';
      default:
        return '予約上限に達しています。';
    }
  };

  return {
    validateAppointmentData,
    getTreatmentType,
    getReservationLimitMessage
  };
};
