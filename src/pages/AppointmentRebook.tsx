import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAppointmentTokens } from "@/hooks/useAppointmentTokens";
import { useRebookingValidation } from "@/hooks/booking/useRebookingValidation";
import { useBookingFormSubmit } from "@/hooks/booking/useBookingFormSubmit";
import { useTreatmentSelection } from "@/hooks/booking/useTreatmentSelection";
import { usePreferredDates } from "@/hooks/booking/usePreferredDates";
import { useTreatments } from "@/hooks/useTreatments";
import { supabase } from "@/integrations/supabase/client";
import AppointmentCalendar from "@/components/appointment/AppointmentCalendar";
import TreatmentDisplay from "@/components/appointment/TreatmentDisplay";

export default function AppointmentRebook() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointmentData, setAppointmentData] = useState<any>(null);

  const { validateToken, markTokenAsUsed } = useAppointmentTokens();
  const { checkRebookingEligibility, cancelExistingPendingAppointments } = useRebookingValidation();
  const { data: treatments } = useTreatments();

  // 再予約用のフォームデータ（元の予約データから初期化）
  const [formData, setFormData] = useState({
    patient_name: "",
    phone: "",
    email: "",
    age: 0,
    notes: ""
  });

  const { selectedTreatment, selectedTreatmentData, setSelectedTreatment } = useTreatmentSelection();
  const { preferredDates, handleDateSelect, handleTimeSlotSelect } = usePreferredDates();

  const { handleSubmit: submitRebooking, isLoading: isSubmitting } = useBookingFormSubmit({
    formData,
    preferredDates,
    selectedTreatment,
    selectedTreatmentData,
    treatments: treatments || [],
    fee: selectedTreatmentData?.fee || 0,
    isValid: true,
    isFormValid: true,
    onSuccess: () => {
      markTokenAsUsed(token!);
      setIsCompleted(true);
    }
  });

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

      if (validationResult.type !== 'rebook') {
        setError("このリンクは再予約用ではありません");
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

        // 再予約可否チェック
        const rebookingStatus = await checkRebookingEligibility(appointment.email);
        if (!rebookingStatus) {
          setError("再予約の確認に失敗しました");
          setIsLoading(false);
          return;
        }

        // 既存のpending予約を自動キャンセル
        if (rebookingStatus.pending_count > 0) {
          await cancelExistingPendingAppointments(appointment.email);
        }

        // フォームデータを元の予約データで初期化
        setFormData({
          patient_name: appointment.patient_name,
          phone: appointment.phone,
          email: appointment.email,
          age: appointment.age || 0,
          notes: appointment.notes || ""
        });

        // 診療内容を設定
        if (appointment.treatment_name && treatments) {
          const treatment = treatments.find(t => t.name === appointment.treatment_name);
          if (treatment) {
            setSelectedTreatment(treatment.id);
          }
        }

        setAppointmentData(appointment);
        setIsLoading(false);
      } catch (error) {
        console.error("予約データ取得エラー:", error);
        setError("予約情報の取得に失敗しました");
        setIsLoading(false);
      }
    };

    if (treatments) {
      validateAndLoadData();
    }
  }, [token, treatments, validateToken, checkRebookingEligibility, cancelExistingPendingAppointments, setSelectedTreatment]);

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
              再予約完了
            </CardTitle>
            <CardDescription>
              再予約の申し込みが完了しました
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {formData.patient_name}様の再予約を受け付けました。
                確認メールをお送りしています。
              </p>
              <p className="text-muted-foreground">
                管理者が確認後、予約確定のご連絡をいたします。
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
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>再予約申し込み</CardTitle>
            <CardDescription>
              新しい希望日時をお選びください
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentData && (
              <Alert className="mb-6">
                <AlertDescription>
                  <strong>{appointmentData.patient_name}様</strong>の再予約を承ります。
                  お名前・連絡先・診療内容は前回と同じ内容で設定されています。
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {selectedTreatmentData && (
              <TreatmentDisplay 
                treatmentData={selectedTreatmentData}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle>患者情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>お名前:</strong> {formData.patient_name}
                  </div>
                  <div>
                    <strong>年齢:</strong> {formData.age}歳
                  </div>
                  <div>
                    <strong>電話番号:</strong> {formData.phone}
                  </div>
                  <div>
                    <strong>メール:</strong> {formData.email}
                  </div>
                </div>
                {formData.notes && (
                  <div>
                    <strong>ご要望・備考:</strong> {formData.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <AppointmentCalendar
              preferredDates={preferredDates}
              onDateSelect={handleDateSelect}
              onTimeSlotSelect={handleTimeSlotSelect}
              userEmail={formData.email}
              selectedTreatment={selectedTreatment}
              treatmentData={selectedTreatmentData}
            />
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button
                className="flex-1"
                onClick={submitRebooking}
                disabled={preferredDates.length === 0 || isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                再予約申し込み
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}