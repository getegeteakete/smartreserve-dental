
interface CalendarLegendProps {}

export const CalendarLegend = ({}: CalendarLegendProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded border-2 border-blue-400 bg-blue-50"></div>
        <span>終日営業</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-amber-50 border-2 border-amber-400"></div>
        <span>部分営業</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-red-50 border-2 border-red-400"></div>
        <span>休診日</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-purple-50 border-2 border-purple-400"></div>
        <span>特別営業</span>
      </div>
    </div>
  );
};
