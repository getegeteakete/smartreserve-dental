
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PatientManagementHeaderProps {
  onBackToAdmin: () => void;
  onLogout: () => void;
}

export const PatientManagementHeader = ({ 
  onBackToAdmin, 
  onLogout 
}: PatientManagementHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onBackToAdmin}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          管理画面に戻る
        </Button>
        <h1 className="text-2xl font-bold">患者情報管理</h1>
      </div>
      <Button variant="outline" onClick={onLogout}>
        ログアウト
      </Button>
    </div>
  );
};
