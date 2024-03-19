const IdGenerator = (object) => {
  return typeof object === "object"
    ? Array.isArray(object)
      ? `[${object.map(IdGenerator)}]`
      : `{${Object.entries(object)
          .sort((a, b) => a[0].localeCompare(b[0])) // Correct sorting comparison
          .map((a) => `${a[0]}:${IdGenerator(a[1])}`)}}`
    : object;
}

function stringy(object) {
  return Array.isArray(object)
    ? `[${object.map(stringy)}]`
    : typeof object == "object"
    ? `{${Object.keys(object)
        .sort()
        .map((key) => `${key}:${stringy(object[key])}`)}}`
    : typeof object == "string"
    ? `"${object}"`
    : object;
}

module.exports = { IdGenerator, stringy };
