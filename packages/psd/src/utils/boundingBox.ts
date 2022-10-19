// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

interface BoundingBox {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export function height(boundingBox: BoundingBox): number {
  return boundingBox.bottom - boundingBox.top;
}

export function width(boundingBox: BoundingBox): number {
  return boundingBox.right - boundingBox.left;
}

export function dimensions(boundingBox: BoundingBox): {
  height: number;
  width: number;
} {
  return {width: width(boundingBox), height: height(boundingBox)};
}

export function area(boundingBox: BoundingBox): number {
  return width(boundingBox) * height(boundingBox);
}
