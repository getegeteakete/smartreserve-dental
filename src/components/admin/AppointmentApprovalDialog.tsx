
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { checkConfirmedTimeConflict } from "@/utils/treatmentReservationUtils";

interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  email: string;
  treatment_name: string;
  fee: number;
}

interface AppointmentPreference {
  id: string;
  preference_order: number;
  preferred_date: string;
  preferred_time_slot: string;
}

interface AppointmentApprovalDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function AppointmentApprovalDialog({
  appointment,
  open,
  onOpenChange,
  onComplete,
}: AppointmentApprovalDialogProps) {
  const [preferences, setPreferences] = useState<AppointmentPreference[]>([]);
  const [selectedPreference, setSelectedPreference] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (appointment && open) {
      fetchPreferences();
    }
  }, [appointment, open]);

  const fetchPreferences = async () => {
    if (!appointment) return;

    const { data, error } = await supabase
      .from("appointment_preferences")
      .select("*")
      .eq("appointment_id", appointment.id)
      .order("preference_order");

    if (error) {
      console.error("予約希望日時の取得エラー:", error);
      return;
    }

    setPreferences(data);
  };

  const handleApprove = async () => {
    if (!appointment || !selectedPreference) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "承認する日時を選択してください",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const preference = preferences.find(p => p.id === selectedPreference);
      if (!preference) return;

      // 確定済み予約との重複チェック
      const { canConfirm, error: conflictError } = await checkConfirmedTimeConflict(
        appointment.email,
        preference.preferred_date,
        preference.preferred_time_slot,
        appointment.id
      );

      if (conflictError || !canConfirm) {
        toast({
          variant: "destructive",
          title: "予約重複エラー",
          description: "この患者様は同じ日時に既に別の確定予約があります。別の日時を選択してください。",
        });
        setIsLoading(false);
        return;
      }

      // 予約を確定状態に更新
      const { error: updateError } = await supabase
        .from("appointments")
        .update({
          status: 'confirmed',
          confirmed_date: preference.preferred_date,
          confirmed_time_slot: preference.preferred_time_slot
        })
        .eq("id", appointment.id);

      if (updateError) {
        throw updateError;
      }

      // 予約確定メールを送信
      const emailData = {
        patientName: appointment.patient_name,
        patientEmail: appointment.email,
        phone: appointment.phone,
        treatmentName: appointment.treatment_name,
        fee: appointment.fee,
        confirmedDate: preference.preferred_date,
        confirmedTimeSlot: preference.preferred_time_slot
      };

      console.log("確定メール送信開始（AppointmentApprovalDialog）:", emailData);

      const emailResponse = await supabase.functions.invoke('send-confirmation-email', {
        body: emailData
      });

      console.log("確定メール送信レスポンス（全体）:", emailResponse);

      if (emailResponse.error) {
        console.error("確定メール送信エラー（詳細）:", emailResponse.error);
        console.error("エラーデータ:", emailResponse.data);
        toast({
          title: "予約確定完了",
          description: `予約が確定されましたが、確定メールの送信に失敗しました。エラー: ${emailResponse.error.message || 'Unknown error'}`,
          variant: "destructive",
        });
      } else {
        console.log("確定メール送信成功（詳細）:", emailResponse.data);
        const result = emailResponse.data;
        if (result?.patientEmailId && result?.adminEmailId) {
          toast({
            title: "予約確定完了",
            description: "予約が確定され、患者様と管理者に確定メールを送信しました。",
          });
        } else if (result?.patientEmailId) {
          toast({
            title: "予約確定完了（一部エラー）",
            description: "予約が確定され、患者様にメールを送信しました。管理者メールの送信に失敗した可能性があります。",
            variant: "destructive",
          });
        } else {
          toast({
            title: "予約確定完了（メール送信エラー）",
            description: "予約が確定されましたが、メール送信に問題がありました。患者様に直接ご連絡ください。",
            variant: "destructive",
          });
        }
      }

      onComplete();
    } catch (error: any) {
      console.error("予約確定エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "予約の確定に失敗しました",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>予約承認</DialogTitle>
          <DialogDescription>
            {appointment?.patient_name}様の予約を承認します。希望日時から1つを選択してください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">予約詳細</h4>
            <div className="bg-gray-50 p-3 rounded">
              <p><strong>患者名:</strong> {appointment?.patient_name}</p>
              <p><strong>電話番号:</strong> {appointment?.phone}</p>
              <p><strong>診療内容:</strong> {appointment?.treatment_name}</p>
              <p><strong>料金:</strong> ¥{appointment?.fee?.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">希望日時</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">選択</TableHead>
                  <TableHead>希望順位</TableHead>
                  <TableHead>日付</TableHead>
                  <TableHead>時間</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preferences.map((preference) => (
                  <TableRow key={preference.id}>
                    <TableCell>
                      <input
                        type="radio"
                        name="selectedPreference"
                        value={preference.id}
                        checked={selectedPreference === preference.id}
                        onChange={(e) => setSelectedPreference(e.target.value)}
                      />
                    </TableCell>
                    <TableCell>第{preference.preference_order}希望</TableCell>
                    <TableCell>
                      {new Date(preference.preferred_date).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </TableCell>
                    <TableCell>{preference.preferred_time_slot}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button 
              onClick={handleApprove} 
              disabled={!selectedPreference || isLoading}
            >
              {isLoading ? "承認中..." : "予約を確定する"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
