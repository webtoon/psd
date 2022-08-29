// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

// import * as wasmDecoder from "@webtoon/psd-decoder";
import {decodeGrayscale, decodeRgb} from "@webtoon/psd-decoder-js";
import {ChannelBytes} from "../interfaces";

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
export async function generateRgba(
  width: number,
  height: number,
  red: ChannelBytes,
  green?: ChannelBytes,
  blue?: ChannelBytes,
  alpha?: ChannelBytes
): Promise<Uint8ClampedArray> {
  const pixelCount = width * height;

  if (!(pixelCount > 0 && Number.isInteger(pixelCount))) {
    throw new Error(
      `Pixel count must be a positive integer, got ${pixelCount}`
    );
  }

  let result: Uint8Array;
  if (green && blue) {
    result = await decodeRgb(pixelCount, red, green, blue, alpha);
  } else if (!blue && !green) {
    result = await decodeGrayscale(pixelCount, red, alpha);
  } else {
    throw new Error(`Missing ${blue ? "green" : "blue"} channel in RGB image`);
  }

  return new Uint8ClampedArray(
    result.buffer,
    result.byteOffset,
    result.byteLength
  );
}
