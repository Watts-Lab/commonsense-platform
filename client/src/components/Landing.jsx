import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./style.css";
import Consent from "./Consent";

function Landing(props) {
  return (
    <div className="text-justify leading-relaxed">
      <h2 className="font-bold">Common Sense Platform</h2>

      <p className="pb-4">
        Welcome to the Common Sense Platform! Our platform is designed to
        measure how common your common sense is compared to other people.
      </p>
      <p className="pb-4">
        We present you with common sense scenarios, where you must make a
        decision based on your intuition and logic. For example, how common do
        you think the statement "A battery can't provide power forever" is?
        Would you say other people agree with you?
      </p>
      <p className="pb-4">
        You can then see how your responses compare with those of other people.
      </p>

      <p className="pb-4">
        If you're feeling creative, you can also help us by submiting your own
        common sense statements and share them with other users to see, rate,
        and discuss. This will help us to create a comprehensive database of
        common sense scenarios and responses.
      </p>
      <p className="pb-4">
        Our platform aims to improve your critical thinking skills and
        decision-making abilities.
      </p>

      <div className="overflow-y-auto h-72 rounded-md border-2 p-3 px-6">
        <Consent />
      </div>

      <div className="flex items-start pt-4">
        <div className="flex items-center h-5">
          <input
            id="terms"
            aria-describedby="terms"
            type="checkbox"
            className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
            required
          />
        </div>
        <div className="ml-3 text-sm">
          <label
            htmlFor="terms"
            className="font-light text-gray-500 dark:text-gray-300"
          >
            I accept the{" "}
            <a
              className="font-medium text-primary-600 hover:underline dark:text-primary-500"
              href="#"
            >
              Terms and Conditions
            </a>
          </label>
        </div>
      </div>

      <div className="flex flex-col items-center pt-7">
        <Link to="/statements">
          <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            Check Your Common Sense
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Landing;
