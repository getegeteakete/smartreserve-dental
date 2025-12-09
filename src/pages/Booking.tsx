
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
  const [maxVisiblePreference, setMaxVisiblePreference] = useState(0); // 最初は第1希望のみ表示
  const [shouldScrollToForm, setShouldScrollToForm] = useState(false); // フォームへのスクロールフラグ
  
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

  // 希望日の選択状況に応じて表示する希望日の数を更新
  useEffect(() => {
    // 第1希望日が選択完了したら、第2希望日を表示
    if (preferredDates[0]?.date && preferredDates[0]?.timeSlot && maxVisiblePreference < 1) {
      setMaxVisiblePreference(1);
    }
    // 第2希望日が選択完了したら、第3希望日とフォームを表示
    if (preferredDates[1]?.date && preferredDates[1]?.timeSlot && maxVisiblePreference < 2) {
      setMaxVisiblePreference(2);
    }
  }, [preferredDates, maxVisiblePreference]);

  // フォーム表示後のスクロール処理
  useEffect(() => {
    if (shouldScrollToForm && maxVisiblePreference >= 2) {
      // フォームが表示された後にスクロール
      const scrollToForm = (retryCount = 0) => {
        // 患者情報セクションを直接検索
        const patientInfoSection = document.getElementById('patient-info-section');
        
        if (patientInfoSection) {
          const headerOffset = 100;
          const elementPosition = patientInfoSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          // スクロール位置を保存
          const targetScrollPosition = offsetPosition;
          
          window.scrollTo({
            top: targetScrollPosition,
            behavior: 'smooth'
          });
          
          // スクロール完了後、スクロール位置を維持し、最初の入力欄にフォーカスを設定
          setTimeout(() => {
            // スクロール位置が変わっていないか確認し、必要に応じて再調整
            const currentScroll = window.pageYOffset;
            if (Math.abs(currentScroll - targetScrollPosition) > 50) {
              window.scrollTo({
                top: targetScrollPosition,
                behavior: 'auto'
              });
            }
            
            // 患者情報セクション内の最初の入力欄にフォーカスを設定（スクロールを防ぐ）
            const firstInput = patientInfoSection.querySelector('input[type="text"]:not([type="hidden"]), input[type="number"]') as HTMLInputElement;
            if (firstInput) {
              firstInput.focus({ preventScroll: true });
              // フォーカス後もスクロール位置を維持
              setTimeout(() => {
                window.scrollTo({
                  top: targetScrollPosition,
                  behavior: 'auto'
                });
              }, 100);
            }
          }, 600);
          
          setShouldScrollToForm(false);
        } else if (retryCount < 5) {
          // 患者情報セクションがまだ表示されていない場合、少し待ってから再試行（最大5回）
          setTimeout(() => {
            scrollToForm(retryCount + 1);
          }, 200);
        } else {
          setShouldScrollToForm(false);
        }
      };
      
      // レンダリング完了を待つ
      setTimeout(() => scrollToForm(), 200);
    }
  }, [shouldScrollToForm, maxVisiblePreference]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 診療メニューページから遷移してきた場合、自動スクロールを無効化
  // useEffect(() => {
  //   const stateData = location.state;
  //   // treatmentDataがある場合（診療メニューページから遷移）かつまだスクロールしていない場合
  //   if (stateData && (stateData.treatmentId || stateData.treatmentData) && selectedTreatmentData && !hasScrolledToCalendar) {
  //     // 少し遅延させてから、カレンダーへスクロール
  //     const timer = setTimeout(() => {
  //       scrollToCalendar();
  //       setHasScrolledToCalendar(true); // スクロール完了をマーク
  //     }, 800);
  //     
  //     return () => clearTimeout(timer);
  //   }
  // }, [selectedTreatmentData, location.state, hasScrolledToCalendar]);

  // 名前入力欄へスクロールする関数
  const scrollToPatientForm = () => {
    // 第2希望が選択完了しているので、フォームを表示するためにmaxVisiblePreferenceを2に設定
    if (preferredDates[1]?.date && preferredDates[1]?.timeSlot) {
      setMaxVisiblePreference(2);
      setShouldScrollToForm(true);
    } else {
      // フォームが既に表示されている場合のフォールバック
      const attemptScroll = (retryCount = 0) => {
        // 患者情報セクションを直接検索
        const patientInfoSection = document.getElementById('patient-info-section');
        
        if (patientInfoSection) {
          // ヘッダーの高さを考慮してスクロール位置を調整
          const headerOffset = 100;
          const elementPosition = patientInfoSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // スクロール完了後、最初の入力欄にフォーカスを設定してスクロール位置を維持
          setTimeout(() => {
            const firstInput = patientInfoSection.querySelector('input[type="text"]:not([type="hidden"]), input[type="number"]') as HTMLInputElement;
            if (firstInput) {
              firstInput.focus({ preventScroll: true });
              // フォーカス後もスクロール位置を維持
              setTimeout(() => {
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'auto'
                });
              }, 100);
            }
          }, 500);
        } else if (retryCount < 3) {
          // 患者情報セクションがまだ表示されていない場合、少し待ってから再試行（最大3回）
          setTimeout(() => {
            attemptScroll(retryCount + 1);
          }, 200);
        }
      };
      
      // 少し待ってからスクロールを試行（アニメーション完了を待つ）
      setTimeout(() => {
        attemptScroll();
      }, 300);
    }
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
              maxVisiblePreference={maxVisiblePreference}
            />
          </div>

          {/* Booking form section - 第2希望日が選択完了したら表示 */}
          {preferredDates[1]?.date && preferredDates[1]?.timeSlot && (
            <div ref={patientFormRef} className="w-full max-w-2xl mx-auto space-y-6 scroll-mt-20 animate-in fade-in-50 slide-in-from-bottom-3">
              <div ref={treatmentSelectionRef} className="scroll-mt-20">
                <AppointmentForm
                  formData={formData}
                  onFormChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
                  selectedTreatment={selectedTreatment}
                  onTreatmentSelect={setSelectedTreatment}
                  fee={fee}
                  treatmentData={selectedTreatmentData}
                  onScrollToTop={scrollToCalendar}
                  isValid={isValid}
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
          )}
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
