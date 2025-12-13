interface ProgressBarProps {
  current: number;
  target: number;
  showLabel?: boolean;
}

export default function ProgressBar({ current, target, showLabel = true }: ProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{current} kişi katıldı</span>
          <span>Hedef: {target} kişi</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isComplete ? 'bg-green-500' : 'bg-primary-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        %{percentage.toFixed(0)} tamamlandı
      </div>
    </div>
  );
}
