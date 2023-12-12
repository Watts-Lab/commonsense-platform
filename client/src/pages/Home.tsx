import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { setUrlParams } from "../redux/slices/urlSlice";

import Navbar from "../partials/NavBar";
import Banner from "../partials/Banner";
import Footer from "../partials/Footer";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const urlParams = useAppSelector((state) => state.urlslice.urlParams);
  const { shareLink } = useParams();

  useEffect(() => {
    if (shareLink) {
      const newParams = [...urlParams, { key: "shareLink", value: shareLink }];
      dispatch(setUrlParams({ urlParams: newParams }));
      // Now navigate to the root path, replacing the current entry
      navigate("/", { replace: true });
    }
  }, [shareLink]);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/*  Site header */}
      <Navbar />

      {/*  Page content */}
      <main className="flex-grow bg-gray-100">
        {/*  Page sections */}
        <Banner />
      </main>

      {/*  Site footer */}
      <Footer />
    </div>
  );
};

export default Home;
