// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

interface BoundingBox {
  top: number;
  left: number;
  bottom: number;
  right: number;
}
export function dimensions(boundingBox: BoundingBox): {
  height: number;
  width: number;
} {
  const height = boundingBox.bottom - boundingBox.top;
  const width = boundingBox.right - boundingBox.left;
  return {width, height};
}

export function area(boundingBox: BoundingBox): number {
  const {width, height} = dimensions(boundingBox);
  return width * height;
}
