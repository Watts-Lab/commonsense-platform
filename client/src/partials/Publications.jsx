import React from "react";

function Publications() {
  const publicationsList = [
    {
      title: "Common Sense and Sociological Explanations",
      type: "Journal Article",
      authors: "Watts, Duncan",
      venue:
        "In: American Journal of Sociology, vol. 120, no. 2, pp. 313-351, 2014.",
      year: "2014",
      link: "https://arxiv.org/abs/2101.00100",
    },
    {
      title: "Everything Is Obvious Book",
      type: "Book",
      authors: "Watts, Duncan",
      venue:
        "Crown, 2011, ISBN: 9780385531696, 0385531699.",
      year: "2011",
      link: "https://arxiv.org/abs/2101.00100",
    },
  ];

  return (
    <section id="research" className="relative">
      {/* Illustration behind content */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 bottom-0 pointer-events-none -mb-32"
        aria-hidden="true"
      >
        <svg
          width="1760"
          height="518"
          viewBox="0 0 1760 518"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
              id="illustration-02"
            >
              <stop stopColor="#FFF" offset="0%" />
              <stop stopColor="#EAEAEA" offset="77.402%" />
              <stop stopColor="#DFDFDF" offset="100%" />
            </linearGradient>
          </defs>
          <g
            transform="translate(0 -3)"
            fill="url(#illustration-02)"
            fillRule="evenodd"
          >
            <circle cx="1630" cy="128" r="128" />
            <circle cx="178" cy="481" r="40" />
          </g>
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="h2 mb-4">Research Publications</h2>
          </div>

          {/* Items */}
          <div className="max-w-sm mx-auto grid gap-6 grid-cols-1 items-start md:max-w-2xl lg:max-w-none">

            {publicationsList.map((publication, key) => (
              <div key={key} className="relative flex flex-col p-6 bg-white rounded shadow-xl h-40">
                <h4 className="text-xl font-bold leading-snug tracking-tight pb-3">
                  {publication.title}
                  <span className="bg-blue-600 text-gray-200 text-xs font-medium mx-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">  
                    {publication.type}
                  </span>
                </h4>
                <p className="text-gray-600 pb-1">{publication.authors}</p>
                <p className="text-gray-600">{publication.venue}</p>
              </div>
            ))}
            

          </div>
        </div>
      </div>
    </section>
  );
}

export default Publications;
