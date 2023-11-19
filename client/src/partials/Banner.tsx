import React from "react";
import { Link } from "react-router-dom";

import { Histogram } from "./Histogram";

import { commonsensicalityScores } from "./Scores";

import Modal from "../components/Modal";

const Banner: React.FC = () => {
  const heroImage =
    "https://css.seas.upenn.edu/wp-content/uploads/2021/03/circle_dots_pattern.png";

  return (
    <>
      <section className="relative bg-gray-100 text-gray-800">
        {/* Illustration behind hero content */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 bottom-0 pointer-events-none"
          aria-hidden="true"
          style={{ opacity: 0.1 }}
        >
          {/* <img src={heroImage} alt="Hero" /> */}
          <Histogram width={1000} height={500} data={commonsensicalityScores} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Hero content */}
          <div className="pt-32 pb-12 md:pt-40 md:pb-40">
            {/* Section header */}
            <div className="text-center pb-12 md:pb-16">
              <h1 className="text-5xl md:text-6xl font-bold leading-tighter tracking-tight mb-4">
                The common sense measure
              </h1>
              <div className="max-w-3xl mx-auto">
                <p className="text-xl">
                  How much common sense do you have? How could you really know?
                </p>
                <p className="text-xl mb-8">
                  We are trying to measure common sense, and let people check
                  how much common sense they have.
                </p>
                <div className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center">
                  <div>
                    <Modal
                      buttonText="Test Your Common Sense"
                      buttonClass="text-white p-3 bg-gray-600 hover:bg-gray-700 w-full mb-4 rounded-md sm:w-auto sm:mb-0"
                    />
                  </div>
                  {/* More call-to-actions can be added here if needed */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Banner;
