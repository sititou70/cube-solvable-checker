import cv from "@techstark/opencv-js";
import {
  Cube,
  FaceGrid,
  FaceName,
  Faces,
  mapFaceGrid,
  mapFaces,
} from "./model";
import { error, ok, Result } from "./Result";
import { stdev } from "stats-lite";

export const VIDEO_SIZE_RATIO = 0.5;
export const CUBE_SQUARE_SIZE_RATIO = 0.9;
export const SUBCUBE_OFFSET_RATIO = 0.3;

export const getInnerOffsettedSquare = (
  square: cv.Rect,
  offsetRatio: number
) => {
  const offset = square.width * offsetRatio;
  return new cv.Rect(
    square.x + offset,
    square.y + offset,
    square.width - offset * 2,
    square.height - offset * 2
  );
};

export const getCubeSquare = (video: HTMLVideoElement): cv.Rect => {
  const size = Math.min(video.width, video.height) * CUBE_SQUARE_SIZE_RATIO;
  return new cv.Rect(
    (video.width - size) / 2,
    (video.height - size) / 2,
    size,
    size
  );
};

export const getSubcubeSquare = (
  cubeSquare: cv.Rect,
  yIndex: 0 | 1 | 2,
  xIndex: 0 | 1 | 2,
  subcubeOffsetRatio: number = SUBCUBE_OFFSET_RATIO
): cv.Rect => {
  const size = cubeSquare.width / 3;

  return getInnerOffsettedSquare(
    new cv.Rect(
      cubeSquare.x + size * xIndex,
      cubeSquare.y + size * yIndex,
      size,
      size
    ),
    subcubeOffsetRatio
  );
};

export const getSubcubeSquareGrid = (
  cubeSquare: cv.Rect,
  subcubeOffsetRatio: number = SUBCUBE_OFFSET_RATIO
): FaceGrid<cv.Rect> => {
  return ([0, 1, 2] as const).map((yIndex) =>
    ([0, 1, 2] as const).map((xIndex) =>
      getSubcubeSquare(cubeSquare, yIndex, xIndex, subcubeOffsetRatio)
    )
  ) as FaceGrid<cv.Rect>;
};

export const drawRectangle = (
  img: cv.Mat,
  rect: cv.Rect,
  color: any,
  tickness: number
) => {
  cv.rectangle(
    img,
    new cv.Point(rect.x, rect.y),
    new cv.Point(rect.x + rect.width, rect.y + rect.height),
    color,
    tickness
  );
};

export const cvtRGBA2HSV = (rgbaColor: cv.Scalar): cv.Scalar => {
  const tmp = new cv.Mat(1, 1, cv.CV_8UC4, rgbaColor);
  cv.cvtColor(tmp, tmp, cv.COLOR_RGB2HSV_FULL);
  const hsvColor = new cv.Scalar(tmp.data[0], tmp.data[1], tmp.data[2]);
  tmp.delete();
  return hsvColor;
};

type DetectionContext = {
  color: cv.Scalar;
  face: FaceName | undefined;
  centerFaceName: FaceName | undefined;
  debug?: unknown;
};
const setFaceToContext = (contexts: DetectionContext[]): Result<undefined> => {
  const centerFacename = contexts.find(
    (context) => context.centerFaceName !== undefined
  )?.centerFaceName;
  if (centerFacename === undefined)
    return error({ message: "centerFaceName not found", contexts });

  for (const context of contexts) context.face = centerFacename;

  return ok(undefined);
};
const rotateArrayLeft = <T>(array: T[], rotationNum: number): T[] => [
  ...array.slice(rotationNum),
  ...array.slice(0, rotationNum),
];
const rotateHueArrayLeft = (array: number[], rotationNum: number): number[] => [
  ...array.slice(rotationNum),
  ...array.slice(0, rotationNum).map((x) => x + 256),
];
const getFaceClusterByArray = <T>(array: T[], clusterIndex: number): T[] =>
  array.slice(clusterIndex * 9, (clusterIndex + 1) * 9);
export const detectCubeByColor = (
  scannedRGBAColors: Faces<FaceGrid<cv.Scalar>>
): Result<Cube> => {
  const detectionContexts: Faces<FaceGrid<DetectionContext>> = mapFaces(
    scannedRGBAColors,
    (faceGrid, faceName) =>
      mapFaceGrid(faceGrid, (rgbaColor, yIndex, xIndex) => ({
        color: cvtRGBA2HSV(rgbaColor),
        face: undefined as FaceName | undefined,
        centerFaceName: yIndex === 1 && xIndex === 1 ? faceName : undefined,
        debug: {
          faceName,
          yIndex,
          xIndex,
        },
      }))
  );

  const sortedContextsBySaturation = Object.values(detectionContexts)
    .flat()
    .flat()
    .sort((x, y) => x.color[1] - y.color[1]);

  // detect white face
  const setWhiteFaceResult = setFaceToContext(
    sortedContextsBySaturation.slice(0, 9)
  );
  if (!setWhiteFaceResult.success) {
    return error({
      message: "white face detection failed",
      setWhiteFaceResult,
    });
  }

  // detect color faces
  const sortedContextsByHue = sortedContextsBySaturation
    .slice(9)
    .sort((x, y) => x.color[0] - y.color[0]);
  const sortedHues = sortedContextsByHue.map((context) => context.color[0]);

  const hueVarianceScoreForEachRotationNum = [...Array(9).keys()]
    .map((rotationNum) => {
      const centerCubeNumForEachFaces = [...Array(5).keys()].map(
        (clusterIndex) => {
          return getFaceClusterByArray(
            rotateArrayLeft(sortedContextsByHue, rotationNum),
            clusterIndex
          )
            .map(
              (context) =>
                (context.centerFaceName !== undefined ? 1 : 0) as number
            )
            .reduce((x, y) => x + y);
        }
      );
      const hasSingleCenterCube = centerCubeNumForEachFaces
        .map((centerCubeNum) => centerCubeNum === 1)
        .reduce((x, y) => x && y);
      if (!hasSingleCenterCube) return null;

      const hueStdevForEachFaces = [...Array(5).keys()].map((clusterIndex) => {
        const rotatedSortedHues = rotateHueArrayLeft(sortedHues, rotationNum);
        const faceHues = getFaceClusterByArray(rotatedSortedHues, clusterIndex);
        return stdev(faceHues);
      });
      const hueVarianceScore = hueStdevForEachFaces.reduce((x, y) => x * y);

      return { rotationNum, hueVarianceScore };
    })
    .filter((x) => x !== null);
  if (hueVarianceScoreForEachRotationNum.length === 0) {
    return error({
      message: "color face detection failed",
      sortedContextsByHue,
    });
  }
  const bestRotationNum = hueVarianceScoreForEachRotationNum
    .concat()
    .sort((x, y) => x.hueVarianceScore - y.hueVarianceScore)[0].rotationNum;

  for (const clusterIndex of [...Array(5).keys()]) {
    const setOtherFaceResult = setFaceToContext(
      getFaceClusterByArray(
        rotateArrayLeft(sortedContextsByHue, bestRotationNum),
        clusterIndex
      )
    );
    if (!setOtherFaceResult.success) {
      return error({
        message: "detection of color face is failed",
        setOtherFaceResult,
      });
    }
  }

  return ok(
    mapFaces(detectionContexts, (faceGrid) =>
      mapFaceGrid(faceGrid, (context) => context.face as FaceName)
    )
  );
};
