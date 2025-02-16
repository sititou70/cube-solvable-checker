import { FC, useEffect, useRef, useState } from "react";
import cv from "@techstark/opencv-js";
import {
  cvtRGBA2HSV,
  drawRectangle,
  getCubeSquare,
  getInnerOffsettedSquare,
  getNearestRGBAColor,
  getSubcubeSquare,
  SUBCUBE_OFFSET_RATIO,
  VIDEO_SIZE_RATIO,
} from "./scannerCommon";
import { ScannedCenterCubeColors } from "./CenterCubeScanner";

export type FaceName = "back" | "right" | "front" | "left" | "top" | "bottom";
export type ScannedFace = [
  [FaceName, FaceName, FaceName],
  [FaceName, FaceName, FaceName],
  [FaceName, FaceName, FaceName]
];
export type ScannedFaces = {
  back: ScannedFace;
  right: ScannedFace;
  front: ScannedFace;
  left: ScannedFace;
  top: ScannedFace;
  bottom: ScannedFace;
};

export const scanFace = (
  faceMats: [
    [cv.Mat, cv.Mat, cv.Mat],
    [cv.Mat, cv.Mat, cv.Mat],
    [cv.Mat, cv.Mat, cv.Mat]
  ],
  scannedCenterCubeColors: ScannedCenterCubeColors
): ScannedFace | null => {
  const candidates = Object.entries(scannedCenterCubeColors).map(
    ([faceName, color]) => ({
      faceName,
      color: new cv.Scalar(color.r, color.g, color.b, 255),
    })
  );
  const scannedFace = faceMats.map((rowMats) =>
    rowMats.map(
      (faceMat) => getNearestRGBAColor(cv.mean(faceMat), candidates).faceName
    )
  );

  console.log(JSON.stringify(scannedFace));

  return null;
};

export const FaceScanner: FC<{
  scannedCenterCubeColors: ScannedCenterCubeColors;
  flip: boolean;
  onScanned: (faces: ScannedFaces) => void;
}> = ({ flip, scannedCenterCubeColors, onScanned }) => {
  const [scanningFaces, setScanningFaces] = useState<Partial<ScannedFaces>>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoCaptureRef = useRef<cv.VideoCapture | null>(null);

  const drawLoop = () => {
    const video = videoRef.current;
    if (video === null) return;

    const videoCapture = videoCaptureRef.current;
    if (videoCapture === null) return;

    const src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    videoCapture.read(src);

    const view = new cv.Mat(src);

    const cubeSquare = getCubeSquare(video);
    drawRectangle(view, cubeSquare, new cv.Scalar(255, 255, 255, 255), 2);

    let faceMats: cv.Mat[][] = [[], [], []];
    for (const y of [...Array(3).keys()]) {
      for (const x of [...Array(3).keys()]) {
        const square = getInnerOffsettedSquare(
          getSubcubeSquare(cubeSquare, x, y),
          SUBCUBE_OFFSET_RATIO
        );

        faceMats[y].push(src.roi(square));

        drawRectangle(view, square, new cv.Scalar(255, 255, 255, 255), 2);
      }
    }

    if (flip) cv.flip(view, view, 1);
    cv.imshow("canvasOutput", view);
    src.delete();
    view.delete();

    // scan
    const face = scanFace(
      faceMats as Parameters<typeof scanFace>[0],
      scannedCenterCubeColors
    );
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video === null) return;

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream;
    });

    let videoLoopTimer: number | undefined = undefined;
    const onCanPlay = () => {
      video.width = video.videoWidth * VIDEO_SIZE_RATIO;
      video.height = video.videoHeight * VIDEO_SIZE_RATIO;
      videoCaptureRef.current = new cv.VideoCapture(video);

      videoLoopTimer = setInterval(drawLoop, 100);
    };
    video.addEventListener("canplay", onCanPlay);

    return () => {
      clearInterval(videoLoopTimer);
      video.removeEventListener("canplay", onCanPlay);
    };
  }, [flip, scannedCenterCubeColors]);

  return (
    <>
      <video autoPlay ref={videoRef} />
      <canvas id="canvasOutput" />
      <ScanningStatus
        scannedCenterCubeColors={scannedCenterCubeColors}
        scanningFaces={scanningFaces}
      />
    </>
  );
};

const ScanningStatus: FC<{
  scannedCenterCubeColors: ScannedCenterCubeColors;
  scanningFaces: Partial<ScannedFaces>;
}> = () => {
  return <ol></ol>;
};
