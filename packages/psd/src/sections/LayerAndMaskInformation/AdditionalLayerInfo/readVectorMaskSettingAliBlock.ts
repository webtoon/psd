// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  PathRecord,
  PathRecordType,
  Point,
  VectorMaskSettingAliBlock,
} from "../../../interfaces";
import {Cursor} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

/**
 * Reads signed 32-bit fixed-point number with 8bits.24bits.
 * https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/#50577409_17587
 *  All points used in defining a path are stored in eight bytes as a pair of
 *  32-bit components, vertical component first.
 *  The two components are signed, fixed point numbers with 8 bits before the binary
 *  point and 24 bits after the binary point. Three guard bits are reserved in the
 *  points to eliminate most concerns over arithmetic overflow. Hence, the range for
 *  each component is 0xF0000000 to 0x0FFFFFFF representing a range of -16 to 16.
 *  The lower bound is included, but not the upper bound.

 *  This limited range is used because the points are expressed relative to the
 *  image size. The vertical component is given with respect to the image height,
 *  and the horizontal component is given with respect to the image width. [ 0,0 ]
 *  represents the top-left corner of the image; [ 1,1 ] ([ 0x01000000,0x01000000 ])
 *  represents the bottom-right.
 */
function readFixedPoint32bit(cursor: Cursor): number {
  const [beforeValue, ...afterPoint] = cursor.take(4);
  const afterValue =
    afterPoint[0] * 2 ** 16 + afterPoint[1] * 2 ** 8 + afterPoint[2];
  return beforeValue + afterValue / 2 ** 24;
}

function readPoint(cursor: Cursor): Point {
  const vert = readFixedPoint32bit(cursor);
  const horiz = readFixedPoint32bit(cursor);
  return {vert, horiz};
}

function readSubpath(cursor: Cursor, type: number): PathRecord {
  const length = cursor.read("i16");
  const operation = cursor.read("i16");
  const subpathType = cursor.read("i16");
  cursor.pass(6);
  const index = cursor.read("i16");
  cursor.pass(10);
  return {
    type,
    length,
    operation,
    subpathType,
    index,
  };
}

function readClipboard(cursor: Cursor, type: number): PathRecord {
  const bounds = Array(4).map(() => cursor.read("f32")) as [
    number,
    number,
    number,
    number
  ];
  const resolution = cursor.read("f32");
  cursor.pass(6);
  return {type, bounds, resolution};
}

function readFillRule(cursor: Cursor, type: number): PathRecord {
  const fill = Boolean(cursor.read("i16") & 1);
  cursor.pass(22);
  return {type, fill};
}

function readBezierKnot(cursor: Cursor, type: number): PathRecord {
  const preceding = readPoint(cursor);
  const anchor = readPoint(cursor);
  const leaving = readPoint(cursor);
  return {type, preceding, anchor, leaving};
}

function readPathRecord(cursor: Cursor): PathRecord {
  const type = cursor.read("u16");
  switch (type) {
    case PathRecordType.OpenSubpathLength:
    case PathRecordType.ClosedSubpathLength:
      return readSubpath(cursor, type);
    case PathRecordType.PathFillRule:
      cursor.pass(24);
      return {type};
    case PathRecordType.Clipboard:
      return readClipboard(cursor, type);
    case PathRecordType.InitialFillRule:
      return readFillRule(cursor, type);
    case PathRecordType.ClosedSubpathBezierKnotLinked:
    case PathRecordType.ClosedSubpathBezierKnotUnlinked:
    case PathRecordType.OpenSubpathBezierKnotLinked:
    case PathRecordType.OpenSubpathBezierKnotUnlinked:
      return readBezierKnot(cursor, type);
    default:
      throw new Error(`Unknown PathRecordType: ${type} (bug in offsets?)`);
  }
}

function readPathRecords(cursor: Cursor, size: number): PathRecord[] {
  const count = Math.floor(size / 26);
  return Array.from(Array(count), () => readPathRecord(cursor));
}

export function readVectorMaskSettingAliBlock(
  cursor: Cursor,
  size: number
): AliBlockBody<VectorMaskSettingAliBlock> {
  const version = cursor.read("u32");
  const flags = cursor.read("u32");
  const pathRecords = readPathRecords(cursor, size);
  return {
    version,
    pathRecords,
    invert: Boolean(flags & 1),
    notLink: Boolean(flags & 2),
    disable: Boolean(flags & 4),
  };
}
