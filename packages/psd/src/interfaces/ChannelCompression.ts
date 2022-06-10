// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {InvalidCompression} from "../utils";

export enum ChannelCompression {
  /** Uncompressed */
  RawData,
  /** Compressed with [PackBits RLE](https://en.wikipedia.org/wiki/PackBits) */
  RleCompressed,
  /** ZIP compression without prediction */
  ZipWithoutPrediction,
  /** ZIP compression with prediction */
  ZipWithPrediction,
}

export function matchChannelCompression(
  compression: number
): ChannelCompression {
  if (!(compression in ChannelCompression)) {
    throw new InvalidCompression();
  }

  return compression;
}
