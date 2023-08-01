import { useState } from "react";
import feedbackTypes from "../feedbackTypes";
import CloseButton from "../CloseButton";

import Backend from "../../../apis/backend";

export function FeedbackContentStep({
  feedbackType,
  onFeedbackRestartRequest,
  onFeedbackSent,
}) {
  const feedbackTypeData = feedbackTypes[feedbackType];
  const [comment, setComment] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  async function handleSubmitFeedback(e) {
    e.preventDefault();
    setIsSendingFeedback(true);
    //*console.log({screenshot, comment});
    await Backend.post("/feedbacks", {
      type: feedbackType,
      comment,
    });

    setIsSendingFeedback(false);
    onFeedbackSent();
  }

  return (
    <>
      <header>
        <button
          type="button"
          className="absolute top-5 left-5 text-slate-400 hover:text-zinc-800"
          onClick={onFeedbackRestartRequest}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </button>

        <span className="text-xl leading-6 flex items-center gap-2 mt-2">
          {feedbackTypeData.image}
          {feedbackTypeData.title}
        </span>
        <CloseButton />
      </header>
      <form onSubmit={handleSubmitFeedback} className="mt-4 w-full">
        <textarea
          className="min-w-[384px] w-full min-h-[112px] text-sm 
        placeholder-zinc-400 text-black border-zinc-600 bg-transparent rounded-md 
        focus:border-brand-500 focus:ring-brand-500 focus:ring-1  resize-none focus:outline-none
          scrollbar-thumb-zinc-700 scrollbar-track-transparent scrollbar-thin"
          placeholder="Tell in detail what is happening"
          onChange={(e) => setComment(e.target.value)}
        />
        <footer className=" flex gap-2 mt-2">
          <button
            type="submit"
            disabled={comment.length === 0 || isSendingFeedback} //* if comment is empty, disable the button
            className="p-2 bg-zinc-300 rounded-md border-transparent flex-1 justify-center
          items-center text-sm hover:bg-brand-300 focus:outline-none focus:ring-2
           focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-brand-500
           transition-colors disabled:opacity-50 disabled:cursor-not-allowed
           disabled:hover:bg-brand-500"
          >
            {isSendingFeedback ? <p>sending</p> : "Send feedback"}
          </button>
        </footer>
      </form>
    </>
  );
}
