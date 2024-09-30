import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Navbar from "../partials/NavBar";
import Footer from "../partials/Footer";

type EnterProps = {
  signIn: (email: string, link: string) => void;
};

const Enter: React.FC<EnterProps> = ({ signIn }) => {
  let params = useParams();
  let navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (params.email && params.link) {
      signIn(params.email, params.link);
      navigate("/dashboard");
    } else {
      // Handle the case where either params.email or params.link is undefined
      console.error("Email or link is missing");
      navigate("/dashboard");
    }
  }, [params.email, params.link, navigate, signIn]);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/*  Site header */}
      <Navbar />

      {/*  Page content */}
      <main className="flex-grow bg-gray-100">
        {/*  Page sections */}
        <div>
          <p>
            {/* Verifying your magic link */}
            {t("enter.verifying-magic-link")}
          </p>
        </div>
      </main>

      {/*  Site footer */}
      <Footer />
    </div>
  );
};

export default Enter;