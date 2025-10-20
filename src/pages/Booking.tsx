
import { useEffect, useRef } from "react";
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

export default function Booking() {
  const location = useLocation();
  const patientFormRef = useRef<HTMLDivElement>(null);
  
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

  // AIからの予約データは各フックで処理されるため、ここでは削除

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 pt-16 bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <BookingHeader />
          
          <BookingInfo />
          
          <TreatmentDisplay treatmentData={selectedTreatmentData} />

        <form onSubmit={handleSubmit} className="pointer-events-auto space-y-8">
          {/* Calendar section */}
          <div className="w-full">
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
            <AppointmentForm
              formData={formData}
              onFormChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
              selectedTreatment={selectedTreatment}
              onTreatmentSelect={setSelectedTreatment}
              fee={fee}
              treatmentData={selectedTreatmentData}
            />

            <Button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-600 pointer-events-auto h-12 text-lg"
              disabled={!isValid || isLoading}
            >
              {isLoading ? "予約処理中..." : "予約を確定する"}
            </Button>

            <AppointmentInfo />
          </div>
        </form>
        
        <Toaster position="bottom-right" />
        </div>
      </div>

      {/* ページトップへ戻るボタン */}
      <ScrollToTopButton />
      
      {/* 固定メニューバナー */}
      <FixedMenuBanner />
      
      {/* 営業状況バナー（モバイルのみ） */}
      <BusinessStatusBanner />
    </div>
  );
}
