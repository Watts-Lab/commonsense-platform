import React from "react";

import { useTranslation } from "react-i18next";

interface PersonProps {
  name: string;
  image: string;
  twitter?: string;
  github?: string;
  website?: string;
}

const people: PersonProps[] = [
  {
    name: "Mark Whiting",
    image: "https://ca.slack-edge.com/T018UEKCXGS-U019QDPCXKP-bd0e7fa5ac77-512",
    twitter: "https://twitter.com/markwhiting",
    github: "https://github.com/markwhiting",
    website: "https://whiting.me",
  },
  {
    name: "Amirhossein Nakhaei",
    image: "https://avatars.githubusercontent.com/u/6696894?v=4",
    twitter: "https://twitter.com/amirhosnakh",
    github: "https://github.com/amirrr",
    website: "https://amirrr.github.io",
  },
  // {
  //   name: "Karan Sampath",
  //   image:
  //     "https://css.seas.upenn.edu/wp-content/uploads/2021/06/Karan-Sampath-Headshot-e1624055267969.jpeg",
  //   twitter: "https://twitter.com/karan_sampath",
  //   github: "https://github.com/karansampath",
  // },
  {
    name: "Josh Nguyen",
    image: "https://joshnguyen.net/images/avatar.jpeg",
    twitter: "https://twitter.com/joshnguyen99",
    github: "https://github.com/joshnguyen99",
    website: "https://joshnguyen.net",
  },
  {
    name: "Duncan Watts",
    image:
      "https://css.seas.upenn.edu/wp-content/uploads/2021/03/Watts-Duncan.jpg",
    twitter: "https://twitter.com/duncanjwatts",
    github: "https://github.com/duncanjwatts",
    website: "https://duncanjwatts.com",
  },
];

const PeoplePartial: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300">
      <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-6">
        <div className="mx-auto mb-8 max-w-screen-sm lg:mb-16">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            {t("navbar.people")}
          </h2>
        </div>
        <div className="grid gap-8 lg:gap-16 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {people.map((person) => (
            <div
              key={person.name}
              className="text-center text-gray-500 dark:text-gray-400"
            >
              <img
                className="mx-auto mb-4 w-36 h-36 rounded-full"
                src={person.image}
                alt={person.name}
              />
              <a
                className="mb-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white"
                href={person.website}
              >
                <span className="underline">{person.name} </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 inline-block"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PeoplePartial;
