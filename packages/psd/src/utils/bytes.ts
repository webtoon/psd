// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {NumberTooLarge, PanicOutOfBoundArray} from "./error";

export type ReadType =
  | "u8"
  | "u16"
  | "u32"
  | "u64"
  | "i8"
  | "i16"
  | "i32"
  | "i64"
  | "f32"
  | "f64";

// The following two functions are used to safely decode a subset of 64-bit
// integers into regular JavaScript numbers without using BigInt.
// TODO: Remove these when we can use BigInt

/**
 * Decodes a 64-bit region at the given byte offset of the `DataView` as an
 * unsigned 64-bit integer (big endian).
 *
 * If the parsed value is too large to safely fit into a JavaScript `Number`,
 * throws an error.
 * @param data DataView
 * @param byteOffset
 */
export function getUint64FromDataView(
  data: DataView,
  byteOffset: number
): number {
  const upper = data.getUint32(byteOffset);
  const lower = data.getUint32(byteOffset + 4);

  // Throw if the value is greater than MAX_SAFE_INTEGER (2^53 - 1)
  if (upper >= 0x20_0000) {
    throw new NumberTooLarge();
  }

  return upper * 0x1_0000_0000 + lower;
}

/**
 * Decodes a 64-bit region at the given byte offset of the `DataView` as a
 * signed 64-bit integer (big endian).
 *
 * If the parsed value is too large to safely fit into a JavaScript `Number`,
 * throws an error.
 * @param data DataView
 * @param byteOffset
 */
export function getInt64FromDataView(
  data: DataView,
  byteOffset: number
): number {
  const upper = data.getInt32(byteOffset); // upper must be decoded as signed value
  const lower = data.getUint32(byteOffset + 4);

  // Throw if the value is greater than MAX_SAFE_INTEGER (2^53 - 1) or less
  // than MIN_SAFE_INTEGER (-(2^53 - 1))
  if (
    upper >= 0x20_0000 ||
    upper < -0x20_0000 ||
    (upper === -0x20_0000 && lower === 0)
  ) {
    throw new NumberTooLarge();
  }

  return upper * 0x1_0000_0000 + lower;
}

const INCREASE: {[type in ReadType]: number} = {
  u8: 1,
  i8: 1,
  u16: 2,
  i16: 2,
  u32: 4,
  i32: 4,
  f32: 4,
  u64: 8,
  i64: 8,
  f64: 8,
};

/**
 * Utility class that wraps around a `DataView` and tracks the current offset
 * being parsed.
 */
export class Cursor {
  static from(bytes: Uint8Array) {
    return new Cursor(
      new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    );
  }

  constructor(private dataView: DataView, public position = 0) {}

  /**
   * Length of the data covered by this Cursor.
   */
  get length(): number {
    return this.dataView.byteLength;
  }

  /**
   * Clones the cursor, optionally specifying a new cursor position.
   */
  clone(position?: number): Cursor {
    const pos = position !== undefined ? position : this.position;

    return new Cursor(
      new DataView(
        this.dataView.buffer,
        this.dataView.byteOffset,
        this.dataView.byteLength
      ),
      pos
    );
  }

  pass(length: number): void {
    this.position += length;
  }

  unpass(length: number): void {
    this.position -= length;
  }

  /**
   * Creates a `Uint8Array` that covers the underlying `ArrayBuffer` of this
   * cursor, starting at the current cursor position and spanning a
   * {@link length} number of bytes.
   * This does not advance the cursor.
   */
  extract(length: number): Uint8Array {
    // The Uint8Array() constructor will throw if length < 0, so we don't need
    // a check.
    // However, if our DataView covers a subset of the underlying ArrayBuffer,
    // the cursor can technically read beyond the end of the DataView.
    // To prevent this, we must directly check the byte length being accessed.
    if (this.position + length > this.dataView.byteLength) {
      throw new PanicOutOfBoundArray();
    }

    return new Uint8Array(
      this.dataView.buffer,
      this.dataView.byteOffset + this.position,
      length
    );
  }

  iter(): Uint8Array {
    return new Uint8Array(
      this.dataView.buffer,
      this.dataView.byteOffset + this.position
    );
  }

  /**
   * Creates a `Uint8Array` that covers the underlying `ArrayBuffer` of this
   * cursor, starting at the current cursor position and spanning a
   * {@link length} number of bytes.
   * This advances the cursor by `length` bytes.
   */
  take(length: number): Uint8Array {
    const bytes = this.extract(length);
    this.pass(length);

    return bytes;
  }

  /**
   * Returns subsequent byte, without advancing position
   */
  peek(): number {
    // dataView throws RangeError if position is outside bounds
    return this.dataView.getUint8(this.position);
  }

  /**
   * Returns subsequent byte
   */
  one(): number {
    // dataView throws RangeError if position is outside bounds
    const val = this.dataView.getUint8(this.position);
    this.position += 1;
    return val;
  }

