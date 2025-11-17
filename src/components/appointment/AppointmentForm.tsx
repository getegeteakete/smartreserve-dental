
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import TreatmentSelection from "./TreatmentSelection";

interface AppointmentFormProps {
  formData: {
    patient_name: string;
    phone: string;
    email: string;
    age: string;
    notes: string;
    reservation_type: string;
  };
  onFormChange: (data: any) => void;
  selectedTreatment: string | undefined;
  onTreatmentSelect: (treatment: string) => void;
  fee: number;
  treatmentData?: {
    id: string;
    name: string;
    fee: number;
    duration: number;
    description?: string;
  };
  onScrollToTop?: () => void;
  isValid?: boolean; // フォームの有効性（送信ボタンがクリックされた時にエラーを表示するために使用）
}

const AppointmentForm = ({
  formData,
  onFormChange,
  selectedTreatment,
  onTreatmentSelect,
  fee,
  treatmentData,
  onScrollToTop,
  isValid = true,
}: AppointmentFormProps) => {
  // フィールドが一度でもフォーカスされたか、または空でないかを追跡
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [shouldShowErrors, setShouldShowErrors] = useState(false);

  // フォームが無効な場合（送信が試みられたがバリデーションに失敗した場合）、すべてのエラーを表示
  useEffect(() => {
    if (isValid === false) {
      setShouldShowErrors(true);
    }
  }, [isValid]);

  // 必須フィールドの未入力チェック
  const isFieldEmpty = (value: string) => !value || value.trim() === '';
  
  const patientNameEmpty = isFieldEmpty(formData.patient_name);
  const ageEmpty = isFieldEmpty(formData.age);
  const phoneEmpty = isFieldEmpty(formData.phone);
  const emailEmpty = isFieldEmpty(formData.email);
  const reservationTypeEmpty = isFieldEmpty(formData.reservation_type);

  // フィールドがフォーカスされた時にマーク
  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    setShouldShowErrors(true);
  };

  // エラーを表示するかどうかの判定（フィールドが空で、かつフォーカスされたことがある、または送信が試みられた場合）
  const shouldShowError = (fieldName: string, isEmpty: boolean) => {
    return isEmpty && (touchedFields[fieldName] || shouldShowErrors);
  };

  return (
    <div className="space-y-8">
      <TreatmentSelection
        selectedTreatment={selectedTreatment}
        onTreatmentSelect={onTreatmentSelect}
        fee={fee}
        treatmentData={treatmentData}
        onScrollToTop={onScrollToTop}
      />

      {/* 患者情報セクション */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          患者情報
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="patient_name" className="text-sm font-medium text-slate-700">お名前 *</Label>
            <Input
              id="patient_name"
              type="text"
              value={formData.patient_name}
              onChange={(e) => onFormChange({ patient_name: e.target.value })}
              onBlur={() => handleFieldBlur('patient_name')}
              placeholder="山田 太郎"
              required
              className={`h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 ${shouldShowError('patient_name', patientNameEmpty) ? 'border-red-300' : ''}`}
            />
            {shouldShowError('patient_name', patientNameEmpty) && (
              <p className="text-red-500 text-sm mt-1">※入力してください</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="age" className="text-sm font-medium text-slate-700">年齢 *</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => onFormChange({ age: e.target.value })}
              onBlur={() => handleFieldBlur('age')}
              placeholder="25"
              required
              min="1"
              max="150"
              className={`h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 ${shouldShowError('age', ageEmpty) ? 'border-red-300' : ''}`}
            />
            {shouldShowError('age', ageEmpty) && (
              <p className="text-red-500 text-sm mt-1">※入力してください</p>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <Label className="text-sm font-medium text-slate-700">ご予約者名義 *</Label>
          <RadioGroup
            value={formData.reservation_type}
            onValueChange={(value) => {
              onFormChange({ reservation_type: value });
              handleFieldBlur('reservation_type');
            }}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <RadioGroupItem value="self" id="self" className="text-blue-600" />
              <Label htmlFor="self" className="text-slate-700 cursor-pointer">ご本人</Label>
            </div>
            <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <RadioGroupItem value="child" id="child" className="text-blue-600" />
              <Label htmlFor="child" className="text-slate-700 cursor-pointer">お子様</Label>
            </div>
          </RadioGroup>
          {shouldShowError('reservation_type', reservationTypeEmpty) && (
            <p className="text-red-500 text-sm mt-1">※入力してください</p>
          )}
        </div>
      </div>

      {/* 連絡先情報セクション */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          連絡先情報
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-700">電話番号 *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => onFormChange({ phone: e.target.value })}
              onBlur={() => handleFieldBlur('phone')}
              placeholder="090-1234-5678"
              required
              className={`h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 ${shouldShowError('phone', phoneEmpty) ? 'border-red-300' : ''}`}
            />
            {shouldShowError('phone', phoneEmpty) && (
              <p className="text-red-500 text-sm mt-1">※入力してください</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">メールアドレス *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onFormChange({ email: e.target.value })}
              onBlur={() => handleFieldBlur('email')}
              placeholder="example@email.com"
              required
              className={`h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 ${shouldShowError('email', emailEmpty) ? 'border-red-300' : ''}`}
            />
            {shouldShowError('email', emailEmpty) && (
              <p className="text-red-500 text-sm mt-1">※入力してください</p>
            )}
          </div>
        </div>
      </div>

      {/* その他・ご要望セクション */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          その他・ご要望
        </h3>
        
        <div className="space-y-3">
          <Label htmlFor="notes" className="text-sm font-medium text-slate-700">ご質問やご要望があればお書きください</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => onFormChange({ notes: e.target.value })}
            placeholder="ご質問やご要望があればお書きください"
            rows={4}
            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
