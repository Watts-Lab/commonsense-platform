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
