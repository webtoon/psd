// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {FileVersionSpec} from "../../interfaces";
import {Cursor} from "../../utils";

export function readRleCompressedData(
  cursor: Cursor,
  channelCount: number,
  height: number,
  fileVersionSpec: FileVersionSpec
) {
  let redByteCount = 0,
    greenByteCount = 0,
    blueByteCount = 0,
    alphaByteCount = 0;

  const byteCountReadType = fileVersionSpec.rleScanlineLengthFieldReadType;
  for (let i = 0; i < height; i++) {
    redByteCount += cursor.read(byteCountReadType);
  }

  if (channelCount >= 2) {
    for (let i = 0; i < height; i++) {
      greenByteCount += cursor.read(byteCountReadType);
    }
  }

  if (channelCount >= 3) {
    for (let i = 0; i < height; i++) {
      blueByteCount += cursor.read(byteCountReadType);
    }
  }

  if (channelCount === 4) {
    for (let i = 0; i < height; i++) {
      alphaByteCount += cursor.read(byteCountReadType);
    }
  }

  const channelDataStart =
    2 + channelCount * height * fileVersionSpec.rleScanlineLengthFieldSize;
  const _cursor = cursor.clone(channelDataStart);

  const red = _cursor.take(redByteCount);
  const green = greenByteCount ? _cursor.take(greenByteCount) : undefined;
  const blue = blueByteCount ? _cursor.take(blueByteCount) : undefined;
  const alpha = alphaByteCount ? _cursor.take(alphaByteCount) : undefined;

  return {red, green, blue, alpha};
}
