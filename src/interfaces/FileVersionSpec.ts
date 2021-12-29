// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {PsdVersion} from "../sections";
import {InvalidVersion, ReadType} from "../utils";

/**
 * Configuration object that describes structural differences (and therefore
 * differences in parsing strategy) between a PSD and PSB file.
 */
// This interface is not a structural part of the PSD file format.
// As such, it doesn't really belong in the `src/interfaces/` directory--placing
// it here was a mistake.
// TODO: Relocate this to a proper location.
export interface FileVersionSpec {
  /**
   * Maximum number of pixels in a single dimension.
   * (i.e. upper limit of image width and height)
   */
  readonly maxPixels: number;
  /**
   * Size of each scanline length field in RLE-encoded image data.
   */
  readonly rleScanlineLengthFieldSize: 2 | 4;
  /**
   * Data type to use when reading a scanline length field in RLE-encoded image
   * data.
   */
  readonly rleScanlineLengthFieldReadType: ReadType;
  readonly layerAndMaskSectionLengthFieldSize: 4 | 8;
  readonly layerInfoSectionLengthFieldSize: 4 | 8;
  /**
   * Data type to use when reading a channel length field in the Layer Record
   * section.
   */
  readonly layerRecordSectionChannelLengthFieldReadType: ReadType;
  /**
   * Whether the Additional Layer Information block's length field size is fixed
   * (4 bytes) or variable (4 or 8 bytes, depending on the key)
   */
  readonly aliLengthFieldSizeIsVariable: boolean;
}

/** Configuration object that describes how to parse a PSD (not PSB) file. */
export const PsdSpec: FileVersionSpec = {
  maxPixels: 30_000,
  rleScanlineLengthFieldSize: 2,
  rleScanlineLengthFieldReadType: "u16",
  layerAndMaskSectionLengthFieldSize: 4,
  layerInfoSectionLengthFieldSize: 4,
  layerRecordSectionChannelLengthFieldReadType: "u32",
  aliLengthFieldSizeIsVariable: false,
};

/** Configuration object that describes how to parse a PSB file. */
export const PsbSpec: FileVersionSpec = {
  maxPixels: 300_000,
  rleScanlineLengthFieldSize: 4,
  rleScanlineLengthFieldReadType: "u32",
  layerAndMaskSectionLengthFieldSize: 8,
  layerInfoSectionLengthFieldSize: 8,
  layerRecordSectionChannelLengthFieldReadType: "u64",
  aliLengthFieldSizeIsVariable: true,
};

export function getFileVersionSpec(fileVersion: PsdVersion): FileVersionSpec {
  switch (fileVersion) {
    case PsdVersion.PSD:
      return PsdSpec;
    case PsdVersion.PSB:
      return PsbSpec;
    default:
      throw new InvalidVersion();
  }
}
