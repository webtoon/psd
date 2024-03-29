// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

// Based on PDF grammar: https://web.archive.org/web/20220226063926/https://www.adobe.com/content/dam/acom/en/devnet/pdf/pdfs/PDF32000_2008.pdf
// Section 7.2 - Lexical Conventions

import {
  Cursor,
  InvalidEngineDataBoolean,
  InvalidEngineDataNumber,
  InvalidEngineDataTextBOM,
} from "../utils";

export enum TokenType {
  String,
  DictBeg,
  DictEnd,
  ArrBeg,
  ArrEnd,
  Name,
  Number,
  Boolean,
}

export type Token =
  | {type: TokenType.String; value: string}
  | {type: TokenType.DictBeg}
  | {type: TokenType.DictEnd}
  | {type: TokenType.ArrBeg}
  | {type: TokenType.ArrEnd}
  | {type: TokenType.Name; value: string}
  | {type: TokenType.Number; value: number}
  | {type: TokenType.Boolean; value: boolean};

const WhitespaceCharacters = new Set([
  0,
  9,
  12,
  32, // ' '
  10, // \n
  13, // \r
]);

const BooleanStartCharacters = new Set([
  0x66, // f
  0x74, // t
]);

const Delimiters = {
  "(": 0x28,
  ")": 0x29,
  "<": 0x3c,
  ">": 0x3e,
  "[": 0x5b,
  "]": 0x5d,
  "/": 0x2f,
  "\\": 0x5c,
  // NOTE: These have meaning within PDF. Are they used here?
  // "{": 123,
  // "}": 125,
  // "%": 37,
};

const DelimiterCharacters = new Set(Object.values(Delimiters));

const STRING_TOKEN_JT = [] as boolean[];
for (let i = 0; i < 256; i += 1) {
  STRING_TOKEN_JT[i] =
    WhitespaceCharacters.has(i) || DelimiterCharacters.has(i);
}

const STRING_DECODER = new TextDecoder("utf-8");
function stringToken(cursor: Cursor): string {
  const startsAt = cursor.position;
  let endsAt = cursor.position;
  for (const i of cursor.iter()) {
    if (STRING_TOKEN_JT[i]) {
      break;
    }
    endsAt += 1;
  }
  const text = STRING_DECODER.decode(cursor.take(endsAt - startsAt));
  return text;
}

export class Lexer {
  cursor: Cursor;

  constructor(cursor: Uint8Array) {
    this.cursor = Cursor.from(cursor);
  }

  tokens(): Token[] {
    const value = [] as Token[];
    while (!this.done()) {
      const val = this.cursor.one();

      if (WhitespaceCharacters.has(val)) {
        while (!this.done() && WhitespaceCharacters.has(this.cursor.peek()))
          this.cursor.pass(1);
        continue;
      }
      if (DelimiterCharacters.has(val)) {
        if (val === Delimiters["("]) {
          value.push({type: TokenType.String, value: this.text()});
          continue;
        }
        if (val === Delimiters["["]) {
          value.push({type: TokenType.ArrBeg});
          continue;
        }
        if (val === Delimiters["]"]) {
          value.push({type: TokenType.ArrEnd});
          continue;
        }
        if (val === Delimiters["<"]) {
          // NOTE: assert that it is < indeed?
          this.cursor.pass(1);
          value.push({type: TokenType.DictBeg});
          continue;
        }
        if (val === Delimiters[">"]) {
          // NOTE: assert that it is > indeed?
          this.cursor.pass(1);
          value.push({type: TokenType.DictEnd});
          continue;
        }
        if (val === Delimiters["/"]) {
          value.push({type: TokenType.Name, value: this.string()});
          continue;
        }
        console.assert(
          false,
          "Unhandled delimiter: '%s'",
          String.fromCharCode(val)
        );
        continue;
      }
      // only two types left: number or boolean
      // we need to return val first since it starts value
      this.cursor.unpass(1);
      if (BooleanStartCharacters.has(val)) {
        value.push({type: TokenType.Boolean, value: this.boolean()});
      } else {
        value.push({type: TokenType.Number, value: this.number()});
      }
    }
    return value;
  }

  private done(): boolean {
    return this.cursor.position >= this.cursor.length;
  }

  private text(): string {
    const firstByte = this.cursor.peek();
    if (firstByte === Delimiters[")"]) {
      this.cursor.pass(1);
      return "";
    }
    const hasBom = firstByte === 0xff || firstByte === 0xfe;
    let decoder = new TextDecoder("utf-16be");
    if (hasBom) {
      decoder = this.textDecoderFromBOM();
    }
    const textParts = [] as string[];
    const readAhead = this.cursor.clone();
    while (readAhead.peek() !== Delimiters[")"]) {
      readAhead.pass(1);
      if (readAhead.peek() === Delimiters["\\"]) {
        const length = readAhead.position - this.cursor.position;
        textParts.push(
          decoder.decode(this.cursor.take(length), {stream: true})
        );
        readAhead.pass(2); // skip over \\
        this.cursor.pass(1); // skip over escaped character to avoid decoding it in subsequent part
        textParts.push(decoder.decode(this.cursor.take(1), {stream: true})); // push un-escaped character
      }
    }
    const length = readAhead.position - this.cursor.position;
    const raw = this.cursor.take(length);
    textParts.push(decoder.decode(raw));
    this.cursor.pass(1); // final )
    return textParts.join("");
  }

  private textDecoderFromBOM(): TextDecoder {
    const firstBomPart = this.cursor.one();
    const sndBomPart = this.cursor.one();
    // https://en.wikipedia.org/wiki/Byte_order_mark#UTF-16
    // LE is FF FE
    if (firstBomPart === 0xff && sndBomPart === 0xfe)
      return new TextDecoder("utf-16le");
    // BE is FE FF
    if (firstBomPart === 0xfe && sndBomPart === 0xff)
      return new TextDecoder("utf-16be");
    throw new InvalidEngineDataTextBOM(
      `Unknown BOM value: [${firstBomPart}, ${sndBomPart}]`
    );
  }

  private string(): string {
    return stringToken(this.cursor);
  }

  private number(): number {
    const text = this.string();
    const value = Number(text);
    if (Number.isNaN(value)) {
      throw new InvalidEngineDataNumber(`parsing '${text}' as Number failed`);
    }
    return value;
  }

  private boolean(): boolean {
    const text = this.string();
    if (text === "true") {
      return true;
    }
    if (text === "false") {
      return false;
    }
    throw new InvalidEngineDataBoolean(
      `'${text}' is neither 'true' nor 'false'`
    );
  }
}
