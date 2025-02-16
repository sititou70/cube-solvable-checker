import { describe, expect, test } from "vitest";
import { Cube, getSubcubeFaces } from "./model";

const solvedCube: Cube = {
  front: [
    ["front", "front", "front"],
    ["front", "front", "front"],
    ["front", "front", "front"],
  ],
  right: [
    ["right", "right", "right"],
    ["right", "right", "right"],
    ["right", "right", "right"],
  ],
  back: [
    ["back", "back", "back"],
    ["back", "back", "back"],
    ["back", "back", "back"],
  ],
  left: [
    ["left", "left", "left"],
    ["left", "left", "left"],
    ["left", "left", "left"],
  ],
  top: [
    ["top", "top", "top"],
    ["top", "top", "top"],
    ["top", "top", "top"],
  ],
  bottom: [
    ["bottom", "bottom", "bottom"],
    ["bottom", "bottom", "bottom"],
    ["bottom", "bottom", "bottom"],
  ],
};

describe("getSubcubeFaces", () => {
  test.each`
    pos                     | expected
    ${{ x: 0, y: 0, z: 0 }} | ${{ left: "left", back: "back", top: "top" }}
    ${{ x: 2, y: 0, z: 0 }} | ${{ right: "right", back: "back", top: "top" }}
    ${{ x: 0, y: 2, z: 0 }} | ${{ left: "left", front: "front", top: "top" }}
    ${{ x: 2, y: 2, z: 0 }} | ${{ right: "right", front: "front", top: "top" }}
    ${{ x: 0, y: 0, z: 2 }} | ${{ left: "left", back: "back", bottom: "bottom" }}
    ${{ x: 2, y: 0, z: 2 }} | ${{ right: "right", back: "back", bottom: "bottom" }}
    ${{ x: 0, y: 2, z: 2 }} | ${{ left: "left", front: "front", bottom: "bottom" }}
    ${{ x: 2, y: 2, z: 2 }} | ${{ right: "right", front: "front", bottom: "bottom" }}
  `("case %s", ({ pos, expected }) => {
    expect(getSubcubeFaces(solvedCube, pos)).toEqual(expected);
  });
});
