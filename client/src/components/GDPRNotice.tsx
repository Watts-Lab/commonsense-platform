import React, { useState, useEffect } from "react";

const GDPRNotice = () => {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem("gdpr-consent");
    if (!hasConsented) {
      setShowNotice(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("gdpr-consent", "accepted");
    localStorage.setItem("gdpr-consent-date", new Date().toISOString());
    setShowNotice(false);
  };

  const handleDecline = () => {
    localStorage.setItem("gdpr-consent", "declined");
    localStorage.setItem("gdpr-consent-date", new Date().toISOString());
    setShowNotice(false);
  };

  if (!showNotice) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm">
          <p>
            We use cookies and collect anonymized information to improve your
            experience and analyze site usage. Your data helps us provide better
            services and is stored securely.
            <a
              href="/privacy"
              className="underline hover:text-blue-300 ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm border border-gray-600 rounded hover:bg-gray-800 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default GDPRNotice;
