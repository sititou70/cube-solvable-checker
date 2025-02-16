import { describe, expect, test } from "vitest";
import { rotateFaceGrid } from "./scannerUtil";
import { FaceGrid } from "./model";

describe("rotateFaceGrid", () => {
  const input: FaceGrid<number> = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  test("0", () => {
    expect(rotateFaceGrid(input, "0")).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
  });
  test("left90", () => {
    expect(rotateFaceGrid(input, "left90")).toEqual([
      [3, 6, 9],
      [2, 5, 8],
      [1, 4, 7],
    ]);
  });
  test("left180", () => {
    expect(rotateFaceGrid(input, "left180")).toEqual([
      [9, 8, 7],
      [6, 5, 4],
      [3, 2, 1],
    ]);
  });
  test("left270", () => {
    expect(rotateFaceGrid(input, "left270")).toEqual([
      [7, 4, 1],
      [8, 5, 2],
      [9, 6, 3],
    ]);
  });
});
