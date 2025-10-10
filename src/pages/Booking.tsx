
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import AppointmentCalendar from "@/components/appointment/AppointmentCalendar";
import AppointmentForm from "@/components/appointment/AppointmentForm";
import AppointmentInfo from "@/components/appointment/AppointmentInfo";
import BookingHeader from "@/components/appointment/BookingHeader";
import TreatmentDisplay from "@/components/appointment/TreatmentDisplay";
import { Toaster } from "@/components/ui/sonner";
import { useBookingForm } from "@/hooks/useBookingForm";

export default function Booking() {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <BookingHeader />
        
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
            />
          </div>

          {/* Booking form section */}
          <div className="w-full max-w-2xl mx-auto space-y-6">
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
  );
}
