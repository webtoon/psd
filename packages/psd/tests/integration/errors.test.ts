// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";

import PSD from "../../src/index";
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
  const data = fs.readFileSync(path.resolve(FIXTURE_DIR, fileName));
  return () => PSD.parse(data.buffer);
}

describe("File Header section", () => {
  it("should throw if the file is empty", () => {
    expect(parsePsdFile("file-empty.psd")).toThrow();
  });

  it("should throw if the Signature is invalid", () => {
    expect(parsePsdFile("file-signature-invalid.psd")).toThrow(
      InvalidSignature
    );
  });

  it("should throw if the Version is invalid", () => {
    expect(parsePsdFile("file-version-invalid.psd")).toThrow(InvalidVersion);
  });

  it("should throw if the Reserved section is nonzero", () => {
    expect(parsePsdFile("file-reserved-nonzero.psd")).toThrow(
      InvalidReservationCode
    );
  });

  it("should throw if the Channel Count is too large", () => {
    expect(parsePsdFile("file-channel-count-too-large.psd")).toThrow(
      InvalidChannelCount
    );
  });

  it("should throw if the image height is too large", () => {
    expect(parsePsdFile("file-image-height-30001.psd")).toThrow(
      InvalidPixelCount
    );
    expect(parsePsdFile("file-image-height-300001.psb")).toThrow(
      InvalidPixelCount
    );
  });

  it("should throw if the image width is too large", () => {
    expect(parsePsdFile("file-image-width-30001.psd")).toThrow(
      InvalidPixelCount
    );
    expect(parsePsdFile("file-image-width-300001.psb")).toThrow(
      InvalidPixelCount
    );
  });

  it("should throw if the image depth is invalid", () => {
    expect(parsePsdFile("file-image-depth-0.psd")).toThrow(InvalidDepth);
    expect(parsePsdFile("file-image-depth-17.psd")).toThrow(InvalidDepth);
    expect(parsePsdFile("file-image-depth-64.psd")).toThrow(InvalidDepth);
  });

  it("should throw if the Color Mode is invalid", () => {
    expect(parsePsdFile("file-color-mode-invalid.psd")).toThrow(
      InvalidColorMode
    );
  });
});

describe("Layer and Mask Information section", () => {
  it("should throw if the Blend Mode Signature is invalid", () => {
    expect(parsePsdFile("layer-blend-mode-signature-invalid.psd")).toThrow(
      InvalidBlendingModeSignature
    );
  });

  it("should throw if the Blend Mode Key is invalid", () => {
    expect(parsePsdFile("layer-blend-mode-key-invalid.psd")).toThrow(
      UnknownBlendingMode
    );
  });

  it("should throw if the Channel Compression Mode is invalid", () => {
    expect(parsePsdFile("layer-channel-compression-invalid.psd")).toThrow(
      InvalidCompression
    );
  });

  it("should NOT throw if the Channel Kind (Channel ID) is invalid", () => {
    // readLayerRecord()가 채널 ID값을 검사하지 않게 코드가 짜여 있어서 'not'을 사용함
    expect(parsePsdFile("layer-channel-kind-invalid.psd")).not.toThrow();
  });

  it("should throw if the Clipping type is invalid", () => {
    expect(parsePsdFile("layer-clipping-invalid.psd")).toThrow(InvalidClipping);
  });

  it("should throw if the Section Divider type is invalid", () => {
    expect(parsePsdFile("layer-section-divider-invalid.psd")).toThrow(
      InvalidGroupDividerType
    );
  });
});

describe("Image Data section", () => {
  // Note: The file itself is valid; our library does not support it
  it("should throw if the Image Depth is unsupported", () => {
    expect(parsePsdFile("image-depth-16.psd")).toThrow(UnsupportedDepth);
    expect(parsePsdFile("image-depth-32.psd")).toThrow(UnsupportedDepth);
  });

  it("should throw if the Compression Method is invalid", () => {
    expect(parsePsdFile("image-compression-invalid.psd")).toThrow(
      InvalidCompression
    );
  });

  // TODO: Figure out how to make a valid PSD file that uses ZIP compression
  // it('should throw if the Image Data Compression method is unsupported', () => {
  // });
});
