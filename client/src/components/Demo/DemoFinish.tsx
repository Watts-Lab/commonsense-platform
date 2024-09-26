import React from "react";

import DemoResult from "./DemoResults";

const ConsentPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <main className="mx-auto p-3 max-w-3xl pb-14">
        <DemoResult showSignUpBox={false} />
      </main>
    </div>
  );
};

export default ConsentPage;
