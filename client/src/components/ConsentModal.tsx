import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

import Consent from "./Consent";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ConsentModalProps {
  buttonText: string;
  buttonClass: string;
}

const ConsentModal = ({ buttonText, buttonClass }: ConsentModalProps) => {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState<boolean>(
    localStorage.getItem("consent") === "true"
  );

  const navigateTo = useNavigate();

  const cancelButtonRef = useRef(null);

  function giveConsent() {
    setConsent(true);
    localStorage.setItem("consent", "true");
    setOpen(false);
  }

  function openModal() {
    if (consent === false) {
      setOpen(true);
    } else {
      navigateTo("/statements");
    }
  }

  return (
    <>
      <button type="button" onClick={openModal} className={buttonClass}>
        {buttonText}
      </button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel
                  className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg dark:bg-gray-600"
                  id="concent-modal"
                >
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-gray-600">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-200"
                        >
                          {/* Common Sense Platform */}
                          {t("consent-modal.title")}
                        </Dialog.Title>
                        <div className="mt-2 dark:text-gray-200">
                          <p className="pb-4">
                            {/* You are about to complete a survey to measure your
                            common sense. It takes less than 15 minutes for most
                            people. */}
                            {t("consent-modal.subtitle")}
                          </p>

                          <div className="overflow-y-auto h-44 rounded-md border-2 p-2 px-3">
                            <Consent />
                          </div>

                          <div className="pt-4">
                            <div className="text-center text-sm">
                              <label
                                htmlFor="terms"
                                className="font-light text-gray-500 dark:text-gray-300"
                              >
                                {/* By moving forward you consent to participate in
                                this research project. */}
                                {t("consent-modal.acknowledgement")}
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-600">
                    <Link to="/statements">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 sm:ml-3 sm:w-auto dark:bg-slate-100 dark:text-gray-800 dark:hover:bg-gray-400"
                        onClick={giveConsent}
                      >
                        {/* Check Your Common Sense */}
                        {t("consent-modal.button")}
                      </button>
                    </Link>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100 sm:mt-0 sm:w-auto dark:hover:bg-gray-400"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      {/* Cancel */}
                      {t("consent-modal.cancel")}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default ConsentModal;
