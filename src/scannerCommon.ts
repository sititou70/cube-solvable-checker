import cv from "@techstark/opencv-js";

export const VIDEO_SIZE_RATIO = 0.5;
export const CUBE_SQUARE_SIZE_RATIO = 0.9;
export const SUBCUBE_OFFSET_RATIO = 0.2;

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
