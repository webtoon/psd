// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  ChannelBytes,
  ChannelCompression,
  ChannelKind,
  getChannelKindOffset,
} from "../interfaces";
import {UnsupportedCompression} from "../utils/error";

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
  const outputRegionSize = pixelCount * 4;

  // Note: This can become zero when the entire image is blank
  const minimumInputRegionSize = Math.max(
    red.data.byteLength ?? 0,
    blue?.data.byteLength ?? 0,
    green?.data.byteLength ?? 0,
    alpha?.data.byteLength ?? 0
  );

  if (
    !(minimumInputRegionSize >= 0 && Number.isInteger(minimumInputRegionSize))
  ) {
    // This may be a zero when all channels are empty
    // In such cases, we still need to generate a blank image
    throw new Error(
      `Input region size must be a nonnegative integer, got ${minimumInputRegionSize}`
    );
  }

  /**
   * Heap used by the asm.js image decoder module.
   * This is divided into two regions:
   *
   *     (start)                         (end)
   *     +-----------------+----------------+
   *     |  Output region  |  Input region  |
   *     +-----------------+----------------+
   *
   * The output region holds the pixel data for the decoded image, and the input
   * region is used for the encoded channel data.
   *
   * For each channel, the wrapper (JS) copies the encoded channel data into the
   * input region. Then the image decoder (asm.js) reads and decodes the input
   * region, and writes the result into the output region. Once all the channels
   * have been decoded, the wrapper copies the output region (now containing the
   * decoded image) into a separate ArrayBuffer.
   */
  const heap = new ArrayBuffer(
    computeHeapSize(outputRegionSize + minimumInputRegionSize)
  );

  // In Chrome, creating a new TypedArray is much faster when the old and new
  // TypedArrays have the same type (e.g. Uint8Array -> Uint8Array).
  // Since we want to return a Uint8ClampedArray, let's optimize for it
  const outputRegionView = new Uint8ClampedArray(heap, 0, outputRegionSize);
  const inputRegionView = new Uint8Array(heap, outputRegionSize);

  const decoder = AsmJsImageDecoder({Int8Array, Uint8Array}, {}, heap);

  // If the blue and green channels are unavailable, assume that this is a
  // grayscale image and reuse the red channel for blue and green.
  // TODO: Check color mode and depth to determine grayscale-ness instead

  decodeChannel(
    decoder,
    inputRegionView,
    outputRegionView.byteOffset,
    red,
    getChannelKindOffset(ChannelKind.Red)
  );

  decodeChannel(
    decoder,
    inputRegionView,
    outputRegionView.byteOffset,
    green ?? red,
    getChannelKindOffset(ChannelKind.Green)
  );

  decodeChannel(
    decoder,
    inputRegionView,
    outputRegionView.byteOffset,
    blue ?? red,
    getChannelKindOffset(ChannelKind.Blue)
  );

  if (alpha) {
    decodeChannel(
      decoder,
      inputRegionView,
      outputRegionView.byteOffset,
      alpha,
      getChannelKindOffset(ChannelKind.TransparencyMask)
    );
  } else {
    setChannelValue(
      decoder,
      outputRegionView.byteOffset,
      outputRegionView.byteLength,
      255,
      getChannelKindOffset(ChannelKind.TransparencyMask)
    );
  }

  // Return a copy of the heap, excluding the input region
  return outputRegionView.slice();
}

type ChannelOffset = 0 | 1 | 2 | 3;
type ImageDecoderModule = ReturnType<typeof AsmJsImageDecoder>;

/**
 * Decodes a single channel and stores the result in the heap of the
 * {@link decoder}.
 * @param decoder
 * @param inputRegionView Uint8Array that covers the input region of the heap
 * @param outputRegionOffset Offset of the output region
 * @param data
 * @param channelOffset
 * @param method
 */
function decodeChannel(
  decoder: ImageDecoderModule,
  inputRegionView: Uint8Array,
  outputRegionOffset: number,
  channelBytes: ChannelBytes,
  channelOffset: ChannelOffset
): void {
  // Copy the data into the input region (size check done by native method)
  try {
    inputRegionView.set(channelBytes.data);
  } catch (e) {
    if (e instanceof RangeError) {
      throw new Error(
        `Channel data (${channelBytes.data.byteLength} bytes) is too large for the input region (${inputRegionView.byteLength} bytes)`
      );
    } else {
      throw e;
    }
  }

  let result: DecodeResult;
  switch (channelBytes.compression) {
    case ChannelCompression.RawData:
      result = decoder.decodeUncompressedChannel(
        inputRegionView.byteOffset,
        channelBytes.data.byteLength,
        outputRegionOffset,
        channelOffset
      );
      break;
    case ChannelCompression.RleCompressed:
      result = decoder.decodeRleChannel(
        inputRegionView.byteOffset,
        channelBytes.data.byteLength,
        outputRegionOffset,
        channelOffset
      );
      break;
    default:
      throw new UnsupportedCompression(
        `Unsupported compression method: ${channelBytes.compression}`
      );
  }

  if (result !== DecodeResult.Success) {
    throw new Error(`Decode failed (cause: ${result})`);
  }
}

