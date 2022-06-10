// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

/**
 * Possible color modes of a PSD file.
 * @alpha
 */
export enum ColorMode {
  Bitmap = 0,
  Grayscale = 1,
  Indexed = 2,
  Rgb = 3,
  Cmyk = 4,
  Multichannel = 7,
  Duotone = 8,
  Lab = 9,
}
