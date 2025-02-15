import { FC, StrictMode, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import cv from "@techstark/opencv-js";
import "./index.css";

const VIDEO_SIZE = 50;
const VIDEO_WIDTH = 4 * VIDEO_SIZE;
const VIDEO_HEIGHT = 3 * VIDEO_SIZE;

const App: FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video === null) return;

    const canvas = canvasRef.current;
    if (canvas === null) return;

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream;
    });
    video.addEventListener("canplay", () => {
      const cap = new cv.VideoCapture(video);

      setInterval(() => {
        const src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        cap.read(src);
        cv.imshow("canvasOutput", src);
        src.delete();
      }, 100);
    });
  }, []);

  return (
    <>
      <video
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        autoPlay
        ref={videoRef}
      />
      <canvas id="canvasOutput" ref={canvasRef} />
    </>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
