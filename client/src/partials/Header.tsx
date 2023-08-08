import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

import { useAppSelector, useAppDispatch } from "../redux/hooks";

import { GiHamburgerMenu } from "react-icons/gi";
import { slide as Menu, StateChangeHandler } from "react-burger-menu";

import Icon from "../images/WEBSITE-LOGO.png";

import Modal from "../components/Modal";

interface HeaderProps {
  where: string;
}

const Header: React.FC<HeaderProps> = ({ where }) => {
  const loggedIn = useAppSelector((state) => state.login.loggedIn);
  const email = useAppSelector((state) => state.login.email);

  const [top, setTop] = useState(true);

  const [isMenuOpen, setMenuOpen] = useState(false);

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
            <Link to="/" className="block" aria-label="Cruip">
              <img className="h-10" src={Icon} alt="Cruip" />
            </Link>
          </div>

          {/* Hamburger menu */}
          <div className="lg:hidden">
            <GiHamburgerMenu
              className="text-white cursor-pointer"
              size={24}
              onClick={() => setMenuOpen(!isMenuOpen)}
            />
            <Menu
              className="bg-blue-900 bg-opacity-80 !h-96"
              right
              isOpen={isMenuOpen}
              onStateChange={({ isOpen }: StateChangeHandler) =>
                setMenuOpen(isOpen)
              }
            >
              <HashLink
                to={where ? where + "#about" : "#about"}
                className="block px-4 py-2 text-white"
                onClick={() => setMenuOpen(false)}
              >
                About
              </HashLink>
              <HashLink
                to={where ? where + "#people" : "#people"}
                className="block px-4 py-2 text-white"
                onClick={() => setMenuOpen(false)}
              >
                People
              </HashLink>
              <HashLink
                to={where ? where + "#research" : "#research"}
                className="block px-4 py-2 text-white"
                onClick={() => setMenuOpen(false)}
              >
                Research
              </HashLink>
              {!loggedIn ? (
                <Link
                  to="/signin"
                  className="block px-4 py-2 text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>

                  <p className="block px-4 py-2 text-white">
                    Logged in as {email}
                  </p>
                </>
              )}
              <Modal
                buttonText="Participate →"
                buttonClass="btn-sm text-white bg-gray-900 hover:bg-gray-600 ml-3"
              />
            </Menu>
          </div>

          <nav className="flex-grow hidden lg:flex">
            <ul className="flex flex-grow justify-start flex-wrap items-center">
              <li>
                <HashLink
                  to={where ? where + "#about" : "#about"}
                  className="font-medium text-white hover:text-gray-300 px-5 py-3 flex items-center transition duration-150 ease-in-out"
                >
                  About
                </HashLink>
              </li>
              <li>
                <HashLink
                  to={where ? where + "#people" : "#people"}
                  className="font-medium text-white hover:text-gray-300 px-5 py-3 flex items-center transition duration-150 ease-in-out"
                >
                  People
                </HashLink>
              </li>
              <li>
                <HashLink
                  to={where ? where + "#research" : "#research"}
                  className="font-medium text-white hover:text-gray-300 px-5 py-3 flex items-center transition duration-150 ease-in-out"
                >
                  Research
                </HashLink>
              </li>
            </ul>
            <ul className="flex flex-grow justify-end flex-wrap items-center">
              <li>
                {!loggedIn ? (
                  <Link
                    to="/signin"
                    className="font-medium text-white hover:text-gray-300 px-5 py-3 flex items-center transition duration-150 ease-in-out"
                  >
                    Sign in
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-white"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard | {email}
                    </Link>
                  </>
                )}
              </li>
              <li>
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
};

export default Header;
