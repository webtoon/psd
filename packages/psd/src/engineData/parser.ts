// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  InvalidEngineDataDictKey,
  InvalidTopLevelEngineDataValue,
  UnexpectedEndOfEngineData,
} from "../utils";
import {Token, TokenType} from "./lexer";

export type RawEngineData = {
  [key: string]: RawEngineValue;
};
export type RawEngineValue =
  | string
  | number
  | boolean
  | RawEngineValue[]
  | RawEngineData;

const ARR_BOUNDARY = Symbol(TokenType[TokenType.ArrBeg]);
const DICT_BOUNDARY = Symbol(TokenType[TokenType.DictBeg]);

export class Parser {
  private stack: (
    | RawEngineValue
    | typeof ARR_BOUNDARY
    | typeof DICT_BOUNDARY
  )[] = [];
  constructor(private tokens: Generator<Token>) {}

  parse(): RawEngineData {
    this.runParser();
    const [value] = this.stack;
    if (typeof value === "object" && !Array.isArray(value)) {
      return value;
    }
    throw new InvalidTopLevelEngineDataValue(
      `EngineData top-level value is not a dict; is ${typeof value}`
    );
  }

  private runParser() {
    for (const it of this.tokens) {
      switch (it.type) {
        case TokenType.Name:
        case TokenType.Number:
        case TokenType.Boolean:
        case TokenType.String:
          this.stack.push(it.value);
          continue;
        case TokenType.DictBeg:
          this.stack.push(DICT_BOUNDARY);
          continue;
        case TokenType.ArrBeg:
          this.stack.push(ARR_BOUNDARY);
          continue;
        case TokenType.DictEnd:
          this.stack.push(this.dict());
          continue;
        case TokenType.ArrEnd:
          this.stack.push(this.array().reverse());
          continue;
      }
    }
  }

  private dict(): RawEngineData {
    const val = {} as RawEngineData;
    for (;;) {
      const value = this.stack.pop();
      // TODO: new error types?
      if (value === undefined) {
        throw new UnexpectedEndOfEngineData("Stack empty when parsing dict");
      }
      if (value === DICT_BOUNDARY) {
        return val;
      }
      if (value === ARR_BOUNDARY) {
        throw new InvalidEngineDataDictKey("Got ArrBeg while parsing a dict");
      }
      const it = this.stack.pop();
      if (typeof it !== "string") {
        throw new InvalidEngineDataDictKey(
          `Dict key is not Name; is ${typeof it}`
        );
      }
      val[it] = value;
    }
  }

  private array(): RawEngineValue[] {
    const val = [] as RawEngineValue[];
    for (;;) {
      const it = this.stack.pop();
      // TODO: new error types?
      if (it === undefined) {
        throw new UnexpectedEndOfEngineData("Stack empty when parsing array");
      }
      if (it === DICT_BOUNDARY) {
        throw new InvalidEngineDataDictKey("Got DictBeg while parsing array");
      }
      if (it === ARR_BOUNDARY) {
        return val;
      }
      val.push(it);
    }
  }
}
