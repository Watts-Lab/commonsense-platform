import React from "react";

import Navbar from "../partials/NavBar";
import Publications from "../partials/Publications";
import Footer from "../partials/Footer";

const Research: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/*  Site header */}
      <Navbar />

      {/*  Page content */}
      <main className="flex-grow bg-gray-100">
        {/*  Page sections */}
        <Publications />
      </main>

      {/*  Site footer */}
      <Footer />
    </div>
  );
};

export default Research;
