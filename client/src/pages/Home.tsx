import React, { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../partials/NavBar";
import Banner from "../partials/Banner";
import Footer from "../partials/Footer";
import { useSession } from "../context/SessionContext";
import { setMetaCookies } from "../utils/metaCookies";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { shareLink } = useParams();
  const [searchParams] = useSearchParams();
  const {
    actions: { captureUrlParams },
  } = useSession();

  useEffect(() => {
    const paramsToCapture: { key: string; value: string }[] = [];

    // Handle shareLink from route param
    if (shareLink) {
      paramsToCapture.push({ key: "shareLink", value: shareLink });
      console.log("Capturing shareLink:", shareLink);
    }

    // Handle query params (like fbclid)
    searchParams.forEach((value, key) => {
      paramsToCapture.push({ key, value });

      // Handle fbclid for Meta cookies
      if (key === "fbclid") {
        setMetaCookies(value);
      }
    });

    // Save all params if any exist
    if (paramsToCapture.length > 0) {
      captureUrlParams(paramsToCapture);

      // If we have shareLink, redirect to home
      if (shareLink) {
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 100);
      }
    } else {
      // Ensure _fbp cookie exists even without fbclid
      setMetaCookies();
    }
  }, [shareLink, searchParams.toString()]);

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
