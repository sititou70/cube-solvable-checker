import { FC, useEffect, useRef, useState } from "react";
import cv from "@techstark/opencv-js";
import "./CubeScanner.module.css";
import {
  compareFace,
  Cube,
  FaceGrid,
  FaceName,
  Faces,
  mapFaceGrid,
  mapFaces,
} from "./model";
import {
  detectCubeByColor,
  drawRectangle,
  getCubeSquare,
  getSubcubeSquareGrid,
  VIDEO_SIZE_RATIO,
} from "./scannerOpencvUtil";
import { correctFaceRotation } from "./scannerUtil";
import { CubeColorViewer, CubeViewer } from "./CubeViewer";

export type CameraMode = "default" | "environment" | "user";
export type FlipMode = "environment" | "user";

export type CenterCubeColors = Faces<cv.Scalar>;

export const CubeScanner: FC<{
  cameraMode: CameraMode;
  flipMode: FlipMode;
  onScanned: (context: {
    cube: Cube;
    centerCubeColors: CenterCubeColors;
  }) => void;
}> = ({ cameraMode, flipMode, onScanned }) => {
  const faceNameOrder: FaceName[] = (
    {
      environment: ["front", "right", "back", "left", "top", "down"],
      user: ["back", "right", "front", "left", "top", "down"],
    } satisfies Record<FlipMode, FaceName[]>
  )[flipMode];
  const [scanningFaceName, setScanningFaceName] = useState<FaceName>(
    faceNameOrder[0]
  );
  const [scanningColors, setScanningColors] = useState<
    Partial<Faces<FaceGrid<cv.Scalar>>>
  >({});

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoCaptureRef = useRef<cv.VideoCapture | null>(null);

  const [error, setError] = useState<{
    message: string;
    scannedContext?: { cube: Cube; centerCubeColors: CenterCubeColors };
  } | null>(null);

  const drawLoop = () => {
    const video = videoRef.current;
    if (video === null) return;

    const videoCapture = videoCaptureRef.current;
    if (videoCapture === null) return;

    // read camera image
    const src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    videoCapture.read(src);
    if (flipMode === "user") cv.flip(src, src, 1);

    // draw square
    const cubeSquare = getCubeSquare(video);
    const subcubeSquareGrid = getSubcubeSquareGrid(cubeSquare);

    drawRectangle(src, cubeSquare, new cv.Scalar(255, 255, 255, 255), 2);
    for (const row of subcubeSquareGrid) {
      for (const rect of row) {
        drawRectangle(src, rect, new cv.Scalar(255, 255, 255, 255), 2);
      }
    }

    cv.imshow("canvasOutput", src);
    src.delete();
  };

  const scan = () => {
    const video = videoRef.current;
    if (video === null) return;

    const videoCapture = videoCaptureRef.current;
    if (videoCapture === null) return;

    // read camera image
    const src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    videoCapture.read(src);

    // get subcube grid
    const cubeSquare = getCubeSquare(video);
    const subcubeSquareGrid = getSubcubeSquareGrid(cubeSquare);

    // scan
    const scannedFaceColors = mapFaceGrid(subcubeSquareGrid, (rect) =>
      cv.mean(src.roi(rect))
    );
    const newScanningColors = {
      ...scanningColors,
      [scanningFaceName]: scannedFaceColors,
    };
    setScanningColors(newScanningColors);

    // set next scanning face
    const nextScanningFaceName = ([...faceNameOrder, "done"] as const)[
      faceNameOrder.indexOf(scanningFaceName) + 1
    ];
    if (nextScanningFaceName !== "done")
      setScanningFaceName(nextScanningFaceName);

    // process scanned colors
    if (nextScanningFaceName === "done")
      processScannedColors(newScanningColors as Faces<FaceGrid<cv.Scalar>>);
  };
  const processScannedColors = (scannedColors: Faces<FaceGrid<cv.Scalar>>) => {
    const centerCubeColors = mapFaces(
      scannedColors,
      (faceGrid) => faceGrid[1][1]
    );

    const detectColorResult = detectCubeByColor(scannedColors);
    if (!detectColorResult.success) {
      setError({ message: JSON.stringify(detectColorResult.error, null, 2) });
      return;
    }

    const correctRotationResult = correctFaceRotation(detectColorResult.value);
    if (!correctRotationResult.success) {
      setError({
        message: JSON.stringify(correctRotationResult.error, null, 2),
        scannedContext: {
          cube: detectColorResult.value,
          centerCubeColors,
        },
      });
      return;
    }

    onScanned({ cube: correctRotationResult.value, centerCubeColors });
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video === null) return;

    let mediaStream: MediaStream;
    navigator.mediaDevices
      .getUserMedia({
        video:
          cameraMode === "default"
            ? true
            : { facingMode: { exact: cameraMode } },
      })
      .then((stream) => {
        video.srcObject = stream;
        mediaStream = stream;
      })
      .catch((e) => {
        setError({ message: `getUserMedia failed: ${e.toString()}` });
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
      mediaStream?.getVideoTracks().forEach((camera) => camera.stop());
    };
  }, [cameraMode, flipMode]);

  return (
    <>
      <video autoPlay ref={videoRef} />
      <canvas id="canvasOutput" />
      <button onClick={() => scan()}>撮影して次へ</button>
      {error && (
        <>
          <pre>error: {error.message}</pre>

          {Object.keys(scanningColors).length === 6 && (
            <>
              <p>scanned colors:</p>
              <CubeColorViewer
                cubeColors={scanningColors as Faces<FaceGrid<cv.Scalar>>}
              />
            </>
          )}

          {error.scannedContext && (
            <>
              <p>detected faces:</p>
              <CubeViewer
                cube={error.scannedContext.cube}
                centerCubeColors={error.scannedContext.centerCubeColors}
              />
            </>
          )}
        </>
      )}
      <ScanningStatus
        scanningFaceName={scanningFaceName}
        faceNameOrder={faceNameOrder}
      />
    </>
  );
};

const ScanningStatus: FC<{
  scanningFaceName: FaceName;
  faceNameOrder: FaceName[];
}> = ({ scanningFaceName, faceNameOrder }) => {
  return (
    <ol>
      {faceNameOrder.map((faceName) => {
        const compareResult = compareFace(
          scanningFaceName,
          faceName,
          faceNameOrder
        );

        return (
          <li key={faceName}>
            {faceName}面：
            {compareResult > 0 && "✅"}
            {compareResult === 0 && "📷"}
          </li>
        );
      })}
    </ol>
  );
};
