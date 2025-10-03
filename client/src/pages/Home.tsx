import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../partials/NavBar";
import Banner from "../partials/Banner";
import Footer from "../partials/Footer";
import { useSession } from "../context/SessionContext";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { shareLink } = useParams();
  const {
    actions: { captureUrlParams },
  } = useSession();

  useEffect(() => {
    // Only handle shareLink redirect logic here
    if (shareLink) {
      captureUrlParams([{ key: "shareLink", value: shareLink }]);
      console.log("Capturing shareLink:", shareLink);

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    }
  }, [shareLink, captureUrlParams, navigate]);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Navbar />
      <main className="flex-grow bg-gray-100">
        <Banner />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
