import React from "react";

import Navbar from "../partials/NavBar";
import Banner from "../partials/Banner";
import Footer from "../partials/Footer";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/*  Site header */}
      <Navbar />

      {/*  Page content */}
      <main className="flex-grow">
        {/*  Page sections */}
        <Banner />
      </main>

      {/*  Site footer */}
      <Footer />
    </div>
  );
};

export default Home;
