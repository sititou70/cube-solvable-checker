import { FC, useEffect, useRef, useState } from "react";
import cv from "@techstark/opencv-js";
import styles from "./CenterCubeScanner.module.css";
import {
  drawRectangle,
  getCubeSquare,
  getInnerOffsettedSquare,
  getSubcubeSquare,
  SUBCUBE_OFFSET_RATIO,
  VIDEO_SIZE_RATIO,
} from "./scannerCommon";
import { toUpperCaseFirstChar } from "./common";

export type Color = {
  r: number;
  g: number;
  b: number;
};
export type ScannedCenterCubeColors = {
  back: Color;
  right: Color;
  front: Color;
  left: Color;
  top: Color;
  bottom: Color;
};

type ScanningStep = keyof ScannedCenterCubeColors | "done";

export const CenterCubeScanner: FC<{
  flip: boolean;
  onScanned: (colors: ScannedCenterCubeColors) => void;
}> = ({ flip, onScanned }) => {
  const [scanningCenterCubeColors, setScanningCenterCubeColors] = useState<
    Partial<ScannedCenterCubeColors>
  >({});

  const [scanningStep, setScanningStep] = useState<ScanningStep>("back");
  const nextScanningStep: Record<ScanningStep, ScanningStep> = {
    back: "right",
    right: "front",
    front: "left",
    left: "top",
    top: "bottom",
    bottom: "done",
    done: "done",
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoCaptureRef = useRef<cv.VideoCapture | null>(null);

  const drawLoop = () => {
    const video = videoRef.current;
    if (video === null) return;

    const videoCapture = videoCaptureRef.current;
    if (videoCapture === null) return;

    const src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    videoCapture.read(src);

    const cubeSquare = getCubeSquare(video);
    const centerCubeSquare = getInnerOffsettedSquare(
      getSubcubeSquare(cubeSquare, 1, 1),
      SUBCUBE_OFFSET_RATIO
    );
    drawRectangle(src, centerCubeSquare, new cv.Scalar(255, 255, 255, 255), 2);

    if (flip) cv.flip(src, src, 1);
    cv.imshow("canvasOutput", src);
    src.delete();
  };

  const scan = () => {
    if (scanningStep === "done") return;

    const video = videoRef.current;
    if (video === null) return;

    const videoCapture = videoCaptureRef.current;
    if (videoCapture === null) return;

    const src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    videoCapture.read(src);

    const cubeSquare = getCubeSquare(video);
    const centerCubeSquare = getInnerOffsettedSquare(
      getSubcubeSquare(cubeSquare, 1, 1),
      SUBCUBE_OFFSET_RATIO
    );

    const centerCubeColor = cv.mean(src.roi(centerCubeSquare));
    src.delete();

    const newScanningCenterCubeColors = {
      ...scanningCenterCubeColors,
      [scanningStep]: {
        r: centerCubeColor[0],
        g: centerCubeColor[1],
        b: centerCubeColor[2],
      },
    };
    setScanningCenterCubeColors(newScanningCenterCubeColors);

    if (scanningStep === "bottom") {
      onScanned(newScanningCenterCubeColors as ScannedCenterCubeColors);
    }
    setScanningStep(nextScanningStep[scanningStep]);
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
  }, [flip]);

  return (
    <>
      <video autoPlay ref={videoRef} />
      <canvas id="canvasOutput" />
      <button onClick={scan}>撮影して次へ</button>
      <ScanningStatus
        scanningStep={scanningStep}
        scanningCenterCubeColors={scanningCenterCubeColors}
      />
    </>
  );
};

const ScanningStatus: FC<{
  scanningStep: ScanningStep;
  scanningCenterCubeColors: Partial<ScannedCenterCubeColors>;
}> = ({ scanningStep, scanningCenterCubeColors }) => {
  const FaceStatus: FC<{ faceName: keyof ScannedCenterCubeColors }> = ({
    faceName,
  }) => {
    const color = scanningCenterCubeColors[faceName];
    const isScanning = faceName === scanningStep;

    return (
      <li>
        {toUpperCaseFirstChar(faceName)}面：
        {isScanning && "📷..."}
        {color && <ColorTip color={color} />}
      </li>
    );
  };

  return (
    <ol>
      <FaceStatus faceName="back" />
      <FaceStatus faceName="right" />
      <FaceStatus faceName="front" />
      <FaceStatus faceName="left" />
      <FaceStatus faceName="top" />
      <FaceStatus faceName="bottom" />
    </ol>
  );
};

const ColorTip: FC<{ color: Color }> = ({ color }) => (
  <span
    className={styles.colorTip}
    style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
  />
);
