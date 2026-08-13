import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useTranslation } from "react-i18next";

import Navbar from "../partials/NavBar";
import Footer from "../partials/Footer";
import { useSession } from "../context/SessionContext";

type Status = "verifying" | "error";

const Enter: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();

  const {
    actions: { signIn },
  } = useSession();
  const { t } = useTranslation();

  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (params.email && params.link) {
      signIn(params.email, params.link).then((result) => {
        // On success signIn navigates to /dashboard, so we only need to handle
        // the failure case here (invalid or expired link).
        if (!result.ok) {
          setErrorMessage(result.message || t("enter.enter-invalid-magic-link"));
          setStatus("error");
        }
      });
    } else {
      navigate("/signin");
    }
  }, [params.email, params.link]);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Site header */}
      <Navbar />
      {/* Page content */}
      <main className="flex-grow bg-gray-100 dark:bg-gray-600 dark:text-white flex flex-col items-center justify-center">
        {/* Page sections */}
        {status === "verifying" ? (
          <div className="flex flex-col items-center">
            <div
              className="spinner-border animate-spin inline-block w-12 h-12 border-4 border-t-transparent border-gray-500 rounded-full"
              role="status"
            ></div>
            <p className="text-xl mt-4">
              {/* Verifying your magic link... */}
              {t("enter.enter-verifying-magic-link")}
            </p>
          </div>
        ) : (
          <div
            className="flex flex-col items-center text-center max-w-md px-4"
            data-cy="magic-link-error"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-2xl mb-4">
              {/* simple x mark, no extra icon deps */}
              &times;
            </div>
            <p className="text-xl font-semibold">
              {t("enter.enter-invalid-magic-link")}
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {errorMessage || t("enter.enter-invalid-magic-link-help")}
            </p>
            <Link
              to="/signin"
              className="btn text-white bg-gray-600 hover:bg-gray-700 dark:bg-gray-800 mt-6"
            >
              {t("enter.enter-back-to-signin")}
            </Link>
          </div>
        )}
      </main>
      {/* Site footer */}
      <Footer />
    </div>
  );
};

export default Enter;
