import { FC, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  CameraMode,
  CenterCubeColors,
  CubeScanner,
  FlipMode,
} from "./CubeScanner";
import { useLocalStorage } from "./useLocalStorage";
import { Cube } from "./model";
import { CubeViewer } from "./CubeViewer";
import { CubeSolveableChecker } from "./CubeSolveableChecker";

const App: FC = () => {
  const [cameraMode, setCameraMode] = useLocalStorage<CameraMode>(
    "cube-solvable-checker/cameraMode",
    "default"
  );
  const [flipMode, setFlip] = useLocalStorage<FlipMode>(
    "cube-solvable-checker/flipMode",
    "environment"
  );
  const [scanContext, setScanContext] = useLocalStorage<{
    cube: Cube;
    centerCubeColors: CenterCubeColors;
  } | null>("cube-solvable-checker/cubeContext", null);

  if (
    cameraMode === "initializing" ||
    flipMode === "initializing" ||
    scanContext === "initializing"
  )
    return "loading";

  return (
    <>
      <button
        onClick={() => {
          setCameraMode(
            (
              {
                default: "user",
                user: "environment",
                environment: "default",
              } satisfies Record<CameraMode, CameraMode>
            )[cameraMode]
          );
        }}
      >
        cameraMode: {cameraMode}
      </button>
      <button
        onClick={() =>
          setFlip(flipMode === "environment" ? "user" : "environment")
        }
      >
        flipMode: {flipMode}
      </button>
      {scanContext !== null && (
        <button onClick={() => setScanContext(null)}>retry scan</button>
      )}

      {scanContext === null && (
        <CubeScanner
          cameraMode={cameraMode}
          flipMode={flipMode}
          onScanned={(context) => {
            setScanContext(context);
          }}
        />
      )}

      {scanContext !== null && (
        <CubeViewer
          cube={scanContext.cube}
          centerCubeColors={scanContext.centerCubeColors}
        />
      )}

      {scanContext !== null && <CubeSolveableChecker cube={scanContext.cube} />}
    </>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
