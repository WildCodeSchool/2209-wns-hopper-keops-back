import { describe, expect, it } from "@jest/globals";
import { mergeObject } from "./helper";

describe("Get merge object", () => {
  it("merges the first object and the second in one object", () => {
    expect(mergeObject({ a: 1, b: "3" }, { c: true })).toMatchObject({
      b: "3",
      a: 1,
      c: true,
    });
  });
  it("have to overwrite the first object by the second", () => {
    expect(mergeObject({ a: 1, b: "3" }, { a: true })).toStrictEqual({
      b: "3",
      a: true,
    });
  });
  it("All the object in are the same out", () => {
    const object1 = { a: 1, b: "3" };
    const object2 = { c: true };
    expect(mergeObject(object1, object2)).toStrictEqual({
      a: 1,
      b: "3",
      c: true,
    });
    expect(object1).toStrictEqual({ a: 1, b: "3" });
    expect(object2).toStrictEqual({ c: true });
  });
});
