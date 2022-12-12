// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  PatternAliBlock,
  ColorTable,
  PatternData,
  PatternDataChannel,
  ChannelCompression,
  ChannelBytes,
  Pattern,
  ImageMode,
} from "../../../interfaces";
import {Cursor} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

export function readPoint(cursor: Cursor): {height: number; width: number} {
  const height = cursor.read("u16");
  const width = cursor.read("u16");

  return {height, width};
}

export function readColorTable(cursor: Cursor): ColorTable {
  const table: ColorTable = [];

  for (let i = 0; i < 256; i++) {
    const red = cursor.read("u8");
    const green = cursor.read("u8");
    const blue = cursor.read("u8");
    table.push([red, green, blue]);
  }

  /**
   * There is 4 bytes padding at the end of each table.
   * This is not documented in Adobe Photoshop  File FormatsSpecification
   */
  cursor.pass(4);
  return table;
}

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

  const scanlineSize = cursor.rleCompressedSize(height, "u16");
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
    written: true,
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

  const {height, width} = readPoint(cursor);
  const name = cursor.readUnicodeString(0);
  const id = cursor.readPascalString();

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
    colorTable,
    patternData,
  };
}

export function readPatternAliBlock(
  cursor: Cursor,
  size: number
): AliBlockBody<PatternAliBlock> {
  const endAt = cursor.position + size;
  const data: Pattern[] = [];

  while (cursor.position + 4 < endAt && cursor.read("u32")) {
    data.push(readPattern(cursor));
  }
  cursor.pass(endAt - cursor.position);

  return {data};
}
