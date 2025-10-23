
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppointmentCalendar from "@/components/appointment/AppointmentCalendar";
import AppointmentForm from "@/components/appointment/AppointmentForm";
import AppointmentInfo from "@/components/appointment/AppointmentInfo";
import BookingHeader from "@/components/appointment/BookingHeader";
import BookingInfo from "@/components/appointment/BookingInfo";
import TreatmentDisplay from "@/components/appointment/TreatmentDisplay";
import { Toaster } from "@/components/ui/sonner";
import { useBookingForm } from "@/hooks/useBookingForm";
import { AIBookingParser } from "@/utils/aiBookingParser";
import Header from "@/components/Header";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import FixedMenuBanner from "@/components/FixedMenuBanner";
import BusinessStatusBanner from "@/components/BusinessStatusBanner";
import { AlertCircle, ArrowDown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Booking() {
  const location = useLocation();
  const patientFormRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const treatmentSelectionRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToCalendar, setHasScrolledToCalendar] = useState(false);
  
  const {
    formData,
    setFormData,
    preferredDates,
    selectedTreatment,
    setSelectedTreatment,
    fee,
    isValid,
    isLoading,
    handleDateSelect,
    handleTimeSlotSelect,
    handleSubmit,
    selectedTreatmentData,
  } = useBookingForm();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 診療メニューページから遷移してきた場合、カレンダーへスクロール（1回だけ）
  useEffect(() => {
    const stateData = location.state;
    // treatmentDataがある場合（診療メニューページから遷移）かつまだスクロールしていない場合
    if (stateData && (stateData.treatmentId || stateData.treatmentData) && selectedTreatmentData && !hasScrolledToCalendar) {
      // 少し遅延させてから、カレンダーへスクロール
      const timer = setTimeout(() => {
        scrollToCalendar();
        setHasScrolledToCalendar(true); // スクロール完了をマーク
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [selectedTreatmentData, location.state, hasScrolledToCalendar]);

  // 名前入力欄へスクロールする関数
  const scrollToPatientForm = () => {
    setTimeout(() => {
      if (patientFormRef.current) {
        patientFormRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 300);
  };

  // カレンダーへスクロールする関数（診療メニュー確定後用）
  const scrollToCalendar = () => {
    setTimeout(() => {
      if (calendarRef.current) {
        calendarRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      } else {
        // フォールバック: ページ上部へ
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 300);
  };

  // 診療内容選択セクションへスクロールする関数
  const scrollToTreatmentSelection = () => {
    setTimeout(() => {
      if (treatmentSelectionRef.current) {
        treatmentSelectionRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  // AIからの予約データは各フックで処理されるため、ここでは削除

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 pt-16 bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <BookingHeader />
          
          <BookingInfo />
          
          <TreatmentDisplay treatmentData={selectedTreatmentData} />

          {/* 診療内容未選択時の警告 */}
          {!selectedTreatment && (
            <Alert className="border-amber-500 bg-amber-50 mb-8">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-800 font-semibold">診療内容を選択してください</AlertTitle>
              <AlertDescription className="text-amber-700 mt-2">
                予約を進めるには、まず診療内容を選択する必要があります。
                <div className="mt-3">
                  <Button
                    type="button"
                    onClick={scrollToTreatmentSelection}
                    className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
                  >
                    <ArrowDown className="h-4 w-4" />
                    診療内容を選ぶ
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

        <form onSubmit={handleSubmit} className="pointer-events-auto space-y-8">
          {/* Calendar section */}
          <div ref={calendarRef} className="w-full scroll-mt-20">
            <AppointmentCalendar
              preferredDates={preferredDates}
              onDateSelect={handleDateSelect}
              onTimeSlotSelect={handleTimeSlotSelect}
              userEmail={formData.email}
              selectedTreatment={selectedTreatment}
              treatmentData={selectedTreatmentData}
              onScrollToPatientForm={scrollToPatientForm}
            />
          </div>

          {/* Booking form section */}
          <div ref={patientFormRef} className="w-full max-w-2xl mx-auto space-y-6 scroll-mt-20">
            <div ref={treatmentSelectionRef} className="scroll-mt-20">
              <AppointmentForm
                formData={formData}
                onFormChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
                selectedTreatment={selectedTreatment}
                onTreatmentSelect={setSelectedTreatment}
                fee={fee}
                treatmentData={selectedTreatmentData}
                onScrollToTop={scrollToCalendar}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 pointer-events-auto h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  予約処理中...
                </div>
              ) : !selectedTreatment ? (
                "診療メニューを選択してください"
              ) : (
                "予約を確定する"
              )}
            </Button>
            
            {!selectedTreatment && (
              <p className="text-center text-sm text-amber-600">
                ※ 診療メニューを選択して確定してください
              </p>
            )}

            <AppointmentInfo />
          </div>
        </form>
        
        <Toaster position="bottom-right" />
        </div>
      </div>

      {/* ページトップへ戻るボタン */}
      <ScrollToTopButton />
      
      {/* 固定メニューバナー - 一時的に無効化 */}
      {/* <FixedMenuBanner /> */}
      
      {/* 営業状況バナー（モバイルのみ） - 一時的に無効化 */}
      {/* <BusinessStatusBanner /> */}
    </div>
  );
}
