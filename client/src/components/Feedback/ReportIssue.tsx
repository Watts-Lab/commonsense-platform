import { useState } from "react";
import { Dialog } from "@headlessui/react";
import Backend from "../../apis/backend";
import feedbackTypes from "./feedbackTypes";
import { useTranslation } from 'react-i18next';
import useDarkMode from "../../hooks/useDarkMode";

function ReportIssue() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const [isDarkMode] = useDarkMode(); // Destructure correctly

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const feedbackTypeData = feedbackTypes.BUG;

  const [comment, setComment] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  async function handleSubmitFeedback(e: any) {
    e.preventDefault();
    setIsSendingFeedback(true);

    await Backend.post("/feedbacks", {
      type: "Bug",
      comment,
    });

    setIsSendingFeedback(false);
    closeModal();
  }

  return (
    <>
      {/* Trigger button */}
      <a onClick={openModal} className="underline">
        {t('report.trigger')}
      </a>

      {/* Modal dialog */}
      <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className={`mx-auto w-full max-w-md rounded bg-white p-5 border-solid border-2 ${isDarkMode ? 'text-black' : ''}`}>
            <Dialog.Title className="text-lg font-medium">
              {t('report.title')}
            </Dialog.Title>
            <Dialog.Description className="mt-2">
              {t('report.description')}
            </Dialog.Description>

            {/* Your custom form or content here */}
            <form onSubmit={handleSubmitFeedback} className="mt-4 w-full">
              <textarea
                className={`min-w-[384px] w-full min-h-[112px] text-sm p-1 placeholder-zinc-400 border-zinc-600 bg-transparent focus:border-brand-500 focus:ring-brand-500 focus:ring-1 resize-none focus:outline-none scrollbar-thumb-zinc-700 scrollbar-track-transparent scrollbar-thin ${isDarkMode ? 'text-black' : ''}`}
                placeholder={t('report.placeholder')}
                onChange={(e) => setComment(e.target.value)}
              />
              <footer className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={comment.length === 0 || isSendingFeedback}
                  className="p-2 text-white bg-gray-600 rounded-md border-transparent flex-1 justify-center items-center text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-500"
                >
                  {isSendingFeedback ? <p>{t('report.button')}</p> : t('report.send-feedback')}
                </button>
              </footer>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}

export default ReportIssue;