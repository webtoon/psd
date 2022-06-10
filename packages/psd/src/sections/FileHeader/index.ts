// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ColorMode, Depth, getFileVersionSpec} from "../../interfaces";
import {
  Cursor,
  equals,
  inRange,
  InvalidChannelCount,
  InvalidColorMode,
  InvalidDepth,
  InvalidPixelCount,
  InvalidReservationCode,
  InvalidSignature,
  InvalidVersion,
} from "../../utils";

export enum PsdVersion {
  PSD = 1,
  PSB = 2,
}

const EXPECTED_SIGNATURE = [56, 66, 80, 83];
const EXPECTED_RESERVED = [0, 0, 0, 0, 0, 0];
const EXPECTED_DEPTH_KINDS = [1, 8, 16, 32];

const MIN_CHANNEL_COUNT = 1;
const MAX_CHANNEL_COUNT = 56;
const MIN_PIXEL = 1;

export type FileHeaderSection = {
  version: PsdVersion;
  channelCount: number;
  width: number;
  height: number;
  depth: Depth;
  colorMode: ColorMode;
};

export function parseFileHeader(dataView: DataView): FileHeaderSection {
  const cursor = new Cursor(dataView);

  const signature = cursor.take(4);
  if (!equals(signature, EXPECTED_SIGNATURE)) {
    throw new InvalidSignature();
  }

  const version = cursor.read("u16");
  if (!(version === PsdVersion.PSD || version === PsdVersion.PSB)) {
    throw new InvalidVersion();
  }
  const fileVersionSpec = getFileVersionSpec(version);

  const reserved = cursor.take(6);
  if (!equals(reserved, EXPECTED_RESERVED)) {
    throw new InvalidReservationCode();
  }

  const channelCount = cursor.read("u16");
  if (!inRange(channelCount, MIN_CHANNEL_COUNT, MAX_CHANNEL_COUNT)) {
    throw new InvalidChannelCount();
  }

  const height = cursor.read("u32");
  const width = cursor.read("u32");
  if (
    !inRange(height, MIN_PIXEL, fileVersionSpec.maxPixels) ||
    !inRange(width, MIN_PIXEL, fileVersionSpec.maxPixels)
  ) {
    throw new InvalidPixelCount();
  }

  const depth = cursor.read("u16");
  if (!EXPECTED_DEPTH_KINDS.includes(depth)) {
    throw new InvalidDepth();
  }

  const colorMode = cursor.read("u16");
  if (colorMode in ColorMode === false) {
    throw new InvalidColorMode();
  }

  return {
    channelCount,
    version,
    width,
    height,
    depth,
    colorMode,
  };
}
