import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Navbar from "../partials/NavBar";
import Footer from "../partials/Footer";
import { useSession } from "../context/SessionContext";

const Enter: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();

  const {
    actions: { signIn },
  } = useSession();

  useEffect(() => {
    if (params.email && params.link) {
      signIn(params.email, params.link);
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
        <div className="flex flex-col items-center">
          <div
            className="spinner-border animate-spin inline-block w-12 h-12 border-4 border-t-transparent border-gray-500 rounded-full"
            role="status"
          ></div>
          <p className="text-xl mt-4">Verifying your magic link...</p>
        </div>
      </main>
      {/* Site footer */}
      <Footer />
    </div>
  );
};

export default Enter;
