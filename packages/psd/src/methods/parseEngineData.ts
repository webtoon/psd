// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {Lexer, Parser, validateEngineData} from "../engineData";
import {EngineData} from "../interfaces";
import {Cursor, MissingEngineDataProperties} from "../utils";

export function parseEngineData(raw: Uint8Array): EngineData {
  const value = new Parser(
    new Lexer(
      new Cursor(new DataView(raw.buffer, raw.byteOffset, raw.length))
    ).tokens()
  ).parse();
  if (validateEngineData(value)) {
    return value;
  }
  throw new MissingEngineDataProperties(
    `Object with keys ${JSON.stringify(
      Object.keys(value)
    )} is not valid EngineData`
  );
}
