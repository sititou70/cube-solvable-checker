import { FC, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  CenterCubeScanner,
  ScannedCenterCubeColors,
} from "./CenterCubeScanner";
import { useLocalStorage } from "./common";

const App: FC = () => {
  const [scannedCenterCubeColors, setScannedCenterCubeColors] =
    useLocalStorage<ScannedCenterCubeColors | null>(
      "cube-solvable-checker/scannedCenterCubeColors",
      null
    );

  return (
    <>
      {scannedCenterCubeColors === null && (
        <CenterCubeScanner
          onScanned={(colors) => {
            setScannedCenterCubeColors(colors);
          }}
        />
      )}

      {scannedCenterCubeColors && "done"}
    </>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
