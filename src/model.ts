// defs
export type FaceGrid<T> = [[T, T, T], [T, T, T], [T, T, T]];

export type Faces<T> = {
  back: T;
  right: T;
  front: T;
  left: T;
  top: T;
  down: T;
};

export type FaceName = keyof Faces<unknown>;

export type Cube = Faces<FaceGrid<FaceName>>;

export type SubcubePosition = {
  x: 0 | 1 | 2;
  y: 0 | 1 | 2;
  z: 0 | 1 | 2;
};

export const defaultFaceNameOrder: FaceName[] = [
  "front",
  "right",
  "back",
  "left",
  "top",
  "down",
];

// utils
export const mapFaceGrid = <From, To>(
  faceGrid: FaceGrid<From>,
  callbackFn: (t: From, yIndex: number, xIndex: number) => To
): FaceGrid<To> => {
  return faceGrid.map((row, yIndex) =>
    row.map((from, xIndex) => callbackFn(from, yIndex, xIndex))
  ) as FaceGrid<To>;
};

export const mapFaces = <From, To>(
  faces: Faces<From>,
  callbackFn: (t: From, faceName: FaceName) => To
): Faces<To> => {
  return Object.fromEntries(
    Object.entries(faces).map(([faceName, from]) => [
      faceName,
      callbackFn(from, faceName as FaceName),
    ])
  ) as Faces<To>;
};

export const compareFace = (
  f1: FaceName,
  f2: FaceName,
  faceNameOrder = defaultFaceNameOrder
): number => {
  const f1Index = faceNameOrder.indexOf(f1);
  const f2Index = faceNameOrder.indexOf(f2);

  return f1Index - f2Index;
};

export const getSubcubeId = (faces: FaceName[]): string =>
  faces.concat().sort(compareFace).join(",");

export const getSubcubeFaces = (
  cube: Cube,
  pos: SubcubePosition
): Partial<Faces<FaceName>> => {
  let faces: Partial<Faces<FaceName>> = {};

  if (pos.y === 2) faces = { ...faces, front: cube.front[pos.z][pos.x] };
  if (pos.x === 2) faces = { ...faces, right: cube.right[pos.z][2 - pos.y] };
  if (pos.y === 0) faces = { ...faces, back: cube.back[pos.z][2 - pos.x] };
  if (pos.x === 0) faces = { ...faces, left: cube.left[pos.z][pos.y] };
  if (pos.z === 0) faces = { ...faces, top: cube.top[pos.y][pos.x] };
  if (pos.z === 2) faces = { ...faces, down: cube.down[2 - pos.y][pos.x] };

  return faces;
};

export const isCorrectCube = (cube: Cube): boolean => {
  const correctSubcubes = new Set<string>();
  const actualSubcubes = new Set<string>();

  for (const x of [0, 1, 2] as const) {
    for (const y of [0, 1, 2] as const) {
      for (const z of [0, 1, 2] as const) {
        const faces = getSubcubeFaces(cube, { x, y, z });
        if (Object.keys(faces).length === 0) continue;

        correctSubcubes.add(getSubcubeId(Object.keys(faces) as FaceName[]));
        actualSubcubes.add(getSubcubeId(Object.values(faces) as FaceName[]));
      }
    }
  }

  for (const correctSubcube of correctSubcubes)
    if (!actualSubcubes.has(correctSubcube)) return false;
  for (const actualSubcube of actualSubcubes)
    if (!correctSubcubes.has(actualSubcube)) return false;

  return true;
};
