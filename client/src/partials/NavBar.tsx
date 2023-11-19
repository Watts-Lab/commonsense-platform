import React from "react";
import { Link } from "react-router-dom";

import Icon from "../images/WEBSITE-LOGO.png";

const Navbar: React.FC = () => {
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
              <li>
                <a href="#item1">About</a>
              </li>
              <li>
                <a href="#parent">People</a>
              </li>
              <li>
                <a href="#item3">Research</a>
              </li>
            </ul>
          </div>

          <Link to="/" className="" aria-label="Logo">
            <img className="h-9 block" src={Icon} alt="Logo" />
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex justify-center flex-1">
          <ul className="flex space-x-8 lg:space-x-8">
            <li>
              <a href="#item1" className="text-base hover:underline">
                About
              </a>
            </li>
            <li>
              <a href="#parent" className="text-base hover:underline">
                People
              </a>
            </li>
            <li>
              <a href="#item3" className="text-base hover:underline">
                Research
              </a>
            </li>
          </ul>
        </div>

        <div className="navbar-end flex items-center">
          <a href="#button" className="btn ">
            Participate →
          </a>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost">
              <svg
                className="h-5 w-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 512 512"
              >
                <path d="M363,176,246,464h47.24l24.49-58h90.54l24.49,58H480ZM336.31,362,363,279.85,389.69,362Z"></path>
                <path d="M272,320c-.25-.19-20.59-15.77-45.42-42.67,39.58-53.64,62-114.61,71.15-143.33H352V90H214V48H170V90H32v44H251.25c-9.52,26.95-27.05,69.5-53.79,108.36-32.68-43.44-47.14-75.88-47.33-76.22L143,152l-38,22,6.87,13.86c.89,1.56,17.19,37.9,54.71,86.57.92,1.21,1.85,2.39,2.78,3.57-49.72,56.86-89.15,79.09-89.66,79.47L64,368l23,36,19.3-11.47c2.2-1.67,41.33-24,92-80.78,24.52,26.28,43.22,40.83,44.3,41.67L255,362Z"></path>
              </svg>
              <svg
                width="12px"
                height="12px"
                className="hidden h-2 w-2 fill-current opacity-60 sm:inline-block"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 2048 2048"
              >
                <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
              </svg>
            </label>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52 text-gray-900"
            >
              <li>
                <button className="active">
                  <span className="badge badge-sm badge-outline !pl-1.5 !pr-1 pt-px font-mono !text-[.6rem] font-bold tracking-widest opacity-50">
                    EN
                  </span>
                  <span className="font-[sans-serif]">English</span>
                </button>
              </li>
              <li>
                <button>
                  <span className="badge badge-sm badge-outline !pl-1.5 !pr-1 pt-px font-mono !text-[.6rem] font-bold tracking-widest opacity-50">
                    ES
                  </span>
                  <span className="font-[sans-serif]">Español</span>
                </button>
              </li>
              <li>
                <button>
                  <span className="badge badge-sm badge-outline !pl-1.5 !pr-1 pt-px font-mono !text-[.6rem] font-bold tracking-widest opacity-50">
                    DE
                  </span>
                  <span className="font-[sans-serif]">Deutsche</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
