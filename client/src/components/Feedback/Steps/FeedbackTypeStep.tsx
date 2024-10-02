import CloseButton from "../CloseButton";

import feedbackTypes from "../feedbackTypes";

export function FeedbackTypeStep({
  onFeedbackTypeChanged,
}: {
  onFeedbackTypeChanged: (type: string) => void;
}) {
  return (
    <>
      <header>
        <span className="leading-6 pr-6 mr-7 text-black dark:text-gray-100">
          Please give us your feedback!
        </span>
        <CloseButton />
      </header>
      <div className="flex py-8 gap-2 w-full">
        {Object.entries(feedbackTypes).map(([key, value]) => {
          return (
            <button
              key={key}
              className="bg-slate-200 dark:bg-gray-300 rounded py-5 w-24 flex1 flex flex-col items-center gap-2 border-2 border-transparent hover:border-brand-500 focus:border-brand-500 focus:outline-none dark:hover:bg-gray-100 dark:stroke-black"
              type="button"
              onClick={() => onFeedbackTypeChanged(key)}
            >
              {value.image}
              <span className="dark:text-black">{value.title}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
