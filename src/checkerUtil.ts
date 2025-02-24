import { FaceName, Faces, getSubcubeId } from "./model";
import { error, ok, Result } from "./Result";

export const sortAndCountTranspositionNum = <T>(
  array: T[],
  compare: (x: T, y: T) => number
): { sorted: T[]; transpositionNum: number } => {
  const arr = array.concat();
  let transpositionNum = 0;
  for (let i = array.length - 1; i > 0; i--) {
    for (let j = 0; j < i; j++) {
      if (compare(arr[j], arr[j + 1]) > 0) {
        const tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
        transpositionNum++;
      }
    }
  }

  return { sorted: arr, transpositionNum };
};

export const getCornerCubeRotation = (
  faces: Partial<Faces<FaceName>>
): Result<0 | 1 | 2> => {
  const basisFaceDirection = Object.entries(faces).find(
    ([_, faceName]) => faceName === "up" || faceName === "down"
  )?.[0] as FaceName;
  if (basisFaceDirection === undefined)
    return error({ message: "basis face not found", faces });

  const basisFaceDirectionToRotations: Partial<Record<FaceName, 0 | 1 | 2>>[] =
    [
      { up: 0, left: 1, back: 2 },
      { up: 0, back: 1, right: 2 },
      { up: 0, front: 1, left: 2 },
      { up: 0, right: 1, front: 2 },
      { down: 0, back: 1, left: 2 },
      { down: 0, right: 1, back: 2 },
      { down: 0, left: 1, front: 2 },
      { down: 0, front: 1, right: 2 },
    ];
  const id = getSubcubeId(Object.keys(faces) as FaceName[]);
  for (const basisFaceDirectionToRotation of basisFaceDirectionToRotations) {
    const caseId = getSubcubeId(
      Object.keys(basisFaceDirectionToRotation) as FaceName[]
    );
    if (id !== caseId) continue;

    const rotation = basisFaceDirectionToRotation[basisFaceDirection];
    if (rotation === undefined)
      return error({
        message: "invalid basis face direction",
        faces,
        basisFaceDirection,
      });

    return ok(rotation);
  }

  return error({ message: "unknown corner cube", faces });
};

export const getEdgeCubeRotation = (
  faces: Partial<Faces<FaceName>>
): Result<0 | 1> => {
  if (Object.keys(faces).length !== 2)
    return error({ message: "required just 2 faces", faces });

  const basisFaceDirection = (() => {
    for (const [direction, faceName] of Object.entries(faces)) {
      if (faceName === "up") return direction;
      if (faceName === "down") return direction;
    }
    for (const [direction, faceName] of Object.entries(faces)) {
      if (faceName === "front") return direction;
      if (faceName === "back") return direction;
    }
    return undefined;
  })() as FaceName;
  if (basisFaceDirection === undefined)
    return error({ message: "basis face not found", faces });

  if ("up" in faces) return basisFaceDirection === "up" ? ok(0) : ok(1);
  if ("down" in faces) return basisFaceDirection === "down" ? ok(0) : ok(1);
  if ("front" in faces) return basisFaceDirection === "front" ? ok(0) : ok(1);
  if ("back" in faces) return basisFaceDirection === "back" ? ok(0) : ok(1);

  return error({ message: "unknown edge cube", faces });
};
