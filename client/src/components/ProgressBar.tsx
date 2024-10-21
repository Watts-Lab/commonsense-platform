import "./style.css";

type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
};

function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progressStyle = {
    width: Math.max((currentStep / totalSteps) * 100, 15) + "%",
  };

  return (
    <>
      <div className="py-3">
        <div className="w-full bg-gray-200 rounded-full dark:bg-gray-500">
          <div
            className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-1 leading-none rounded-full"
            style={progressStyle}
          >
            {" "}
            {currentStep} / {totalSteps}{" "}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProgressBar;
