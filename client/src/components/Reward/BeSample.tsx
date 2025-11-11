import { useTranslation, Trans } from "react-i18next";

type BeSampleProps = {
  responseId: string;
  assignmentId: string;
  handleCopy: () => void;
  copySuccess: boolean;
};

function BeSample({
  responseId,
  assignmentId,
  handleCopy,
  copySuccess,
}: BeSampleProps) {
  const { t } = useTranslation();
  const BeSampleId = 97819;

  return (
    <>
      <div className="flex flex-col items-center py-7">
        <p className="pb-2 text-3xl">
          {/* Thanks for completing our survey! */}
          {t("result.thanks")}
        </p>
        <p className="pb-2">
          {/* Copy the code below and paste it in the HIT as a completion verification: */}
          {false && (
            // placeholder in case we want to conditionally show assignmentId later
            <Trans
              i18nKey="result.copy-code-text-besample"
              values={{ assignmentId }}
              components={{ strong: <strong /> }}
            />
          )}
          {t("result.copy-code-text-besample-noassignid")}
        </p>
        <p className="pb-2 mb-3 font-semibold border-2 rounded py-1 px-3">
          {Number(responseId) * BeSampleId}
        </p>
        <button
          onClick={handleCopy}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
        >
          {/* Copy code */}
          {t("result.copy-code-button")}
        </button>

        {/* Success notification */}
        {copySuccess && (
          <div className="mt-3 flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-4 py-2 rounded-lg border border-green-300 dark:border-green-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Code copied successfully!</span>
          </div>
        )}

        <p className="text-2xl mt-3 pt-2 px-3">
          {/* Scroll down to see your results — not required. */}
          {t("result.scroll-down")}
        </p>
      </div>
      <hr />
    </>
  );
}

export default BeSample;
