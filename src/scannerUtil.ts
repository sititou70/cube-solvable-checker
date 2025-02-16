import { Cube, FaceGrid, isCorrectCube, mapFaceGrid } from "./model";
import { error, ok, Result } from "./Result";

type RotationAngle = "0" | "left90" | "left180" | "left270";
export const rotateFaceGrid = <T>(
  faceGrid: FaceGrid<T>,
  angle: RotationAngle
): FaceGrid<T> => {
  const angleRad = {
    "0": 0,
    left90: Math.PI / 2,
    left180: Math.PI,
    left270: (Math.PI / 2) * 3,
  }[angle];

  const getRotatedIndex = (yIndex: number, xIndex: number) => {
    const x = xIndex - 1;
    const y = yIndex - 1;
    return {
      xIndex: Math.round(x * Math.cos(angleRad) - y * Math.sin(angleRad)) + 1,
      yIndex: Math.round(x * Math.sin(angleRad) + y * Math.cos(angleRad)) + 1,
    };
  };

  return mapFaceGrid(faceGrid, (_, yIndex, xIndex) => {
    const rotatedIndex = getRotatedIndex(yIndex, xIndex);
    return faceGrid[rotatedIndex.yIndex][rotatedIndex.xIndex];
  });
};

export const correctFaceRotation = (cube: Cube): Result<Cube> => {
  for (const frontRotation of [
    "0",
    "left90",
    "left180",
    "left270",
  ] satisfies RotationAngle[]) {
    for (const rightRotation of [
      "0",
      "left90",
      "left180",
      "left270",
    ] satisfies RotationAngle[]) {
      for (const backRotation of [
        "0",
        "left90",
        "left180",
        "left270",
      ] satisfies RotationAngle[]) {
        for (const leftRotation of [
          "0",
          "left90",
          "left180",
          "left270",
        ] satisfies RotationAngle[]) {
          for (const topRotation of [
            "0",
            "left90",
            "left180",
            "left270",
          ] satisfies RotationAngle[]) {
            for (const bottomRotation of [
              "0",
              "left90",
              "left180",
              "left270",
            ] satisfies RotationAngle[]) {
              const rotatedCube: Cube = {
                front: rotateFaceGrid(cube.front, frontRotation),
                right: rotateFaceGrid(cube.right, rightRotation),
                back: rotateFaceGrid(cube.back, backRotation),
                left: rotateFaceGrid(cube.left, leftRotation),
                top: rotateFaceGrid(cube.top, topRotation),
                bottom: rotateFaceGrid(cube.bottom, bottomRotation),
              };

              if (isCorrectCube(rotatedCube)) return ok(rotatedCube);
            }
          }
        }
      }
    }
  }

  return error("correct face rotation not found");
};
