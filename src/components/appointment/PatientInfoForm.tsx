
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PatientInfoFormData {
  patient_name: string;
  phone: string;
  email: string;
  age: string;
  notes: string;
  reservation_type: string;
}

interface PatientInfoFormProps {
  formData: PatientInfoFormData;
  onFormChange: (data: Partial<PatientInfoFormData>) => void;
  validationErrors: Record<string, string>;
  onFieldValidate: (name: string, value: string) => void;
}

const PatientInfoForm = ({
  formData,
  onFormChange,
  validationErrors,
  onFieldValidate,
}: PatientInfoFormProps) => {
  const handleInputChange = (name: string, value: string) => {
    onFormChange({ [name]: value });
    
    // 入力中のリアルタイムバリデーション（エラーがある場合のみ）
    if (validationErrors[name]) {
      onFieldValidate(name, value);
    }
  };

  const handleBlur = (name: string, value: string) => {
    // フォーカスが外れたときに必ずバリデーション
    onFieldValidate(name, value);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">
          お名前 <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="山田 太郎"
          value={formData.patient_name}
          onChange={(e) => handleInputChange('patient_name', e.target.value)}
          onBlur={() => handleBlur('patient_name', formData.patient_name)}
          className={`mt-1 pointer-events-auto ${validationErrors.patient_name ? 'border-red-500' : ''}`}
          required
        />
        {validationErrors.patient_name && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.patient_name}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">
          ご予約者名確認 <span className="text-red-500">*</span>
        </label>
        <RadioGroup
          value={formData.reservation_type}
          onValueChange={(value) => onFormChange({ reservation_type: value })}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="self" id="self" />
            <Label htmlFor="self" className="cursor-pointer">ご本人</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="child" id="child" />
            <Label htmlFor="child" className="cursor-pointer">子供</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div>
        <label className="text-sm font-medium">
          年齢 <span className="text-red-500">*</span>
        </label>
        <Input
          type="number"
          placeholder="25"
          value={formData.age}
          onChange={(e) => handleInputChange('age', e.target.value)}
          onBlur={() => handleBlur('age', formData.age)}
          className={`mt-1 pointer-events-auto ${validationErrors.age ? 'border-red-500' : ''}`}
          required
        />
        {validationErrors.age && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.age}</p>
        )}
      </div>
      
      <div>
        <label className="text-sm font-medium">
          電話番号 <span className="text-red-500">*</span>
        </label>
        <Input
          type="tel"
          placeholder="090-1234-5678"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          onBlur={() => handleBlur('phone', formData.phone)}
          className={`mt-1 pointer-events-auto ${validationErrors.phone ? 'border-red-500' : ''}`}
          required
        />
        {validationErrors.phone && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
        )}
      </div>
      
      <div>
        <label className="text-sm font-medium">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <Input
          type="email"
          placeholder="example@email.com"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          onBlur={() => handleBlur('email', formData.email)}
          className={`mt-1 pointer-events-auto ${validationErrors.email ? 'border-red-500' : ''}`}
          required
        />
        {validationErrors.email && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          ※予約確認メールをお送りします
        </p>
      </div>
      
      <div>
        <label className="text-sm font-medium">備考</label>
        <Textarea
          placeholder="その他ご要望等があればご記入ください"
          value={formData.notes}
          onChange={(e) => onFormChange({ notes: e.target.value })}
          className="mt-1 pointer-events-auto"
        />
      </div>
    </div>
  );
};

export default PatientInfoForm;
