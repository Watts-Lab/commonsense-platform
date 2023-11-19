import React from "react";

import Navbar from "../partials/NavBar";
import AboutPartial from "../partials/About";
import Footer from "../partials/Footer";

const About: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/*  Site header */}
      <Navbar />

      {/*  Page content */}
      <main className="flex-grow">
        {/*  Page sections */}
        <AboutPartial />
      </main>

      {/*  Site footer */}
      <Footer />
    </div>
  );
};

export default About;
