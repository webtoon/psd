// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import {describe, expect, it} from "vitest";

import {parseEngineData} from "../../src/methods/parseEngineData";
import {Lexer, TokenType} from "../../src/engineData";
import {Cursor, MissingEngineDataProperties} from "../../src/utils";

const FIXTURE_DIR = path.join(__dirname, "fixtures");

describe("parseEngineData", () => {
  it("should parse complex file", () => {
    const data = fs.readFileSync(path.resolve(FIXTURE_DIR, "engineData.bin"));
    const expected = JSON.parse(
      fs.readFileSync(path.resolve(FIXTURE_DIR, "engineData.json"), {
        encoding: "utf8",
      })
    );
    expect(parseEngineData(data)).toStrictEqual(expected);
  });

  it("should blame invalid file", () => {
    const data = new Uint8Array([
      0x3c, // <
      0x3c, // <
      0x2f, // /
      0x61, // a
      0x62, // b
      0x63, // c
      0x20, // ' '
      0x2f, // /
      0x61, // a
      0x62, // b
      0x63, // c
      0x3e, // >
      0x3e, // >
    ]);
    expect(() => parseEngineData(data)).toThrowError(
      MissingEngineDataProperties
    );
  });
});

describe("Lexer", () => {
  it("should decode text", () => {
    const data = [
      0x28, // (
      0xfe, // BOM - first marker
      0xff, // BOM - 2nd marker
      0x00, // padding
      0x61, // a
      0x00, // padding
      0x62, // b
      0x00, // padding
      0x63, // c
      0x29, // )
    ];
    const result = new Lexer(
      new Cursor(new DataView(new Uint8Array(data).buffer))
    ).tokens();
    const tokens = Array.from(result);
    expect(tokens).toStrictEqual([{type: TokenType.String, value: "abc"}]);
  });

  it("should recognize opening and closing of structures", () => {
    const data = [
      0x3c, // <
      0x3c, // <
      0x3e, // >
      0x3e, // >
      0x5b, // [
      0x5d, // ]
    ];
    const result = new Lexer(
      new Cursor(new DataView(new Uint8Array(data).buffer))
    ).tokens();
    const tokens = Array.from(result);
    expect(tokens).toStrictEqual([
      {type: TokenType.DictBeg},
      {type: TokenType.DictEnd},
      {type: TokenType.ArrBeg},
      {type: TokenType.ArrEnd},
    ]);
  });

  it("should recognize names", () => {
    const data = [
      0x2f, // /
      0x61, // a
      0x62, // b
      0x63, // c
      0x20, // ' '
      0x2f, // /
      0x61, // a
      0x62, // b
      0x63, // c
    ];
    const result = new Lexer(
      new Cursor(new DataView(new Uint8Array(data).buffer))
    ).tokens();
    const tokens = Array.from(result);
    expect(tokens).toStrictEqual([
      {type: TokenType.Name, value: "abc"},
      {type: TokenType.Name, value: "abc"},
    ]);
  });

  it("should recognize numbers", () => {
    const data = [
      0x2e, // .
      0x38, // 8
      0x20, // ' '
      0x31, // 1
      0x2e, // .
      0x32, // 2
      0x20, // ' '
      0x33, // 3
    ];
    const result = new Lexer(
      new Cursor(new DataView(new Uint8Array(data).buffer))
    ).tokens();
    const tokens = Array.from(result);
    expect(tokens).toStrictEqual([
      {type: TokenType.Number, value: 0.8},
      {type: TokenType.Number, value: 1.2},
      {type: TokenType.Number, value: 3},
    ]);
  });

  it("should recognize booleans", () => {
    const data = [
      0x66,
      0x61,
      0x6c,
      0x73,
      0x65, // false
      0x20, // ' '
      0x74,
      0x72,
      0x75,
      0x65, // true
    ];
    const result = new Lexer(
      new Cursor(new DataView(new Uint8Array(data).buffer))
    ).tokens();
    const tokens = Array.from(result);
    expect(tokens).toStrictEqual([
      {type: TokenType.Boolean, value: false},
      {type: TokenType.Boolean, value: true},
    ]);
  });

  it("should treat delimiters within text properly", () => {
    const data = [
      0x28, // (
      0xfe, // BOM - first marker
      0xff, // BOM - 2nd marker
      0x00, // padding
      0x61, // a
      0x00, // padding
      0x5c, // \
      0x29, // ) - escaped so should be ignored
      0x00, // padding
      0x62, // b
      0x00, // padding
      0x63, // c
      0x00, // padding
      0x5c, // \
      0x29, // ) - escaped so should be ignored
      0x00, // padding
      0x64, // d
      0x29, // )
    ];
    const result = new Lexer(
      new Cursor(new DataView(new Uint8Array(data).buffer))
    ).tokens();
    const tokens = Array.from(result);
    expect(tokens).toStrictEqual([{type: TokenType.String, value: "a)bc)d"}]);
  });

  it("should parse CJK text properly", () => {
    const data = [
      0x28, // (
      0xfe, // BOM - first marker
      0xff, // BOM - 2nd marker
      0xd4,
      0x5c,
      0x5c,
      0xc9,
      0x00,
      0x29, // )
    ];
    const result = new Lexer(
      new Cursor(new DataView(new Uint8Array(data).buffer))
    ).tokens();
    const tokens = Array.from(result);
    expect(tokens).toStrictEqual([{type: TokenType.String, value: "표준"}]);
  });
});
