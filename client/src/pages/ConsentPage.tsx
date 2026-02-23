import React from "react";

import ConsentGate from "../components/ConsentGate";

const ConsentPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="mx-auto p-3 max-w-4xl w-full">
        <ConsentGate />
      </main>
    </div>
  );
};

export default ConsentPage;