/**
 * Sets the value of a single channel of all pixels in the output image.
 * @param decoder
 * @param outputRegionOffset Offset of the output region
 * @param outputRegionLength Length of the output region in bytes
 * @param value Channel value
 * @param channelOffset
 */
function setChannelValue(
  decoder: ImageDecoderModule,
  outputRegionOffset: number,
  outputRegionLength: number,
  value: number,
  channelOffset: ChannelOffset
): void {
  if (!(Number.isInteger(value) && 0 <= value && value <= 255)) {
    throw new Error(
      `Channel value must be an integer between 0 and 255, got ${value}`
    );
  }

  const result = decoder.setChannelValue(
    outputRegionOffset,
    outputRegionLength,
    channelOffset,
    value
  );

  if (result !== DecodeResult.Success) {
    throw new Error(`Channel update failed (cause: ${result})`);
  }
}

/**
 * Computes the smallest valid size of an asm.js heap buffer that is at least as
 * large as {@link minSize}.
 * @param minSize Minimum size of the heap
 * @return Valid heap size
 */
function computeHeapSize(minSize: number) {
  // According to the asm.js spec, the heap size must be:
  //
  // 1. A power of 2 between 4096 (= 2^12 = 4 KiB) and 8388608 (= 2^23 = 8 MiB),
  // 2. ...or a multiple of 16777216 (= 2^24 = 16 MiB)
  //
  // However, Firefox does not implement the spec correctly. Its asm.js
  // optimizer requires a minimum heap size of 65536 (= 2^16 = 64 KiB).
  // (Tested on Firefox 94 ~ 95)
  let heapSize = 0x10_000;

  while (heapSize < minSize) {
    if (heapSize < 0x1_000_000) {
      heapSize <<= 1;
    } else {
      heapSize += 0x1_000_000;
    }
  }

  return heapSize;
}

/**
 * Return codes used by the asm.js decoder to communicate the result of decoding
 * a single image channel.
 */
const enum DecodeResult {
  Success = 0,
}

/**
 * asm.js module that decodes PSD image channels into ImageData-compatible pixel
 * data.
 * @param stdlib
 * @param foreign
 * @param buffer
 */
