
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Trash2, Mail, Phone, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Patient } from "@/hooks/usePatients";

interface PatientListProps {
  patients: Patient[];
  onPatientView: (patient: Patient) => void;
  onPatientEdit: (patient: Patient) => void;
  onPatientDelete: (patient: Patient) => void;
}

export const PatientList = ({ 
  patients, 
  onPatientView, 
  onPatientEdit, 
  onPatientDelete 
}: PatientListProps) => {
  console.log("PatientList: 受け取った患者データ:", patients);
  console.log("PatientList: 患者データ数:", patients?.length || 0);

  if (!patients || patients.length === 0) {
    console.log("PatientList: 患者データが空です");
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">患者が見つかりませんでした</p>
        <p className="text-sm text-gray-500 mt-2">
          新規患者登録ボタンから患者情報を追加してください
        </p>
      </div>
    );
  }

  console.log("PatientList: テーブルを表示します");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>患者名</TableHead>
          <TableHead>年齢</TableHead>
          <TableHead>連絡先</TableHead>
          <TableHead>住所</TableHead>
          <TableHead>登録日</TableHead>
          <TableHead className="text-center">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => {
          console.log("PatientList: 患者データをレンダリング:", patient.patient_name);
          return (
            <TableRow key={patient.id}>
              <TableCell className="font-medium">
                {patient.patient_name}
              </TableCell>
              <TableCell>
                {patient.age ? `${patient.age}歳` : "未設定"}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {patient.email && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      {patient.email}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Phone className="h-3 w-3" />
                    {patient.phone}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {patient.address || "未設定"}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {formatDistanceToNow(new Date(patient.created_at), {
                    addSuffix: true,
                    locale: ja,
                  })}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPatientView(patient)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    詳細
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPatientEdit(patient)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    編集
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPatientDelete(patient)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    削除
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
