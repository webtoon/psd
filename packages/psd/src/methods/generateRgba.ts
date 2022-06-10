// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as wasm from "../../rust-wasm/pkg/webtoon_psd";
import {ChannelBytes, ChannelCompression} from "../interfaces";
import {UnsupportedCompression} from "../utils";

/**
 * Decodes one or more encoded channels and combines them into an image.
 * @param width Width of the decoded image in pixels
 * @param height Height of the decoded image in pixels
 * @param red Encoded red channel data
 * @param green Encoded green channel data
 * @param blue Encoded blue channel data
 * @param alpha Encoded alpha channel data
 * @returns `Uint8ClampedArray` containing the pixel data of the decoded image.
 *    Each pixel takes up 4 bytes--1 byte for red, blue, green, and alpha.
 */
export function generateRgba(
  width: number,
  height: number,
  red: ChannelBytes,
  green?: ChannelBytes,
  blue?: ChannelBytes,
  alpha?: ChannelBytes
): Uint8ClampedArray {
  const pixelCount = width * height;

  if (!(pixelCount > 0 && Number.isInteger(pixelCount))) {
    throw new Error(
      `Pixel count must be a positive integer, got ${pixelCount}`
    );
  }

  let result: Uint8Array;
  if (green && blue) {
    result = decodeRgb(pixelCount, red, green, blue, alpha);
  } else if (!blue && !green) {
    result = decodeGrayscale(pixelCount, red, alpha);
  } else {
    throw new Error(`Missing ${blue ? "green" : "blue"} channel in RGB image`);
  }

  return new Uint8ClampedArray(
    result.buffer,
    result.byteOffset,
    result.byteLength
  );
}

function validateSupportedCompression(
  compression: ChannelCompression
): asserts compression is
  | ChannelCompression.RawData
  | ChannelCompression.RleCompressed {
  switch (compression) {
    case ChannelCompression.RawData:
    case ChannelCompression.RleCompressed:
      return;
  }
  throw new UnsupportedCompression(
    `Unsupported compression method: ${compression}`
  );
}

export function decodeRgb(
  pixels: number,
  red: ChannelBytes,
  green: ChannelBytes,
  blue: ChannelBytes,
  alpha?: ChannelBytes
) {
  validateSupportedCompression(red.compression);
  validateSupportedCompression(blue.compression);
  validateSupportedCompression(red.compression);
  if (alpha) {
    validateSupportedCompression(alpha.compression);
  }

  return alpha
    ? wasm.decode_rgba(
        pixels,
        red.data,
        red.compression,
        green.data,
        green.compression,
        blue.data,
        blue.compression,
        alpha.data,
        alpha.compression
      )
    : wasm.decode_rgb(
        pixels,
        red.data,
        red.compression,
        green.data,
        green.compression,
        blue.data,
        blue.compression
      );
}

export function decodeGrayscale(
  pixels: number,
  color: ChannelBytes,
  alpha?: ChannelBytes
) {
  validateSupportedCompression(color.compression);
  if (alpha) {
    validateSupportedCompression(alpha.compression);
  }

  return alpha
    ? wasm.decode_grayscale_a(
        pixels,
        color.data,
        color.compression,
        alpha.data,
        alpha.compression
      )
    : wasm.decode_grayscale(pixels, color.data, color.compression);
}
