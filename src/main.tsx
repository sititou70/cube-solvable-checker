import { FC, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  CenterCubeScanner,
  ScannedCenterCubeColors,
} from "./CenterCubeScanner";
import { useLocalStorage } from "./common";
import { FaceScanner } from "./FaceScanner";

const App: FC = () => {
  const [
    scannedCenterCubeColors,
    setScannedCenterCubeColors,
    resetScannedCenterCubeColors,
  ] = useLocalStorage<ScannedCenterCubeColors | null>(
    "cube-solvable-checker/scannedCenterCubeColors",
    null
  );
  const [flip, setFlip] = useLocalStorage<boolean>(
    "cube-solvable-checker/flip",
    false
  );

  return (
    <>
      <button onClick={() => resetScannedCenterCubeColors()}>
        reset center cube
      </button>
      <button onClick={() => setFlip(!flip)}>toggle flip</button>

      {scannedCenterCubeColors === null && (
        <CenterCubeScanner
          flip={flip}
          onScanned={(colors) => {
            setScannedCenterCubeColors(colors);
          }}
        />
      )}

      {scannedCenterCubeColors && (
        <FaceScanner
          flip={flip}
          scannedCenterCubeColors={scannedCenterCubeColors}
          onScanned={(faces) => {
            console.log({ faces });
          }}
        />
      )}
    </>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
