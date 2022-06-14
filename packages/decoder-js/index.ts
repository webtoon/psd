// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  ChannelBytes,
  ChannelCompression,
  decodeChannel,
} from "./decode-channel";

export {ChannelCompression};
export type {ChannelBytes};

export function decodeRgb(
  pixels: number,
  red: ChannelBytes,
  green: ChannelBytes,
  blue: ChannelBytes,
  alpha?: ChannelBytes
): Uint8Array {
  const output = new Uint8Array(pixels * 4);
  if (!alpha) {
    output.fill(255);
  }

  decodeChannel(red, 0, output);
  decodeChannel(green, 1, output);
  decodeChannel(blue, 2, output);
  if (alpha) {
    decodeChannel(alpha, 3, output);
  }

  return output;
}

export function decodeGrayscale(
  pixels: number,
  color: ChannelBytes,
  alpha?: ChannelBytes
): Uint8Array {
  const output = new Uint8Array(pixels * 4);
  if (!alpha) {
    output.fill(255);
  }

  decodeChannel(color, 0, output);
  decodeChannel(color, 1, output);
  decodeChannel(color, 2, output);
  if (alpha) {
    decodeChannel(alpha, 3, output);
  }

  return output;
}
