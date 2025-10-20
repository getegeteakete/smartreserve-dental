
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Booking from "./pages/Booking";
import TreatmentSelection from "./pages/TreatmentSelection";
import TreatmentDetail from "./pages/TreatmentDetail";
import CourseDetail from "./pages/CourseDetail";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminSchedule from "./pages/AdminSchedule";
import AdminTreatments from "./pages/AdminTreatments";
import AdminPatients from "./pages/AdminPatients";
import AdminNotifications from "./pages/AdminNotifications";
import AdminSettings from "./pages/AdminSettings";
import TreatmentManagement from "./pages/TreatmentManagement";
import PatientManagement from "./pages/PatientManagement";
import BusinessCalendarEmbed from "./pages/BusinessCalendarEmbed";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Guide from "./pages/Guide";
import NotFound from "./pages/NotFound";
import AppointmentCancel from "./pages/AppointmentCancel";
import AppointmentRebook from "./pages/AppointmentRebook";
import AdminGuide from "./pages/AdminGuide";
import NotificationSettings from "./pages/NotificationSettings";
import SystemSettings from "./pages/SystemSettings";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminChatHistory from "./pages/AdminChatHistory";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/treatments" element={<TreatmentSelection />} />
          <Route path="/treatment/:id" element={<TreatmentDetail />} />
          <Route path="/treatment-detail/:treatmentId" element={<TreatmentDetail />} />
          <Route path="/course/:courseName" element={<CourseDetail />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin/guide" element={<AdminGuide />} />
          <Route path="/admin/schedule" element={<AdminSchedule />} />
          <Route path="/admin/treatments" element={<AdminTreatments />} />
          <Route path="/admin/patients" element={<AdminPatients />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/chat-history" element={<AdminChatHistory />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/old-treatments" element={<TreatmentManagement />} />
          <Route path="/admin/old-patients" element={<PatientManagement />} />
          <Route path="/admin/old-notifications" element={<NotificationSettings />} />
          <Route path="/admin/old-settings" element={<SystemSettings />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/calendar-embed" element={<BusinessCalendarEmbed />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cancel" element={<AppointmentCancel />} />
          <Route path="/rebook" element={<AppointmentRebook />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
