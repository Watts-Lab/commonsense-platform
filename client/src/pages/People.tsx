import React from "react";

import Navbar from "../partials/NavBar";
import PeoplePartial from "../partials/People";
import Footer from "../partials/Footer";

const People: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/*  Site header */}
      <Navbar />

      {/*  Page content */}
      <main className="flex-grow bg-gray-100">
        {/*  Page sections */}
        <PeoplePartial />
      </main>

      {/*  Site footer */}
      <Footer />
    </div>
  );
};

export default People;
