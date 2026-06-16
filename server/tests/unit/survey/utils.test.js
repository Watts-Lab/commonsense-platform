const { seededShuffle } = require("../../../survey/treatments/utils/seeded-shuffle");
const { stringy } = require("../../../survey/treatments/utils/id-generator");

describe("survey utility helpers", () => {
  it("seededShuffle returns same order for same seed", () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
    const first = seededShuffle(arr, "seed-a").map((x) => x.id);
    const second = seededShuffle(arr, "seed-a").map((x) => x.id);
    expect(first).toEqual(second);
  });

  it("seededShuffle returns input for empty array or missing seed", () => {
    const original = [{ id: 1 }];
    expect(seededShuffle([], "seed")).toEqual([]);
    expect(seededShuffle(original, "")).toBe(original);
  });

  it("stringy serializes nested objects with stable key ordering", () => {
    const value = { b: 2, a: 1, nested: { z: "last", x: ["a", 2] } };
    expect(stringy(value)).toBe('{a:1,b:2,nested:{x:["a",2],z:"last"}}');
  });
});
