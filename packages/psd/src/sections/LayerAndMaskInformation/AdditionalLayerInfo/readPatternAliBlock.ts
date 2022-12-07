// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  Point,
  PatternAliBlock,
  ColorTable,
  PatternData,
  PatternDataChannel,
  ChannelCompression,
  ChannelBytes,
  Pattern,
} from "../../../interfaces";
import {Cursor} from "../../../utils";
import {readPascalString} from "../../ImageResource";
import {AliBlockBody} from "./AliBlockBody";
export function readPoint(cursor: Cursor): Point {
  const vert = cursor.read("u16");
  const horiz = cursor.read("u16");

  return {vert, horiz};
}

enum ImageMode {
  Bitmap = 0,
  GrayScale = 1,
  Indexed = 2,
  RGB = 3,
  CMKYK = 4,
  MultiChannel = 7,
  Duotone = 8,
  Lab = 9,
}

export function readColorTable(cursor: Cursor): ColorTable {
  const table: ColorTable = [];

  for (let i = 0; i < 256; i++) {
    const red = cursor.read("u8");
    const green = cursor.read("u8");
    const blue = cursor.read("u8");
    table.push([red, green, blue]);
  }
  cursor.pass(4);
  return table;
}

//[[u8, u8, u8], []];

//4 length is u32
//2 length is u16
//1 length is u8

export function readRectangle(cursor: Cursor) {
  const top = cursor.read("u32");
  const left = cursor.read("u32");
  const bottom = cursor.read("u32");
  const right = cursor.read("u32");

  return {top, left, bottom, right};
}

function readChannelBytes(
  cursor: Cursor,
  size: number,
  compressionMode: number,
  height: number
): ChannelBytes {
  if (compressionMode === 0) {
    return {compression: ChannelCompression.RawData, data: cursor.take(size)};
  }

  const scanlineSize = Array.from(Array(height), () =>
    cursor.read("u16")
  ).reduce((a, b) => a + b);
  const data = cursor.take(scanlineSize);

  return {
    compression: ChannelCompression.RleCompressed,
    data,
  };
}

export function readChannel(
  cursor: Cursor,
  height: number
): PatternDataChannel | null {
  const written = cursor.read("u32");

  if (!written) {
    return null;
  }

  const length = cursor.read("u32");

  if (!length) {
    return null;
  }

  const {position} = cursor;

  const pixelDepth1 = cursor.read("u32");
  const rectangle = readRectangle(cursor);
  const pixelDepth2 = cursor.read("u16");
  const compression = cursor.read("u8");

  const size = length - (cursor.position - position);
  const channelBytes = readChannelBytes(cursor, size, compression, height);

  return {
    written: Boolean(written),
    length,
    pixelDepth1,
    rectangle,
    pixelDepth2,
    ...channelBytes,
  };
}

//https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/#VirtualMemoryArrayList
//The following is a virtual memory array, repeated for the number of channels + one for a user mask + one for a sheet mask.
export function readPatternData(cursor: Cursor, height: number): PatternData {
  const version = cursor.read("u32");
  const length = cursor.read("u32");
  const rectangle = readRectangle(cursor);
  const numberOfChannels = cursor.read("u32");
  const channels = new Map();

  for (let i = 0; i < numberOfChannels + 2; i++) {
    const channel = readChannel(cursor, height);
    channels.set(i, channel);
  }

  return {version, length, rectangle, numberOfChannels, channels};
}

export function readPattern(cursor: Cursor): Pattern {
  const version = cursor.read("u32");
  const imageMode = cursor.read("u32");

  const {vert: height, horiz: width} = readPoint(cursor);
  const name = cursor.readUnicodeString(0);
  const id = readPascalString(cursor);

  const colorTable =
    imageMode === ImageMode.Indexed ? readColorTable(cursor) : undefined;

  const patternData = readPatternData(cursor, height);

  return {
    version,
    imageMode,
    width,
    height,
    name,
    id,
    ...(colorTable ? {colorTable} : null),
    patternData,
  };
}

export function readPatternAliBlock(
  cursor: Cursor,
  size: number
): AliBlockBody<PatternAliBlock> {
  if (size === 0) {
    return {data: []};
  }

  const startPosition = cursor.position;

  let currentPosition = cursor.position;
  const data: Pattern[] = [];
  while (currentPosition - startPosition < size) {
    const patternLength = cursor.read("u32");
    currentPosition = currentPosition + patternLength;

    if (currentPosition - startPosition >= size) {
      break;
    }
    data.push(readPattern(cursor));
  }
  cursor.pass(size - (currentPosition - startPosition));

  return {
    data,
  };
}
