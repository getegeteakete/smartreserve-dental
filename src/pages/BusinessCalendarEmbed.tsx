
import WeeklyBusinessCalendar from "@/components/WeeklyBusinessCalendar";

const BusinessCalendarEmbed = () => {
  return (
    <div className="min-h-screen bg-white p-4 flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <WeeklyBusinessCalendar />
      </div>
    </div>
  );
};

export default BusinessCalendarEmbed;
