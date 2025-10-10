
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { syncPatientsFromAppointments } from "@/utils/patientSyncUtils";
import { useToast } from "@/hooks/use-toast";

interface PatientSyncButtonProps {
  onSyncComplete: () => void;
}

export const PatientSyncButton = ({ onSyncComplete }: PatientSyncButtonProps) => {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncPatientsFromAppointments();
      toast({
        title: "同期完了",
        description: "予約データから患者情報を同期しました",
      });
      onSyncComplete();
    } catch (error) {
      console.error("同期エラー:", error);
      toast({
        title: "同期エラー",
        description: "患者データの同期に失敗しました",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={syncing}
      variant="outline"
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "同期中..." : "予約から同期"}
    </Button>
  );
};
