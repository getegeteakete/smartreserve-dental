import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAppointmentTokens } from "@/hooks/useAppointmentTokens";
import { useRebookingValidation } from "@/hooks/booking/useRebookingValidation";
import { supabase } from "@/integrations/supabase/client";

export default function AppointmentCancel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");

  const { validateToken, markTokenAsUsed } = useAppointmentTokens();
  const { cancelAppointmentWithReason } = useRebookingValidation();

  const cancelReasons = [
    "予定の変更",
    "体調不良",
    "別の日程を希望",
    "その他"
  ];

  useEffect(() => {
    const validateAndLoadData = async () => {
      if (!token) {
        setError("無効なアクセスです");
        setIsLoading(false);
        return;
      }

      const validationResult = await validateToken(token);
      if (!validationResult || !validationResult.is_valid) {
        setError(validationResult?.error_message || "アクセス権限がありません");
        setIsLoading(false);
        return;
      }

      if (validationResult.type !== 'cancel') {
        setError("このリンクはキャンセル用ではありません");
        setIsLoading(false);
        return;
      }

      // 予約データを取得
      try {
        const { data: appointment, error: appointmentError } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', validationResult.appointment_id)
          .single();

        if (appointmentError || !appointment) {
          setError("予約情報が見つかりません");
          setIsLoading(false);
          return;
        }

        setAppointmentData(appointment);
        setIsLoading(false);
      } catch (error) {
        console.error("予約データ取得エラー:", error);
        setError("予約情報の取得に失敗しました");
        setIsLoading(false);
      }
    };

    validateAndLoadData();
  }, [token, validateToken]);

  const handleCancel = async () => {
    if (!token || !appointmentData) return;

    setIsProcessing(true);
    try {
      const finalReason = selectedReason === "その他" ? cancelReason : selectedReason;
      
      const success = await cancelAppointmentWithReason(appointmentData.id, finalReason);
      
      if (success) {
        await markTokenAsUsed(token);
        
        // キャンセルメール送信
        await supabase.functions.invoke('send-cancellation-email', {
          body: {
            patientName: appointmentData.patient_name,
            patientEmail: appointmentData.email,
            phone: appointmentData.phone,
            treatmentName: appointmentData.treatment_name,
            appointmentDate: appointmentData.appointment_date,
            cancelledAt: new Date().toISOString(),
            cancelReason: finalReason
          }
        });

        setIsCompleted(true);
      }
    } catch (error) {
      console.error("キャンセル処理エラー:", error);
      setError("キャンセル処理に失敗しました");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">確認中...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <XCircle className="h-5 w-5 mr-2" />
              エラー
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full mt-4"
              variant="outline"
            >
              トップページに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-success">
              <CheckCircle className="h-5 w-5 mr-2" />
              キャンセル完了
            </CardTitle>
            <CardDescription>
              予約のキャンセルが完了しました
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {appointmentData?.patient_name}様の予約をキャンセルいたしました。
                キャンセル確認メールをお送りしています。
              </p>
              <p className="text-muted-foreground">
                またのご利用をお待ちしております。
              </p>
              <Button 
                onClick={() => navigate('/')} 
                className="w-full"
              >
                トップページに戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>予約キャンセル</CardTitle>
          <CardDescription>
            以下の予約をキャンセルしますか？
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {appointmentData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">予約内容</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">お名前:</span>
                  <span>{appointmentData.patient_name}様</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">診療内容:</span>
                  <span>{appointmentData.treatment_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">ステータス:</span>
                  <span className={appointmentData.status === 'confirmed' ? 'text-success' : 'text-warning'}>
                    {appointmentData.status === 'confirmed' ? '確定済み' : '申込み中'}
                  </span>
                </div>
                {appointmentData.confirmed_date && (
                  <div className="flex justify-between">
                    <span className="font-medium">予約日時:</span>
                    <span>{appointmentData.confirmed_date} {appointmentData.confirmed_time_slot}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <Label>キャンセル理由をお選びください</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {cancelReasons.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason} id={reason} />
                  <Label htmlFor={reason}>{reason}</Label>
                </div>
              ))}
            </RadioGroup>

            {selectedReason === "その他" && (
              <div className="space-y-2">
                <Label htmlFor="customReason">詳細をご記入ください</Label>
                <Textarea
                  id="customReason"
                  placeholder="キャンセル理由をご記入ください"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/')}
              disabled={isProcessing}
            >
              戻る
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleCancel}
              disabled={!selectedReason || isProcessing || (selectedReason === "その他" && !cancelReason.trim())}
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              キャンセル確定
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}