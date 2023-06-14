import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

import Modal from "../components/Modal";

function Banner() {
  const HeroImage =
    "https://css.seas.upenn.edu/wp-content/uploads/2021/03/circle_dots_pattern.png";
  return (
    <section className="relative">
      {/* Illustration behind hero content */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 bottom-0 pointer-events-none"
        aria-hidden="true"
        style={{ opacity: 0.2 }}
      >
        <img src={HeroImage} alt="Hero" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero content */}
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          {/* Section header */}
          <div className="text-center pb-12 md:pb-16">
            <h1
              className="text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-4"
              data-aos="zoom-y-out"
            >
              Common Sense Project
            </h1>
            <div className="max-w-3xl mx-auto">
              <p
                className="text-xl text-black mb-8"
                data-aos="zoom-y-out"
                data-aos-delay="150"
              >
                This project tackles the definitional conundrum of common sense
                head on via a massive online survey experiment.
              </p>
              <div
                className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center"
                data-aos="zoom-y-out"
                data-aos-delay="300"
              >
                <div>
                  <Modal
                    buttonText="Measure Your Common Sense"
                    buttonClass="text-white p-3 bg-blue-600 hover:bg-blue-700 w-full mb-4 rounded-md sm:w-auto sm:mb-0"
                  />
                </div>
                {/* <div>
                  <a className="btn text-white bg-gray-900 hover:bg-gray-800 w-full sm:w-auto sm:ml-4" href="#0">
                    Learn more
                  </a>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Banner;
