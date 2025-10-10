
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Patient } from "@/hooks/usePatients";

interface PatientCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Omit<Patient, "id" | "created_at" | "updated_at">) => void;
}

export const PatientCreateDialog = ({
  isOpen,
  onClose,
  onSave
}: PatientCreateDialogProps) => {
  const [formData, setFormData] = useState({
    patient_name: "",
    email: "",
    phone: "",
    age: 0,
    address: "",
    medical_history: "",
    allergies: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      age: formData.age || undefined,
      email: formData.email || undefined,
      address: formData.address || undefined,
      medical_history: formData.medical_history || undefined,
      allergies: formData.allergies || undefined,
      emergency_contact_name: formData.emergency_contact_name || undefined,
      emergency_contact_phone: formData.emergency_contact_phone || undefined,
      notes: formData.notes || undefined,
    });
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setFormData({
      patient_name: "",
      email: "",
      phone: "",
      age: 0,
      address: "",
      medical_history: "",
      allergies: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      notes: ""
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新しい患者を登録</DialogTitle>
          <DialogDescription>
            新しい患者の詳細情報を入力してください。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="patient_name">患者名 *</Label>
                <Input
                  id="patient_name"
                  value={formData.patient_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, patient_name: e.target.value }))}
                  placeholder="患者名を入力"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="age">年齢</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  max="150"
                  value={formData.age || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                  placeholder="年齢を入力"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">電話番号 *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="090-1234-5678"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">住所</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="住所を入力"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="emergency_contact_name">緊急連絡先（氏名）</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                  placeholder="緊急連絡先の氏名"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="emergency_contact_phone">緊急連絡先（電話番号）</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                  placeholder="緊急連絡先の電話番号"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="medical_history">既往歴</Label>
              <Textarea
                id="medical_history"
                value={formData.medical_history}
                onChange={(e) => setFormData(prev => ({ ...prev, medical_history: e.target.value }))}
                placeholder="既往歴を入力してください"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="allergies">アレルギー</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                placeholder="アレルギー情報を入力してください"
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">備考</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="その他の情報を入力してください"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="submit">
              登録
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
