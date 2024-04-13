import React from "react";

// Assuming nakhaeiheadshot is imported from an image file:
import nakhaeiheadshot from "../images/Photo-nakhaei.jpg";

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
  return (
    <section className="bg-gray-100 dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-6">
        <div className="mx-auto mb-8 max-w-screen-sm lg:mb-16">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            People
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
              <h3 className="mb-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {person.name}{" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </h3>
              <ul className="flex justify-center mt-4 space-x-4">
                {person.website && (
                  <li>
                    <a
                      href={person.website}
                      className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        className="fill-current"
                        width="24"
                        height="24"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 .5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19ZM8.374 17.4a7.6 7.6 0 0 1-5.9-7.4c0-.83.137-1.655.406-2.441l.239.019a3.887 3.887 0 0 1 2.082 2.5 4.1 4.1 0 0 0 2.441 2.8c1.148.522 1.389 2.007.732 4.522Zm3.6-8.829a.997.997 0 0 0-.027-.225 5.456 5.456 0 0 0-2.811-3.662c-.832-.527-1.347-.854-1.486-1.89a7.584 7.584 0 0 1 8.364 2.47c-1.387.208-2.14 2.237-2.14 3.307a1.187 1.187 0 0 1-1.9 0Zm1.626 8.053-.671-2.013a1.9 1.9 0 0 1 1.771-1.757l2.032.619a7.553 7.553 0 0 1-3.132 3.151Z" />
                      </svg>
                    </a>
                  </li>
                )}

                {person.twitter && (
                  <li>
                    <a
                      href={person.twitter}
                      className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        className="fill-current"
                      >
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                      </svg>
                    </a>
                  </li>
                )}
                {person.github && (
                  <li>
                    <a
                      href={person.github}
                      className="text-gray-500 hover:text-gray-900 dark:hover:text-white dark:text-gray-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </a>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PeoplePartial;
