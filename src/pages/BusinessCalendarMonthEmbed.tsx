import { BusinessCalendar } from "@/components/BusinessCalendar";

const BusinessCalendarMonthEmbed = () => {
  return (
    <div className="min-h-screen bg-white p-4 flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <BusinessCalendar />
      </div>
    </div>
  );
};

export default BusinessCalendarMonthEmbed;

