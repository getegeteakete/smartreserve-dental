
interface DebugInfoProps {
  data: any;
  title: string;
}

const DebugInfo = ({ data, title }: DebugInfoProps) => {
  if (process.env.NODE_ENV === 'production') return null;
  
  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4 text-xs">
      <h3 className="font-bold text-red-600">{title}</h3>
      <pre className="whitespace-pre-wrap overflow-auto max-h-40">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default DebugInfo;
