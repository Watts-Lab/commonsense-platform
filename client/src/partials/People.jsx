import React from "react";

function People() {
  const people = [
    {
      name: "Duncan Watts",
      title:
        "Stevens University Professor & twenty-third Penn Integrates Knowledge Professor",
      image:
        "https://css.seas.upenn.edu/wp-content/uploads/2021/03/Watts-Duncan.jpg",
    },
    {
      name: "Mark Whiting",
      title: "Senior Research Scientist",
      image:
        "https://css.seas.upenn.edu/wp-content/uploads/2021/05/head_shots_MarkWhiting_v2.jpg",
    },
    {
      name: "Karan Sampath",
      title: "Undergraduate Student Researcher",
      image:
        "https://css.seas.upenn.edu/wp-content/uploads/2021/06/Karan-Sampath-Headshot-e1624055267969.jpeg",
    },
    // {
    //   name: "Amirhossein Nakhaei",
    //   title: "National Center Professor of Management & Technology",
    //   image:
    //     "https://css.seas.upenn.edu/wp-content/uploads/2021/03/Kearns-Michael.jpg",
    // },
  ];

  return (
    <section id="people" className="relative">
      <div
        className="absolute inset-0 top-1/2 md:mt-24 lg:mt-0 bg-gray-900 pointer-events-none"
        aria-hidden="true"
      ></div>
      <div className="absolute left-0 right-0 bottom-0 m-auto w-px p-px h-20 bg-gray-200 transform translate-y-1/2"></div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="h2 mb-4">People</h2>
          </div>

          {/* Items */}
          <div className="max-w-sm mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start md:max-w-2xl lg:max-w-none">
            {people.map((person, key) => (
              <div key={key} className="relative flex flex-col items-center p-6 bg-white rounded shadow-xl h-48">
                <img
                  className="inline-block h-12 w-12 rounded-full ring-2 ring-white"
                  src={person.image}
                />
                <h4 className="text-xl font-bold leading-snug tracking-tight mb-1">
                  {person.name}
                </h4>
                <p className="text-gray-600 text-center">{person.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default People;
