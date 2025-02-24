import { FC } from "react";
import "./CubeScanner.module.css";
import { Cube, FaceName, getSubcubeFaces, getSubcubeId } from "./model";
import {
  getCornerCubeRotation,
  getEdgeCubeRotation,
  sortAndCountTranspositionNum,
} from "./checkerUtil";

export const CubeSolvableChecker: FC<{
  cube: Cube;
}> = ({ cube }) => {
  // check transposition
  const correctSubcubeOrder: string[] = [];
  const actualSubcubeOrder: string[] = [];
  for (const x of [0, 1, 2] as const) {
    for (const y of [0, 1, 2] as const) {
      for (const z of [0, 1, 2] as const) {
        const subcubeFaces = getSubcubeFaces(cube, { x, y, z });

        if (
          Object.keys(subcubeFaces).length === 3 ||
          Object.keys(subcubeFaces).length === 2
        ) {
          correctSubcubeOrder.push(
            getSubcubeId(Object.keys(subcubeFaces) as FaceName[])
          );
          actualSubcubeOrder.push(
            getSubcubeId(Object.values(subcubeFaces) as FaceName[])
          );
        }
      }
    }
  }
  const transpositionNum = sortAndCountTranspositionNum(
    actualSubcubeOrder,
    (f1, f2) =>
      correctSubcubeOrder.indexOf(f1) - correctSubcubeOrder.indexOf(f2)
  ).transpositionNum;
  const isSolvablePermutation = transpositionNum % 2 === 0;

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
  const isSolvableCornerCubeRotation = cornerCubeRotationSum % 3 === 0;
  const isSolvableEdgeCubeRotation = edgeCubeRotationSum % 2 === 0;

  return (
    <>
      <p>
        {isSolvablePermutation &&
        isSolvableCornerCubeRotation &&
        isSolvableEdgeCubeRotation
          ? "✅解けます"
          : "❌解けません"}
      </p>

      <ul>
        <li>
          {isSolvablePermutation
            ? "✅位置の置換は偶置換です。"
            : "❌位置の置換は奇置換です。"}
          見つかった互換の数は{transpositionNum}個です。
        </li>
        <li>
          {isSolvableCornerCubeRotation
            ? "✅コーナーキューブの回転量の合計は3の倍数です。"
            : "❌コーナーキューブの回転量の合計が3の倍数ではありません。"}
          回転量の合計は{cornerCubeRotationSum}です。
        </li>
        <li>
          {isSolvableEdgeCubeRotation
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
