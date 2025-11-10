import React from "react";

import Result from "../components/Result";

const Finish:React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <main className="mx-auto p-3 max-w-3xl pb-14">
        <Result />
      </main>
    </div>
  );
};

export default Finish;
