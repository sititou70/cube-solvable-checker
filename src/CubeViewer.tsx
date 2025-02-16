import { FC } from "react";
import styles from "./CubeViewer.module.css";
import { Cube, FaceGrid, Faces, mapFaceGrid, mapFaces } from "./model";
import cv from "@techstark/opencv-js";

export const CubeViewer: FC<{
  cube: Cube;
  centerCubeColors: Faces<cv.Scalar>;
}> = ({ cube, centerCubeColors }) => {
  return (
    <CubeColorViewer
      cubeColors={mapFaces(cube, (faceGrid) =>
        mapFaceGrid(faceGrid, (faceName) => centerCubeColors[faceName])
      )}
    />
  );
};

export const CubeColorViewer: FC<{
  cubeColors: Faces<FaceGrid<cv.Scalar>>;
}> = ({ cubeColors }) => {
  const Face: FC<{ faceColorGrid: FaceGrid<cv.Scalar> }> = ({
    faceColorGrid,
  }) => {
    return (
      <div className={styles.faceWrapper}>
        {faceColorGrid.flat().map((color, i) => (
          <div
            key={i}
            style={{
              backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.cubeViewerWrapper}>
      <div />
      <Face faceColorGrid={cubeColors.top} />
      <div />
      <div />

      <Face faceColorGrid={cubeColors.left} />
      <Face faceColorGrid={cubeColors.front} />
      <Face faceColorGrid={cubeColors.right} />
      <Face faceColorGrid={cubeColors.back} />

      <div />
      <Face faceColorGrid={cubeColors.bottom} />
      <div />
      <div />
    </div>
  );
};
