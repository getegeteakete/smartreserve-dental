
import { Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientList } from "./PatientList";
import { Patient } from "@/hooks/usePatients";

interface PatientStatsCardProps {
  patients: Patient[];
  onPatientView: (patient: Patient) => void;
  onPatientEdit: (patient: Patient) => void;
  onPatientDelete: (patient: Patient) => void;
}

export const PatientStatsCard = ({ 
  patients, 
  onPatientView, 
  onPatientEdit, 
  onPatientDelete 
}: PatientStatsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          患者一覧 ({patients.length}名)
        </CardTitle>
        <CardDescription>
          患者の詳細情報を確認・編集・削除できます。
          {patients.length === 0 && (
            <span className="block mt-2 text-amber-600">
              現在、登録されている患者情報がありません。「新規患者登録」ボタンから患者を追加してください。
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PatientList
          patients={patients}
          onPatientView={onPatientView}
          onPatientEdit={onPatientEdit}
          onPatientDelete={onPatientDelete}
        />
      </CardContent>
    </Card>
  );
};
