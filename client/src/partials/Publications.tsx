import React from "react";

function Publications() {
  const publicationsList = [
    {
      title:
        "A framework for quantifying individual and collective common sense",
      type: "Journal Article",
      authors: "Whiting, Mark and Watts, Duncan",
      venue:
        "In: Proceedings of the National Academy of Sciences, vol. 121, no. 4, 2024.",
      year: "2024",
      link: "https://doi.org/10.1073/pnas.2309535121",
    },
    {
      title: "Common sense and sociological explanations",
      type: "Journal Article",
      authors: "Watts, Duncan",
      venue:
        "In: American Journal of Sociology, vol. 120, no. 2, pp. 313-351, 2014.",
      year: "2014",
      link: "https://arxiv.org/abs/2101.00100",
    },
    {
      title: "Everything is obvious",
      type: "Book",
      authors: "Watts, Duncan",
      venue: "Crown, 2011, ISBN: 9780385531696, 0385531699.",
      year: "2011",
      link: "https://arxiv.org/abs/2101.00100",
    },
  ];

  return (
    <section id="research" className="relative bg-gray-100">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="h2 mb-4">Research Publications</h2>
          </div>

          {/* Items */}
          <div className="max-w-sm mx-auto grid gap-6 grid-cols-1 items-start md:max-w-2xl lg:max-w-none">
            {publicationsList.map((publication, key) => (
              <div
                key={key}
                className="relative flex flex-col p-6 bg-gray-50 rounded shadow-xl h-40"
              >
                <h4 className="text-xl font-bold leading-snug tracking-tight pb-3">
                  <a href={publication.link} target="_blank">
                    {publication.title}
                  </a>
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
