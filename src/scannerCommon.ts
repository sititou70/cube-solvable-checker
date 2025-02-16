import cv, { max } from "@techstark/opencv-js";

export const VIDEO_SIZE_RATIO = 0.5;
export const CUBE_SQUARE_SIZE_RATIO = 0.9;
export const SUBCUBE_OFFSET_RATIO = 0.3;

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
  yIndex: number,
  xIndex: number
): cv.Rect => {
  const size = cubeSquare.width / 3;
  return new cv.Rect(
    cubeSquare.x + size * xIndex,
    cubeSquare.y + size * yIndex,
    size,
    size
  );
};

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

const getHSVColorDistance = (c1: cv.Scalar, c2: cv.Scalar): number => {
  const maxH = Math.max(c1[0], c2[0]);
  const minH = Math.min(c1[0], c2[0]);
  return Math.min(maxH - minH, minH + 255 - maxH);
};
export const cvtRGBA2HSV = (color: cv.Scalar): cv.Scalar => {
  const tmp = new cv.Mat(1, 1, cv.CV_8UC4, color);
  cv.cvtColor(tmp, tmp, cv.COLOR_RGB2HSV_FULL);
  return new cv.Scalar(tmp.data[0], tmp.data[1], tmp.data[2]);
};
export const getNearestRGBAColor = <T extends { color: cv.Scalar }>(
  color: cv.Scalar,
  candidates: T[]
): T => {
  const colorHSV = cvtRGBA2HSV(color);
  const candidatesHSV = candidates.map((candidate) => ({
    ...candidate,
    color: cvtRGBA2HSV(candidate.color),
  }));

  return candidatesHSV
    .map((candidate) => ({
      ...candidate,
      distance: getHSVColorDistance(candidate.color, colorHSV),
    }))
    .reduce((c1, c2) => (c1.distance < c2.distance ? c1 : c2));
};
