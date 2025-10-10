
import { Search, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PatientSyncButton } from "./PatientSyncButton";

interface PatientSearchCardProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreatePatient: () => void;
  onSyncComplete: () => void;
}

export const PatientSearchCard = ({ 
  searchQuery, 
  onSearchChange, 
  onCreatePatient,
  onSyncComplete
}: PatientSearchCardProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>患者検索・登録</CardTitle>
        <CardDescription>
          患者名、メールアドレス、電話番号で検索できます。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="患者名、メールアドレス、または電話番号を入力"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={onCreatePatient}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            新規患者登録
          </Button>
        </div>
        <div className="flex justify-end">
          <PatientSyncButton onSyncComplete={onSyncComplete} />
        </div>
      </CardContent>
    </Card>
  );
};
