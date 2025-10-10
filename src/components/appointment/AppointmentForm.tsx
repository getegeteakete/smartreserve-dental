
import { useState } from "react";
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
}

const AppointmentForm = ({
  formData,
  onFormChange,
  selectedTreatment,
  onTreatmentSelect,
  fee,
  treatmentData,
}: AppointmentFormProps) => {
  return (
    <div className="space-y-6">
      <TreatmentSelection
        selectedTreatment={selectedTreatment}
        onTreatmentSelect={onTreatmentSelect}
        fee={fee}
        treatmentData={treatmentData}
      />

      <div className="space-y-2">
        <Label htmlFor="patient_name">お名前 *</Label>
        <Input
          id="patient_name"
          type="text"
          value={formData.patient_name}
          onChange={(e) => onFormChange({ patient_name: e.target.value })}
          placeholder="山田 太郎"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>ご予約者名義 *</Label>
        <RadioGroup
          value={formData.reservation_type}
          onValueChange={(value) => onFormChange({ reservation_type: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="self" id="self" />
            <Label htmlFor="self">ご本人</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="child" id="child" />
            <Label htmlFor="child">お子様</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="age">年齢 *</Label>
        <Input
          id="age"
          type="number"
          value={formData.age}
          onChange={(e) => onFormChange({ age: e.target.value })}
          placeholder="25"
          required
          min="1"
          max="150"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">電話番号 *</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => onFormChange({ phone: e.target.value })}
          placeholder="090-1234-5678"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onFormChange({ email: e.target.value })}
          placeholder="example@email.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">その他・ご要望</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => onFormChange({ notes: e.target.value })}
          placeholder="ご質問やご要望があればお書きください"
          rows={3}
        />
      </div>
    </div>
  );
};

export default AppointmentForm;
