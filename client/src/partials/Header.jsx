import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HashLink } from 'react-router-hash-link';

import Icon from "../images/WEBSITE-LOGO.png";
import Modal from "../components/Modal";

function Header(props) {
  const [top, setTop] = useState(true);

  // detect whether user has scrolled the page down by 10px
  useEffect(() => {
    const scrollHandler = () => {
      window.pageYOffset > 10 ? setTop(false) : setTop(true);
    };
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, [top]);

  return (
    <header
      className={`bg-blue-900 fixed w-full z-30 md:bg-opacity-80 transition duration-300 ease-in-out ${
        !top && "backdrop-blur-sm shadow-lg !bg-blue-900"
      }`}
      // style={{ backgroundColor: "#011f5b"}}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Site branding */}
          <div className="flex-shrink-0 mr-4">
            {/* Logo */}
            <Link
              to="https://css.seas.upenn.edu/"
              className="block"
              aria-label="Cruip"
            >
              <img className="h-10" src={Icon} alt="Cruip" />
            </Link>
          </div>

          {/* Site navigation */}
          <nav className="flex flex-grow">
            <ul className="flex flex-grow justify-start flex-wrap items-center">
              <li>
                <HashLink
                  to={props.where ? props.where + "#about" : "#about"}
                  className="font-medium text-white hover:text-gray-300 px-5 py-3 flex items-center transition duration-150 ease-in-out"
                >
                  About
                </HashLink>
              </li>
              <li>
                <HashLink
                  to={props.where ? props.where + "#people" : "#people"}
                  className="font-medium text-white hover:text-gray-300 px-5 py-3 flex items-center transition duration-150 ease-in-out"
                >
                  People
                </HashLink>
              </li>
              <li>
                <HashLink
                  to={props.where ? props.where + "#research" : "#research"}
                  className="font-medium text-white hover:text-gray-300 px-5 py-3 flex items-center transition duration-150 ease-in-out"
                >
                  Research
                </HashLink>
              </li>
            </ul>
            <ul className="flex flex-grow justify-end flex-wrap items-center">
              <li>
                {!props.loggedIn ? (
                <Link
                  to="/signin"
                  className="font-medium text-white hover:text-gray-300 px-5 py-3 flex items-center transition duration-150 ease-in-out"
                >
                  Sign in
                </Link>
                ) : (
                  <p>Loggid in as {props.user}</p>
                )}
              </li>
              <li>
                {/* <Link
                  to="/survey"
                  className=""
                >
                  <span>P</span>
                  <svg
                    className="w-3 h-3 fill-current text-gray-400 flex-shrink-0 ml-2 -mr-1"
                    viewBox="0 0 12 12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.707 5.293L7 .586 5.586 2l3 3H0v2h8.586l-3 3L7 11.414l4.707-4.707a1 1 0 000-1.414z"
                      fillRule="nonzero"
                    />
                  </svg>
                </Link> */}

                <Modal
                    buttonText="Participate →"
                    buttonClass="btn-sm text-white bg-gray-900 hover:bg-gray-600 ml-3"
                  />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
