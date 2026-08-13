import React from "react";

import ConsentGate from "../components/ConsentGate";
import LocaleSwitcher from "../components/LocaleSwitcher";

const ConsentPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="w-full max-w-4xl mx-auto px-3 pt-3 flex justify-end text-gray-900 dark:text-gray-100">
        <LocaleSwitcher />
      </header>
      <main className="mx-auto p-3 max-w-4xl w-full">
        <ConsentGate />
      </main>
    </div>
  );
};

export default ConsentPage;
