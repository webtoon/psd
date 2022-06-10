// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fsPromises from "fs/promises";
import * as path from "path";
import {describe, expect, it} from "vitest";
import {
  InvalidBlendingModeSignature,
  InvalidChannelCount,
  InvalidClipping,
  InvalidColorMode,
  InvalidCompression,
  InvalidDepth,
  InvalidGroupDividerType,
  InvalidPixelCount,
  InvalidReservationCode,
  InvalidSignature,
  InvalidVersion,
  UnknownBlendingMode,
  UnsupportedDepth,
} from "../../src/utils";

const FIXTURE_DIR = path.join(__dirname, "fixtures/errors");

/**
 * Test helper function that loads a PSD file and calls `PSD.parse()` on it.
 * @param fileName Name of PSD file under `FIXTURE_DIR` directory
 * @returns Callback that parses the loaded data as a `Psd` object
 */
function parsePsdFile(fileName: string) {
  return async () => {
    const {default: PSD} = await import("../../src");
    const data = await fsPromises.readFile(path.resolve(FIXTURE_DIR, fileName));
    PSD.parse(data.buffer);
  };
}

describe("File Header section", () => {
  it("should throw if the file is empty", async () => {
    await expect(parsePsdFile("file-empty.psd")).rejects.toThrow();
  });

  it("should throw if the Signature is invalid", async () => {
    await expect(parsePsdFile("file-signature-invalid.psd")).rejects.toThrow(
      InvalidSignature
    );
  });

  it("should throw if the Version is invalid", async () => {
    await expect(parsePsdFile("file-version-invalid.psd")).rejects.toThrow(
      InvalidVersion
    );
  });

  it("should throw if the Reserved section is nonzero", async () => {
    await expect(parsePsdFile("file-reserved-nonzero.psd")).rejects.toThrow(
      InvalidReservationCode
    );
  });

  it("should throw if the Channel Count is too large", async () => {
    await expect(
      parsePsdFile("file-channel-count-too-large.psd")
    ).rejects.toThrow(InvalidChannelCount);
  });

  it("should throw if the image height is too large", async () => {
    await expect(parsePsdFile("file-image-height-30001.psd")).rejects.toThrow(
      InvalidPixelCount
    );
    await expect(parsePsdFile("file-image-height-300001.psb")).rejects.toThrow(
      InvalidPixelCount
    );
  });

  it("should throw if the image width is too large", async () => {
    await expect(parsePsdFile("file-image-width-30001.psd")).rejects.toThrow(
      InvalidPixelCount
    );
    await expect(parsePsdFile("file-image-width-300001.psb")).rejects.toThrow(
      InvalidPixelCount
    );
  });

  it("should throw if the image depth is invalid", async () => {
    await expect(parsePsdFile("file-image-depth-0.psd")).rejects.toThrow(
      InvalidDepth
    );
    await expect(parsePsdFile("file-image-depth-17.psd")).rejects.toThrow(
      InvalidDepth
    );
    await expect(parsePsdFile("file-image-depth-64.psd")).rejects.toThrow(
      InvalidDepth
    );
  });

  it("should throw if the Color Mode is invalid", async () => {
    await expect(parsePsdFile("file-color-mode-invalid.psd")).rejects.toThrow(
      InvalidColorMode
    );
  });
});

describe("Layer and Mask Information section", () => {
  it("should throw if the Blend Mode Signature is invalid", async () => {
    await expect(
      parsePsdFile("layer-blend-mode-signature-invalid.psd")
    ).rejects.toThrow(InvalidBlendingModeSignature);
  });

  it("should throw if the Blend Mode Key is invalid", async () => {
    await expect(
      parsePsdFile("layer-blend-mode-key-invalid.psd")
    ).rejects.toThrow(UnknownBlendingMode);
  });

  it("should throw if the Channel Compression Mode is invalid", async () => {
    await expect(
      parsePsdFile("layer-channel-compression-invalid.psd")
    ).rejects.toThrow(InvalidCompression);
  });

  it("should NOT throw if the Channel Kind (Channel ID) is invalid", async () => {
    // readLayerRecord()가 채널 ID값을 검사하지 않게 코드가 짜여 있어서 'not'을 사용함
    await expect(parsePsdFile("layer-channel-kind-invalid.psd")).not.toThrow();
  });

  it("should throw if the Clipping type is invalid", async () => {
    await expect(parsePsdFile("layer-clipping-invalid.psd")).rejects.toThrow(
      InvalidClipping
    );
  });

  it("should throw if the Section Divider type is invalid", async () => {
    await expect(
      parsePsdFile("layer-section-divider-invalid.psd")
    ).rejects.toThrow(InvalidGroupDividerType);
  });
});

describe("Image Data section", () => {
  // Note: The file itself is valid; our library does not support it
  it("should throw if the Image Depth is unsupported", async () => {
    await expect(parsePsdFile("image-depth-16.psd")).rejects.toThrow(
      UnsupportedDepth
    );
    await expect(parsePsdFile("image-depth-32.psd")).rejects.toThrow(
      UnsupportedDepth
    );
  });

  it("should throw if the Compression Method is invalid", async () => {
    await expect(parsePsdFile("image-compression-invalid.psd")).rejects.toThrow(
      InvalidCompression
    );
  });

  // TODO: Figure out how to make a valid PSD file that uses ZIP compression
  // it('should throw if the Image Data Compression method is unsupported', () => {
  // });
});
