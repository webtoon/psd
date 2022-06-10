// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {Depth} from "../../interfaces";
import {Cursor, UnsupportedDepth} from "../../utils";

export function readRawData(
  cursor: Cursor,
  depth: Depth,
  channelCount: number
) {
  // First 2 bytes were compression bytes
  const bytesCountPerChannel = (cursor.length - 2) / channelCount;

  const red = cursor.extract(bytesCountPerChannel);
  const green =
    channelCount >= 2 ? cursor.extract(bytesCountPerChannel) : undefined;
  const blue =
    channelCount >= 3 ? cursor.extract(bytesCountPerChannel) : undefined;
  const alpha =
    channelCount >= 4 ? cursor.extract(bytesCountPerChannel) : undefined;

  if (depth === Depth.Eight) {
    return {red, green, blue, alpha};
  } else {
    throw new UnsupportedDepth(`Unsupported image bit depth: ${depth}`);
  }
}