function AsmJsImageDecoder(
  stdlib: {Int8Array: typeof Int8Array; Uint8Array: typeof Uint8Array},
  foreign: Record<string, never>, // Empty object
  buffer: ArrayBuffer
) {
  // Disable ESLint rules that do not make sense for asm.js code
  /* eslint-disable no-var */

  "use asm";

  // We prefer Int8Array because the PackBits algorithm distinguishes
  // positive and negative numbers.
  const heap = new stdlib.Int8Array(buffer);
  /**
   * Uint8Array-based view of the heap. This is used to directly assign values
   * to each channel, since it is more familiar to developers who use
   * Uint8ClampedArray to manage pixel data.
   */
  const uHeap = new stdlib.Uint8Array(buffer);

  /**
   * Decodes a single uncompressed channel, reading the channel data from the
   * heap at {@link inputOffset} of the heap and writing the decoded result at
   * {@link outputOffset} of the heap.
   * @param inputOffset Offset of the input region in the heap
   * @param inputLength Length of the input region to read
   * @param outputOffset Offset of the output region in the heap
   * @param channelOffset Channel offset within each pixel
   *    (0 = red, 1 = green, 2 = blue, 3 = alpha)
   */
  function decodeUncompressedChannel(
    inputOffset: number,
    inputLength: number,
    outputOffset: number,
    channelOffset: ChannelOffset
  ): DecodeResult {
    inputOffset = inputOffset | 0;
    inputLength = inputLength | 0;
    outputOffset = outputOffset | 0;
    // @ts-expect-error There's no way to convince TypeScript that this is OK.
    // We can't use a type assertion here because it emits invalid asm.js code.
    channelOffset = channelOffset | 0;

    /** Offset of current input byte in the heap */
    var currentInputOffset = 0;
    /** Offset of current output byte in the heap */
    var currentOutputOffset = 0;

    // Variables to use for iteration
    var end = 0;

    currentInputOffset = inputOffset;
    // Point to the channel of the first pixel
    currentOutputOffset = (channelOffset + outputOffset) | 0;

    for (
      end = (currentInputOffset + inputLength) | 0;
      (currentInputOffset | 0) < (end | 0);
      currentInputOffset = (currentInputOffset + 1) | 0
    ) {
      heap[currentOutputOffset] = heap[currentInputOffset];
      // Move to next pixel (1 pixel == 4 bytes)
      currentOutputOffset = (currentOutputOffset + 4) | 0;
    }

    return DecodeResult.Success;
  }

  /**
   * Decodes a single RLE-encoded channel, reading the channel data from the
   * heap at {@link inputOffset} of the heap and writing the decoded result at
   * {@link outputOffset} of the heap.
   * @param inputOffset Offset of the input region in the heap
   * @param inputLength Length of the input region to read
   * @param outputOffset Offset of the output region in the heap
   * @param channelOffset Channel offset within each pixel
   *    (0 = red, 1 = green, 2 = blue, 3 = alpha)
   */
  function decodeRleChannel(
    inputOffset: number,
    inputLength: number,
    outputOffset: number,
    channelOffset: ChannelOffset
  ): DecodeResult {
    inputOffset = inputOffset | 0;
    inputLength = inputLength | 0;
    outputOffset = outputOffset | 0;
    // @ts-expect-error There's no way to convince TypeScript that this is OK.
    // We can't use a type assertion here because it emits invalid asm.js code.
    channelOffset = channelOffset | 0;

    /** Offset of current input byte in the heap */
    var currentInputOffset = 0;
    /** Offset of current output byte in the heap */
    var currentOutputOffset = 0;
    /** Value of the header byte */
    var header = 0;

    // Variables to use for iteration
    var i = 0;
    var end = 0;
    var repeatedByte = 0;
    var repeatCount = 0;

    currentInputOffset = inputOffset;
    // Point to the channel of the first pixel
    currentOutputOffset = (channelOffset + outputOffset) | 0;

    while ((currentInputOffset | 0) < ((inputOffset + inputLength) | 0)) {
      // Read the header byte
      header = heap[currentInputOffset] | 0;
      currentInputOffset = (currentInputOffset + 1) | 0;

      if ((header | 0) == -128) {
        // Skip byte
        continue;
      } else if ((header | 0) >= 0) {
        // Treat the following (header + 1) bytes as uncompressed data;
        // copy as-is
        for (
          end = (currentInputOffset + header + 1) | 0;
          (currentInputOffset | 0) < (end | 0);
          currentInputOffset = (currentInputOffset + 1) | 0
        ) {
          heap[currentOutputOffset] = heap[currentInputOffset];
          // Move to next pixel (1 pixel == 4 bytes)
          currentOutputOffset = (currentOutputOffset + 4) | 0;
        }
      } else {
        // Following byte is repeated (1 - header) times
        repeatedByte = heap[currentInputOffset] | 0;
        currentInputOffset = (currentInputOffset + 1) | 0;

        repeatCount = (1 - header) | 0;
        for (i = 0; (i | 0) < (repeatCount | 0); i = (i + 1) | 0) {
          heap[currentOutputOffset] = repeatedByte;
          // Move to next pixel (1 pixel == 4 bytes)
          currentOutputOffset = (currentOutputOffset + 4) | 0;
        }
      }
    }

    return DecodeResult.Success;
  }

  /**
   * Sets a single channel of all pixels in the output to the given value.
   * @param outputOffset Offset of the output region in the heap
   * @param outputLength Length of the output region in bytes
   * @param channelOffset Channel offset within each pixel
   *    (0 = red, 1 = green, 2 = blue, 3 = alpha)
   * @param value Value to assign to the channel. Must be between 0 and 255
   *    (inclusive)
   */
  function setChannelValue(
    outputOffset: number,
    outputLength: number,
    channelOffset: number,
    value: number
  ): DecodeResult {
    outputOffset = outputOffset | 0;
    outputLength = outputLength | 0;
    channelOffset = channelOffset | 0;
    value = value | 0;

    /** Offset of current output byte in the heap */
    var currentOutputOffset = 0;
    // Variables to use for iteration
    var end = 0;

    // Point to the channel of the first pixel
    currentOutputOffset = (channelOffset + outputOffset) | 0;
    end = (outputOffset + outputLength) | 0;

    while ((currentOutputOffset | 0) < (end | 0)) {
      uHeap[currentOutputOffset] = value | 0;
      // Move to next pixel (1 pixel == 4 bytes)
      currentOutputOffset = (currentOutputOffset + 4) | 0;
    }

    return DecodeResult.Success;
  }

  return {
    decodeUncompressedChannel: decodeUncompressedChannel,
    decodeRleChannel: decodeRleChannel,
    setChannelValue: setChannelValue,
  };

  /* eslint-enable no-var */
}
