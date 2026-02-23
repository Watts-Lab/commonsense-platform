import "./style.css";

type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
};

function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const pct = Math.max((currentStep / totalSteps) * 100, 12);

  return (
    <div className="py-3">
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden h-6 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full flex items-center justify-center transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        >
          <span className="text-xs font-semibold text-white drop-shadow-sm px-2 whitespace-nowrap">
            {currentStep} / {totalSteps}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
