
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Mail, Phone, MapPin, FileText, AlertTriangle, User, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ja } from "date-fns/locale";
import { Patient } from "@/hooks/usePatients";

interface PatientDetailDialogProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PatientDetailDialog = ({
  patient,
  isOpen,
  onClose
}: PatientDetailDialogProps) => {
  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {patient.patient_name}の詳細情報
          </DialogTitle>
          <DialogDescription>
            患者の詳細情報と履歴を確認できます。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>患者名</span>
                  </div>
                  <p className="font-medium">{patient.patient_name}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>年齢</span>
                  </div>
                  <p className="font-medium">{patient.age ? `${patient.age}歳` : "未設定"}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>電話番号</span>
                  </div>
                  <p className="font-medium">{patient.phone}</p>
                </div>

                {patient.email && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>メールアドレス</span>
                    </div>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                )}

                {patient.address && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>住所</span>
                    </div>
                    <p className="font-medium">{patient.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 緊急連絡先 */}
          {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">緊急連絡先</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.emergency_contact_name && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>氏名</span>
                    </div>
                    <p className="font-medium">{patient.emergency_contact_name}</p>
                  </div>
                )}

                {patient.emergency_contact_phone && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>電話番号</span>
                    </div>
                    <p className="font-medium">{patient.emergency_contact_phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 医療情報 */}
          {(patient.medical_history || patient.allergies) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">医療情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.medical_history && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>既往歴</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{patient.medical_history}</p>
                    </div>
                  </div>
                )}

                {patient.allergies && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>アレルギー</span>
                    </div>
                    <div className="p-3 bg-red-50 rounded-md border border-red-200">
                      <p className="text-sm whitespace-pre-wrap text-red-800">{patient.allergies}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 備考 */}
          {patient.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">備考</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{patient.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 登録情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">登録情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>登録日時:</span>
                <span>{format(new Date(patient.created_at), "yyyy年MM月dd日 HH:mm", { locale: ja })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>最終更新:</span>
                <span>{formatDistanceToNow(new Date(patient.updated_at), { addSuffix: true, locale: ja })}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
