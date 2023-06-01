import React from "react";
import { Link } from "react-router-dom";

import Icon from "../images/cropped-favicon-192x192.png";

function Footer() {
  return (
    <footer>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top area: Blocks */}
        <div className="grid sm:grid-cols-12 gap-8 py-8 md:py-12 border-t border-gray-200">
          {/* 1st block */}
          <div className="sm:col-span-12 lg:col-span-3">
            <div className="mb-2">
              {/* Logo */}
              <Link to="/" className="inline-block" aria-label="Cruip">
                <img className="w-8 h-8" src={Icon} />
              </Link>
            </div>
            <div className="text-sm text-gray-600">
              <Link
                to="#"
                className="text-gray-600 hover:text-gray-900 hover:underline transition duration-150 ease-in-out"
              >
                Terms
              </Link>{" "}
              ·{" "}
              <Link
                to="#"
                className="text-gray-600 hover:text-gray-900 hover:underline transition duration-150 ease-in-out"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* 2nd block */}
          <div className="sm:col-span-6 md:col-span-4 lg:col-span-2">
            <h6 className="text-gray-800 font-medium mb-2">Navigate</h6>
            <ul className="text-sm">
              <li className="mb-2">
                <Link
                  to="#"
                  className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out"
                >
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="#"
                  className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out"
                >
                  Upenn
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="#"
                  className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out"
                >
                  SignIn
                </Link>
              </li>
            </ul>
          </div>

          

          {/* 4th block */}
          <div className="sm:col-span-6 md:col-span-4 lg:col-span-2">
            <h6 className="text-gray-800 font-medium mb-2">CSS Lab</h6>
            <ul className="text-sm">
              <li className="mb-2">
                <Link
                  to="#"
                  className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out"
                >
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="#"
                  className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out"
                >
                  About
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="#"
                  className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out"
                >
                  People
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="#"
                  className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out"
                >
                  Research
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="#"
                  className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out"
                >
                  Publications
                </Link>
              </li>
            </ul>
          </div>

          {/* 5th block */}
          <div className="sm:col-span-6 md:col-span-4 lg:col-span-3">
            <h6 className="text-gray-800 font-medium mb-2">Contact</h6>
            <p className="text-sm text-gray-600 mb-4">
              3401 Walnut Street Suite 417B Philadelphia PA, 19104
            </p>
            <p className="text-sm text-gray-600 mb-2">CSSLab@seas.upenn.edu</p>
            <p className="text-sm text-gray-600 mb-2">(215) 573-7098</p>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
