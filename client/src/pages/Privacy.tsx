import { FC } from "react";
import Navbar from "../partials/NavBar";
import Footer from "../partials/Footer";

const Privacy: FC = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/*  Site header */}
      <Navbar />

      {/*  Page content */}
      <main className="flex-grow bg-gray-100">
        {/*  Page sections */}
        <section
          id="privacy"
          className="relative bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300 py-6"
        >
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Privacy Policy
              </h1>
              <p className="text-gray-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="prose max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Information We Collect
                </h2>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Automatically Collected Information
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>IP address and location data</li>
                      <li>Browser type and version</li>
                      <li>Device information</li>
                      <li>Pages visited and time spent</li>
                      <li>Session data and cookies</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Information You Provide
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Email address (for account creation)</li>
                      <li>Survey responses and feedback</li>
                      <li>Any other information you voluntarily provide</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  How We Use Your Information
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Provide and improve our services</li>
                  <li>Analyze website usage and performance</li>
                  <li>Send important updates and communications</li>
                  <li>Conduct research and analytics</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Data Storage and Security
                </h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    We store your data securely using industry-standard
                    encryption and security measures. Your information is hosted
                    on secure servers and protected against unauthorized access.
                  </p>
                  <p>
                    We retain your data only as long as necessary to provide our
                    services and comply with legal obligations. You can request
                    deletion of your data at any time.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Cookies and Tracking
                </h2>
                <div className="space-y-4 text-gray-700">
                  <p>We use cookies and similar technologies to:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Maintain your session and preferences</li>
                    <li>Analyze how you use our website</li>
                    <li>Improve user experience</li>
                    <li>Provide personalized content</li>
                  </ul>
                  <p>
                    You can control cookie settings through your browser, but
                    this may affect functionality.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Your Rights (GDPR)
                </h2>
                <div className="space-y-4 text-gray-700">
                  <p>Under GDPR, you have the right to:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      <strong>Access:</strong> Request a copy of your personal
                      data
                    </li>
                    <li>
                      <strong>Rectification:</strong> Correct inaccurate or
                      incomplete data
                    </li>
                    <li>
                      <strong>Erasure:</strong> Request deletion of your data
                    </li>
                    <li>
                      <strong>Portability:</strong> Receive your data in a
                      portable format
                    </li>
                    <li>
                      <strong>Objection:</strong> Object to processing of your
                      data
                    </li>
                    <li>
                      <strong>Restriction:</strong> Limit how we process your
                      data
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Data Sharing
                </h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    We do not sell, trade, or share your personal information
                    with third parties.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Contact Us
                </h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    If you have questions about this Privacy Policy or want to
                    exercise your rights, please contact us at:
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p>
                      <strong>Email:</strong> privacy@commonsensicality.org
                    </p>
                    <p>
                      <strong>Address:</strong> 3401 Walnut Street Suite 417B,
                      Philadelphia PA, 19104
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Updates to This Policy
                </h2>
                <p className="text-gray-700">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any material changes by posting the new policy
                  on this page and updating the &quot;Last updated&quot; date.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>

      {/*  Site footer */}
      <Footer />
    </div>
  );
};

export default Privacy;
