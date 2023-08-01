import CloseButton from "../CloseButton";

import feedbackTypes from "../feedbackTypes";

export function FeedbackTypeStep({ onFeedbackTypeChanged }) {
  return (
    <>
      <header>
        <span className="text-xl leading-6 pr-6">Please give us your feedback! </span>
        <CloseButton />
      </header>
      <div className="flex py-8 gap-2 w-full">
        {Object.entries(feedbackTypes).map(([key, value]) => {
          return (
            <button
              key={key}
              className="bg-slate-200 rounded py-5 w-24 flex1 flex flex-col items-center gap-2 border-2 border-transparent hover:border-brand-500 focus:border-brand-500 focus:outline-none"
              type="button"
              onClick={() => onFeedbackTypeChanged(key)}
            >
              {value.image}
              <span>{value.title}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