  /**
   * Reads a number at the current cursor position, using the given {@link type}
   * (big endian).
   * This advances the cursor by the size of the data `type`.
   */
  read(type: ReadType): number {
    const {dataView, position} = this;
    this.pass(INCREASE[type]);

    switch (type) {
      case "u8":
        return dataView.getUint8(position);
      case "u16":
        return dataView.getUint16(position);
      case "u32":
        return dataView.getUint32(position);
      case "u64":
        return getUint64FromDataView(dataView, position);
      case "i8":
        return dataView.getInt8(position);
      case "i16":
        return dataView.getInt16(position);
      case "i32":
        return dataView.getInt32(position);
      case "i64":
        return getInt64FromDataView(dataView, position);
      case "f32":
        return dataView.getFloat32(position);
      case "f64":
        return dataView.getFloat64(position);
      default:
        throw new TypeError(`Invalid ReadType: ${type}`);
    }
  }

  /**
   * Reads {@link length} bytes of data and decodes it as a UTF-8 string.
   * This advances the cursor by `length` bytes.
   * @param length Length of the data to read in bytes
   * @returns Decoded string
   */
  readString(length: number): string {
    const data = this.take(length);
    const result = new TextDecoder().decode(data);
    return result;
  }

  /**
   * Parses a "Pascal string", as described in Adobe's documentation.
   * A Pascal string is structured as:
   *
   * | Size (bytes) |         Content        |
   * |--------------|------------------------|
   * | 1            | Length                 |
   * | 0 ~ 255      | Characters             |
   * | 0 ~ ?        | Alignment (whitespace) |
   *
   * If {@link alignment} is provided, this function _may_ skip alignment bytes
   * until the total of (length field) + (characters) + (alignment) is a multiple
   * of the `alignment` value.
   * If `alignment` is unspecified or 0, no alignment bytes are skipped.
   */
  readPascalString(alignment = 0): string {
    const length = this.read("u8");
    const value = this.readString(length);

    if (alignment) {
      const remainder = (length + 1) % alignment;
      if (remainder > 0) {
        this.pass(alignment - remainder);
      }
    }

    return value;
  }

  /**
   * Reads the length of the string (u32 field) at the current cursor position,
   * then reads the rest of the string and decodes it as UTF-16BE.
   * This advances the cursor.
   *
   * If {@link padding} is specified, this skips additional bytes until the
   * total number of bytes advanced is a multiple of `padding`
   * @param padding Padding (alignment) byte count
   * @returns Decoded string
   */
  // TODO: Default padding of 4 is probably nonsensical and surprising.
  // Let's change it to 0 and update all call sites.
  readUnicodeString(padding = 4): string {
    const length = this.read("u32");

    // UTF-16 encoding - two bytes per character
    const lengthBytes = length * 2;
    const data = this.take(lengthBytes);
    const result = new TextDecoder("utf-16be").decode(data);

    // Increase position for padding
    this.padding(4 + lengthBytes, padding);

    // Some strings (e.g. layer text) may be null(0)-terminated
    // If so, strip the final character
    if (result.charCodeAt(result.length - 1) === 0) {
      return result.slice(0, -1);
    }

    return result;
  }

  /**
   * Reads unsigned 4-byte fixed-point number.
   * 32 bits in 16.16 setup
   * https://github.com/meltingice/psd.js/blob/333dd1467452a3353018c2856e3e4fb0e07d0025/lib/psd/resources/resolution_info.coffee#L10
   */
  readFixedPoint32bit(): number {
    const int = this.read("u32");
    return int / (1 << 16);
  }

  /**
   * Decodes an "ID string", which is a compact string format used in
   * Descriptors.
   *
   * Reads the length of the string (u32 field) at the current cursor position,
   * then reads the rest of the string and decodes it as UTF-8.
   * If the value of the length field is 0, this always decodes 4 bytes of
   * characters.
   */
  readIdString(): string {
    const length = this.read("u32");
    return this.readString(length || 4);
  }

  /**
   * Skips an amount of bytes so that a {@link size}-byte block is aligned to a
   * multiple of {@link divisor}.
   *
   * @example
   * // Skips 5 bytes, which aligns a 75-byte block to a
   * // multiple of 8
   * cursor.padding(75, 8);
   *
   * @param size Value to align against
   * @param divisor Alignment number (can be 0)
   */
  padding(size: number, divisor: number): void {
    const remainder = size % divisor;
    if (remainder > 0) {
      this.pass(divisor - remainder);
    }
  }

  /**
   * Reads size of compressed data
   * @param scanLines is number of lines and each line holds size information about part compressed data
   *  we extract the sum of each individual read field.
   */
  rleCompressedSize(scanLines: number, readType: ReadType): number {
    const sizes = Array.from(Array(scanLines), () => this.read(readType));
    return sizes.reduce((a, b) => a + b);
  }
}
