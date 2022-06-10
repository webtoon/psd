// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {describe, expect, it} from "vitest";
import {PanicOutOfBoundArray} from "../../src/utils";
import {Cursor, ReadType} from "../../src/utils/bytes";

const ALL_ZEROS = [0, 0, 0, 0, 0, 0, 0, 0];
const ALL_ONES = [255, 255, 255, 255, 255, 255, 255, 255];

describe("Cursor", () => {
  it("should throw if wanted position is out of bounds", () => {
    const dataView = new DataView(new Uint8Array([1, 2, 3, 4, 5]).buffer);
    const cursor = new Cursor(dataView);
    expect(() => cursor.extract(-1)).toThrow(
      new RangeError("Invalid typed array length: -1")
    );
    expect(() => cursor.extract(99)).toThrow(PanicOutOfBoundArray);
  });

  it("should be cloned successfully", () => {
    const dataView = new DataView(
      new Uint8Array([1, 2, 3, 4, 5, 6, 7]).buffer,
      1,
      5
    );
    const cursor1 = new Cursor(dataView, 1);
    const cursor2 = cursor1.clone();
    expect(cursor1.read("u32")).toBe(cursor2.read("u32"));
  });

  it("should correctly decode non-Unicode strings", () => {
    // ABCDEFGH
    const array = new Uint8Array([65, 66, 67, 68, 69, 70, 71, 72]);
    //  BCDEFG
    const dataView = new DataView(array.buffer, 1, 6);
    //   CDEFG
    const cursor = new Cursor(dataView, 1);

    expect(cursor.readString(4)).toBe("CDEF");
    expect(cursor.position).toBe(5);
  });

  it("should correctly decode ID strings with zeroed length field", () => {
    // 0xAB_CD_00_00_00_00_41_42_43_44_45_46
    const array = new Uint8Array([
      0xab, 0xcd, 0x00, 0x00, 0x00, 0x00, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46,
    ]);
    //    0xCD_00_00_00_00_41_42_43_44_45
    const dataView = new DataView(array.buffer, 1, 10);
    //       0x00_00_00_00_41_42_43_44_45
    const cursor = new Cursor(dataView, 1);

    expect(cursor.readIdString()).toBe("ABCD");
    expect(cursor.position).toBe(9);
  });

  it("should correctly decode ID strings with non-zero length field", () => {
    // 0xAB_CD_00_00_00_06_50_51_52_53_54_55_56_57
    const array = new Uint8Array([
      0xab, 0xcd, 0x00, 0x00, 0x00, 0x06, 0x50, 0x51, 0x52, 0x53, 0x54, 0x55,
      0x56, 0x57,
    ]);
    //    0xCD_00_00_00_06_50_51_52_53_54_55_56
    const dataView = new DataView(array.buffer, 1, 12);
    //       0x00_00_00_06_50_51_52_53_54_55_56
    const cursor = new Cursor(dataView, 1);

    expect(cursor.readIdString()).toBe("PQRSTU");
    expect(cursor.position).toBe(11);
  });

  it("should correctly decode Unicode (UTF-16BE) strings", () => {
    // 0x83_82_81_80_00_00_00_02_00_41_00_42_00_43_00_44_00_45_00_46_00_47
    const array = new Uint8Array([
      0x83, 0x82, 0x81, 0x80, 0x00, 0x00, 0x00, 0x02, 0x00, 0x41, 0x00, 0x42,
      0x00, 0x43, 0x00, 0x44, 0x00, 0x45, 0x00, 0x46, 0x00, 0x47,
    ]);
    // 0x   82_81_80_00_00_00_02_00_41_00_42_00_43_00_44_00_45_00_46
    const dataView = new DataView(array.buffer, 1, 19);
    // 0x            00_00_00_02_00_41_00_42_00_43_00_44_00_45
    //               ^^^^^^^^^^^ ^^^^^ ^^^^^ ^^^^^ ^^^^^ ^^^^^
    //                  length     A     B     C     D     E
    const cursor = new Cursor(dataView, 3);

    expect(cursor.readUnicodeString(0)).toBe("AB");
    expect(cursor.position).toBe(11);
  });

  it("should correctly decode null-terminated Unicode (UTF-16BE) strings", () => {
    // 0x83_82_81_80_00_00_00_02_00_41_00_00_00_43_00_44_00_45_00_46_00_47
    const array = new Uint8Array([
      0x83, 0x82, 0x81, 0x80, 0x00, 0x00, 0x00, 0x02, 0x00, 0x41, 0x00, 0x00,
      0x00, 0x43, 0x00, 0x44, 0x00, 0x45, 0x00, 0x46, 0x00, 0x47,
    ]);
    // 0x   82_81_80_00_00_00_02_00_41_00_00_00_43_00_44_00_45_00_46
    const dataView = new DataView(array.buffer, 1, 19);
    // 0x            00_00_00_02_00_41_00_00_00_43_00_44_00_45
    //               ^^^^^^^^^^^ ^^^^^ ^^^^^ ^^^^^ ^^^^^ ^^^^^
    //                  length     A    NULL   C     D     E
    const cursor = new Cursor(dataView, 3);

    expect(cursor.readUnicodeString(0)).toBe("A");
    expect(cursor.position).toBe(11);
  });

  it.each([
    {valueType: "u8", bytes: ALL_ZEROS, expected: 0},
    {valueType: "u8", bytes: ALL_ONES, expected: 255},
    {valueType: "u16", bytes: ALL_ZEROS, expected: 0},
    {valueType: "u16", bytes: ALL_ONES, expected: 65535},
    {valueType: "u32", bytes: ALL_ZEROS, expected: 0},
    {valueType: "u32", bytes: ALL_ONES, expected: 4294967295},
    {valueType: "u64", bytes: ALL_ZEROS, expected: 0},
    // MAX_SAFE_INTEGER (2 ** 53 - 1)
    {
      valueType: "u64",
      bytes: [0, 31, 255, 255, 255, 255, 255, 255],
      expected: 0x1f_ffff_ffff_ffff,
    },

    {valueType: "i8", bytes: ALL_ZEROS, expected: 0},
    {valueType: "i8", bytes: [127], expected: 127},
    {valueType: "i8", bytes: [128], expected: -128},
    {valueType: "i8", bytes: ALL_ONES, expected: -1},
    {valueType: "i16", bytes: ALL_ZEROS, expected: 0},
    {valueType: "i16", bytes: [127, 255], expected: 32767},
    {valueType: "i16", bytes: [128, 0], expected: -32768},
    {valueType: "i16", bytes: ALL_ONES, expected: -1},
    {valueType: "i32", bytes: ALL_ZEROS, expected: 0},
    {valueType: "i32", bytes: [127, 255, 255, 255], expected: 2147483647},
    {valueType: "i32", bytes: [128, 0, 0, 0], expected: -2147483648},
    {valueType: "i32", bytes: ALL_ONES, expected: -1},
    {valueType: "i64", bytes: ALL_ZEROS, expected: 0},
    // MAX_SAFE_INTEGER (2 ** 53 - 1)
    {
      valueType: "i64",
      bytes: [0, 31, 255, 255, 255, 255, 255, 255],
      expected: 0x1f_ffff_ffff_ffff,
    },
    // MIN_SAFE_INTEGER (-(2 ** 53 - 1))
    {
      valueType: "i64",
      bytes: [255, 224, 0, 0, 0, 0, 0, 1],
      expected: -0x1f_ffff_ffff_ffff,
    },
    {
      valueType: "i64",
      bytes: [255, 255, 255, 255, 255, 255, 255, 255],
      expected: -1,
    },

    {
      valueType: "f64",
      bytes: [64, 9, 33, 251, 84, 68, 46, 234],
      expected: 3.14159265359,
    },
  ])(
    "should correctly parse safe $valueType value ($expected)",
    ({valueType, bytes, expected}) => {
      const dataView = new DataView(new Uint8Array(bytes).buffer);
      const cursor = new Cursor(dataView);
      expect(cursor.read(valueType as ReadType)).toBe(expected);
    }
  );
});
