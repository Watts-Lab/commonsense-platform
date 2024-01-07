import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Navbar from "../partials/NavBar";
import Footer from "../partials/Footer";

const Enter = ({ signIn }) => {
  let params = useParams();
  let navigate = useNavigate();

  useEffect(() => {
    if (params.email && params.link) {
      signIn(params.email, params.link);
      navigate("/dashboard");
    } else {
      // Handle the case where either params.email or params.link is undefined
      console.error("Email or link is missing");
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
          <p>Verifying your magic link</p>
        </div>
      </main>

      {/*  Site footer */}
      <Footer />
    </div>
  );
};

export default Enter;
