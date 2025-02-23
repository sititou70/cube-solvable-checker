import { FC } from "react";
import "./CubeScanner.module.css";
import { Cube, FaceName, getSubcubeFaces, getSubcubeId } from "./model";
import {
  getCornerCubeRotation,
  getEdgeCubeRotation,
  sortAndCountTranspositionNum,
} from "./checkerUtil";

export const CubeSolveableChecker: FC<{
  cube: Cube;
}> = ({ cube }) => {
  // check transposition
  const correctCornerCubeOrder: string[] = [];
  const actualCornerCubeOrder: string[] = [];
  const correctEdgeCubeOrder: string[] = [];
  const actualEdgeCubeOrder: string[] = [];
  for (const x of [0, 1, 2] as const) {
    for (const y of [0, 1, 2] as const) {
      for (const z of [0, 1, 2] as const) {
        const subcubeFaces = getSubcubeFaces(cube, { x, y, z });

        if (Object.keys(subcubeFaces).length === 3) {
          correctCornerCubeOrder.push(
            getSubcubeId(Object.keys(subcubeFaces) as FaceName[])
          );
          actualCornerCubeOrder.push(
            getSubcubeId(Object.values(subcubeFaces) as FaceName[])
          );
        }

        if (Object.keys(subcubeFaces).length === 2) {
          correctEdgeCubeOrder.push(
            getSubcubeId(Object.keys(subcubeFaces) as FaceName[])
          );
          actualEdgeCubeOrder.push(
            getSubcubeId(Object.values(subcubeFaces) as FaceName[])
          );
        }
      }
    }
  }
  const cornerCubeTranspositionNum = sortAndCountTranspositionNum(
    actualCornerCubeOrder,
    (f1, f2) =>
      correctCornerCubeOrder.indexOf(f1) - correctCornerCubeOrder.indexOf(f2)
  ).transpositionNum;
  const edgeCubeTranspositionNum = sortAndCountTranspositionNum(
    actualEdgeCubeOrder,
    (f1, f2) =>
      correctEdgeCubeOrder.indexOf(f1) - correctEdgeCubeOrder.indexOf(f2)
  ).transpositionNum;
  const transpositionNum =
    cornerCubeTranspositionNum + edgeCubeTranspositionNum;
  const isSolveablePermutation = transpositionNum % 2 === 0;

  // check rotation
  let cornerCubeRotationSum = 0;
  let edgeCubeRotationSum = 0;
  for (const x of [0, 1, 2] as const) {
    for (const y of [0, 1, 2] as const) {
      for (const z of [0, 1, 2] as const) {
        const subcubeFaces = getSubcubeFaces(cube, { x, y, z });

        if (Object.keys(subcubeFaces).length === 3) {
          const result = getCornerCubeRotation(subcubeFaces);
          if (!result.success) return <Pre content={result} />;

          cornerCubeRotationSum += result.value;
        }

        if (Object.keys(subcubeFaces).length === 2) {
          const result = getEdgeCubeRotation(subcubeFaces);
          if (!result.success) return <Pre content={result} />;

          edgeCubeRotationSum += result.value;
        }
      }
    }
  }
  const isSolveableCornerCubeRotation = cornerCubeRotationSum % 3 === 0;
  const isSolveableEdgeCubeRotation = edgeCubeRotationSum % 2 === 0;

  return (
    <>
      <p>
        {isSolveablePermutation &&
        isSolveableCornerCubeRotation &&
        isSolveableEdgeCubeRotation
          ? "✅解けます"
          : "❌解けません"}
      </p>

      <ul>
        <li>
          {isSolveablePermutation
            ? "✅位置は偶置換でソートできます。"
            : "❌位置は奇置換でないとソートできません。"}
          見つかった互換の数は{transpositionNum}個です。
        </li>
        <li>
          {isSolveableCornerCubeRotation
            ? "✅コーナーキューブの回転量の合計は3の倍数です。"
            : "❌コーナーキューブの回転量の合計が3の倍数ではありません。"}
          回転量の合計は{cornerCubeRotationSum}です。
        </li>
        <li>
          {isSolveableEdgeCubeRotation
            ? "✅エッジキューブの回転量の合計は2の倍数です。"
            : "❌エッジキューブの回転量の合計が2の倍数ではありません。"}
          回転量の合計は{edgeCubeRotationSum}です。
        </li>
      </ul>
    </>
  );
};

const Pre: FC<{ content: unknown }> = ({ content }) => (
  <pre>{JSON.stringify(content, null, 2)}</pre>
);
