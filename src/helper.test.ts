import { describe, expect, it } from "@jest/globals";
import { mergeObject } from "./helper";

describe("Get merge object", () => {
  it("The first object et the second are merged in one object", () => {
    expect(mergeObject({ a: 1, b: "3" }, { c: true })).toBe({
      a: 1,
      b: "3",
      c: true,
    });
  });
  it("The first object is overwrite by the second", () => {
    expect(mergeObject({ a: 1, b: "3" }, { a: true })).toBe({
      a: true,
      b: "3",
    });
  });
  it("All the object in are the same out", () => {
    const object1 = { a: 1, b: "3" };
    const object2 = { c: true };
    expect(mergeObject(object1, object2)).toBe({ a: 1, b: "3", c: true });
    expect(object1).toBe({ a: 1, b: "3" });
    expect(object2).toBe({ c: true });
  });
});
