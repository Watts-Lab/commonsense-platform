import React from "react";
import { useTranslation } from "react-i18next";

function Publications() {
  const { t } = useTranslation();

  const publicationsList = [
    {
      title:
        t("publications.journal1"),
      type: t('publications.type1'),
      authors: t("publications.author1"),
      venue:
        t("publications.publication1"),
      year: "2024",
      link: "https://doi.org/10.1073/pnas.2309535121",
    },
    {
      title: t("publications.journal2"),
      type: t('publications.type1'),
      authors: "Watts, Duncan",
      venue:
        t("publications.publication2"),
      year: "2014",
      link: "https://www.jstor.org/stable/10.1086/678271",
    },
    {
      title: t("publications.journal3"),
      type: t("publications.type2"),
      authors: "Watts, Duncan",
      venue: "Crown, 2011, ISBN: 9780385531696, 0385531699.",
      year: "2011",
      link: "https://www.google.com/books/edition/Everything_Is_Obvious/kT_4AAAAQBAJ?hl=en&gbpv=0",
    },
  ];

  return (
    <section
      id="research"
      className="relative bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300"
    >
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="h2 mb-4">{t('publications.title')}</h2>
          </div>

          {/* Items */}
          <div className="max-w-sm mx-auto grid gap-6 grid-cols-1 items-start md:max-w-2xl lg:max-w-none">
            {publicationsList.map((publication, key) => (
              <div
                key={key}
                className="relative flex flex-col p-6 bg-gray-50 dark:bg-slate-900 rounded shadow-xl h-40"
              >
                <h4 className="text-xl font-bold leading-snug tracking-tight pb-3">
                  <a href={publication.link} target="_blank">
                    {publication.title}
                  </a>
                  <span className="bg-blue-600 text-gray-200 text-xs font-medium mx-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                    {publication.type}
                  </span>
                </h4>
                <p className="text-gray-600 dark:text-gray-100 pb-1">{publication.authors}</p>
                <p className="text-gray-600 dark:text-gray-200">{publication.venue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Publications;
