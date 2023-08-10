import React from "react";

import Header from "../partials/Header";
import Banner from "../partials/Banner";
import About from "../partials/About";
import People from "../partials/People";
import Publications from "../partials/Publications";
import Footer from "../partials/Footer";

const Home:React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/*  Site header */}
      <Header />

      {/*  Page content */}
      <main className="flex-grow">
        {/*  Page sections */}
        <Banner />
        <About />
        <People />
        <Publications />
      </main>

      {/*  Site footer */}
      <Footer />
    </div>
  );
};

export default Home;
