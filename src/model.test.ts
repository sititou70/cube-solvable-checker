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
  up: [
    ["up", "up", "up"],
    ["up", "up", "up"],
    ["up", "up", "up"],
  ],
  down: [
    ["down", "down", "down"],
    ["down", "down", "down"],
    ["down", "down", "down"],
  ],
};

describe("getSubcubeFaces", () => {
  test.each`
    pos                     | expected
    ${{ x: 0, y: 0, z: 0 }} | ${{ left: "left", back: "back", up: "up" }}
    ${{ x: 2, y: 0, z: 0 }} | ${{ right: "right", back: "back", up: "up" }}
    ${{ x: 0, y: 2, z: 0 }} | ${{ left: "left", front: "front", up: "up" }}
    ${{ x: 2, y: 2, z: 0 }} | ${{ right: "right", front: "front", up: "up" }}
    ${{ x: 0, y: 0, z: 2 }} | ${{ left: "left", back: "back", down: "down" }}
    ${{ x: 2, y: 0, z: 2 }} | ${{ right: "right", back: "back", down: "down" }}
    ${{ x: 0, y: 2, z: 2 }} | ${{ left: "left", front: "front", down: "down" }}
    ${{ x: 2, y: 2, z: 2 }} | ${{ right: "right", front: "front", down: "down" }}
  `("case %s", ({ pos, expected }) => {
    expect(getSubcubeFaces(solvedCube, pos)).toEqual(expected);
  });
});
