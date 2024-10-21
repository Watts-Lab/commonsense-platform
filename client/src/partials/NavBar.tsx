import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ConsentModal from "../components/ConsentModal";
import LocaleSwitcher from "../components/LocaleSwitcher";
import Icon from "../images/Light-mode.svg";
import "../css/styles.css";
import { useSession } from "../context/SessionContext";
import { debounce } from "lodash";

const Navbar: React.FC = () => {
  const {
    state: { user },
  } = useSession();
  const { t } = useTranslation();
  const [isTop, setTop] = useState(true);

  const handleScroll = useCallback(
    debounce(() => {
      setTop(window.scrollY < 10);
    }, 100), // You can adjust the debounce time as needed
    []
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <nav
      className={`navbar bg-neutral text-neutral-content dark:text-gray-50 ${
        isTop ? "at-top" : ""
      }`}
    >
      <div className="mx-auto max-w-screen-xl w-full flex justify-between items-center px-2 lg:px-4">
        <div className="navbar-start flex items-center">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52 text-gray-900"
            >
              <li className="mb-2">
                <Link to="/people">{t("navbar.people")}</Link>
              </li>
              <li className="mb-2">
                <Link to="/research">{t("navbar.research")}</Link>
              </li>
              <li className="mb-2">
                {!user ? (
                  <Link to="/signin">{t("navbar.signin")}</Link>
                ) : (
                  <Link to="/dashboard">{t("navbar.dashboard")}</Link>
                )}
              </li>
            </ul>
          </div>
          <Link to="/" className="flex items-center" aria-label="Logo">
            <img className="h-9 block" src={Icon} alt="Logo" />
            <span className="text-lg font-bold inline-block ml-2">
              {t("navbar.commonsense")}
            </span>
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex justify-center flex-1">
          <ul className="flex space-x-10 lg:space-x-10">
            <li className="mb-2">
              <Link to="/people" className="button-long-text">
                {t("navbar.people")}
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/research" className="button-long-text">
                {t("navbar.research")}
              </Link>
            </li>
            <li className="mb-2">
              {!user ? (
                <Link to="/signin" className="button-long-text">
                  {t("navbar.signin")}
                </Link>
              ) : (
                <Link to="/dashboard" className="button-long-text">
                  {t("navbar.dashboard")}
                </Link>
              )}
            </li>
          </ul>
        </div>
        <div className="navbar-end flex items-center px-2 lg:px-4">
          <ConsentModal
            buttonText={t("navbar.participate →")}
            buttonClass="btn dark:text-gray-50"
          />
          <div className="ml-4">
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
