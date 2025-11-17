
interface TreatmentDisplayProps {
  treatmentData: {
    id: string;
    name: string;
    fee: number;
    duration: number;
    description?: string;
  } | null;
}

const TreatmentDisplay = ({ treatmentData }: TreatmentDisplayProps) => {
  if (!treatmentData) return null;

  return (
    <div className="text-center mb-8">
      <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 mx-auto max-w-full">
        <h2 className="text-lg font-semibold text-white">
          {treatmentData.name}
        </h2>
        <p className="text-sm text-gray-200">
          {treatmentData.duration}分 - ¥{treatmentData.fee.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default TreatmentDisplay;
