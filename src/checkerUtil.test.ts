import { describe, expect, test } from "vitest";
import {
  getCornerCubeRotation,
  getEdgeCubeRotation,
  sortAndCountTranspositionNum,
} from "./checkerUtil";

describe("sortAndCountTranspositionNum", () => {
  test("even1", () => {
    const res = sortAndCountTranspositionNum([2, 1, 4, 3, 5], (x, y) => x - y);
    expect(res.sorted).toEqual([1, 2, 3, 4, 5]);
    expect(res.transpositionNum % 2).toBe(0);
  });

  test("even2", () => {
    const res = sortAndCountTranspositionNum([5, 4, 3, 2, 1], (x, y) => x - y);
    expect(res.sorted).toEqual([1, 2, 3, 4, 5]);
    expect(res.transpositionNum % 2).toBe(0);
  });

  test("odd1", () => {
    const res = sortAndCountTranspositionNum([5, 2, 3, 4, 1], (x, y) => x - y);
    expect(res.sorted).toEqual([1, 2, 3, 4, 5]);
    expect(res.transpositionNum % 2).toBe(1);
  });

  test("odd2", () => {
    const res = sortAndCountTranspositionNum([5, 2, 4, 1, 3], (x, y) => x - y);
    expect(res.sorted).toEqual([1, 2, 3, 4, 5]);
    expect(res.transpositionNum % 2).toBe(1);
  });

  test("empty", () => {
    const res = sortAndCountTranspositionNum([], (x, y) => x - y);
    expect(res.sorted).toEqual([]);
    expect(res.transpositionNum).toBe(0);
  });
});

describe("getCornerCubeRotation", () => {
  // U L2 U L2 R2 B2 L2 D2 L2 U R' U B2 F L2 R2 U' L2 R B'
  test.each`
    faces                                             | rotation
    ${{ up: "up", left: "back", back: "right" }}      | ${0}
    ${{ up: "front", back: "up", right: "right" }}    | ${1}
    ${{ up: "back", front: "left", left: "down" }}    | ${2}
    ${{ up: "front", right: "right", front: "down" }} | ${2}
    ${{ down: "back", back: "down", left: "right" }}  | ${1}
    ${{ down: "left", right: "fromt", back: "down" }} | ${2}
    ${{ down: "up", left: "left", front: "back" }}    | ${0}
    ${{ down: "left", front: "up", right: "front" }}  | ${1}
  `("case %s", ({ faces, rotation }) => {
    const res = getCornerCubeRotation(faces);

    expect(res.success).toBe(true);
    if (!res.success) return;

    expect(res.value).toEqual(rotation);
  });
});

describe("getEdgeCubeRotation", () => {
  // U L2 U L2 R2 B2 L2 D2 L2 U R' U B2 F L2 R2 U' L2 R B'
  test.each`
    faces                               | rotation
    ${{ up: "front", back: "up" }}      | ${1}
    ${{ up: "down", left: "right" }}    | ${0}
    ${{ up: "front", right: "right" }}  | ${0}
    ${{ up: "up", front: "right" }}     | ${0}
    ${{ back: "back", left: "up" }}     | ${1}
    ${{ back: "right", right: "back" }} | ${1}
    ${{ front: "left", left: "down" }}  | ${1}
    ${{ front: "up", right: "left" }}   | ${0}
    ${{ down: "front", back: "left" }}  | ${0}
    ${{ down: "down", left: "front" }}  | ${0}
    ${{ down: "left", right: "back" }}  | ${1}
    ${{ down: "back", front: "down" }}  | ${1}
  `("case %s", ({ faces, rotation }) => {
    const res = getEdgeCubeRotation(faces);

    expect(res.success).toBe(true);
    if (!res.success) return;

    expect(res.value).toEqual(rotation);
  });
});
