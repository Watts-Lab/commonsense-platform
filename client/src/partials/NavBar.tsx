import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useAppSelector } from "../redux/hooks";
import { useTranslation } from 'react-i18next';

import ConsentModal from "../components/ConsentModal";
import LocaleSwitcher from "../components/LocaleSwitcher";

import Icon from "../images/Light-mode.svg";
import '../css/styles.css';

const Navbar: React.FC = () => {
  const loggedIn = useAppSelector((state) => state.login.loggedIn);
  const email = useAppSelector((state) => state.login.email);
  const { t } = useTranslation();

  const [top, setTop] = useState(true);
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const onScroll = () => {
      setTop(window.scrollY < 10);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="navbar bg-neutral text-neutral-content">
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
                <a href="/people">{t('navbar.people')}</a>
              </li>
              <li className="mb-2">
                <a href="/research">{t('navbar.research')}</a>
              </li>
              <li className="mb-2">
                {!loggedIn ? (
                  <a href="/signin">{t('navbar.signin')}</a>
                ) : (
                  <a href="/dashboard">{t('navbar.dashboard')}</a>
                )}
              </li>
            </ul>
          </div>

          <Link to="/" className="flex items-center" aria-label="Logo">
            <img className="h-9 block" src={Icon} alt="Logo" />
            <span className="text-lg font-bold inline-block ml-2">
              {/* The common sense project */}
              {t('navbar.commonsense')}
            </span>
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex justify-center flex-1">
          <ul className="flex space-x-10 lg:space-x-10">
            <li className="mb-2">
              <a href="/people" className="button-long-text">
                {/* People */}
                {t('navbar.people')}
              </a>
            </li>
            <li className="mb-2">
              <a href="/research" className="button-long-text">
                {/* Research */}
                {t('navbar.research')}
              </a>
            </li>
            <li className="mb-2">
              {!loggedIn ? (
                <a href="/signin" className="button-long-text">
                  {/* Signin */}
                  {t('navbar.signin')}
                </a>
              ) : (
                <>
                  <a
                    href="/dashboard"
                    className="text-base hover:underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    {/* Dashboard */}
                    {t('navbar.dashboard')}
                  </a>
                </>
              )}
            </li>
          </ul>
        </div>

        <div className="navbar-end flex items-center px-2 lg:px-4">
          {/* <ConsentModal buttonText={t('navbar.participate →')} buttonClass="btn" /> */}
          <div className="ml-4">
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
