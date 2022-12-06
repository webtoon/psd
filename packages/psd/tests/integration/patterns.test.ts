// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import {beforeAll, describe, expect, it} from "vitest";

import type Psd from "../../src/index";
import PSD, {AliKey, PathRecordType} from "../../src/index";

const FIXTURE_DIR = path.join(__dirname, "fixtures");

describe("patterns parsing", () => {
  let psd: Psd;

  beforeAll(() => {
    const data = fs.readFileSync(path.resolve(FIXTURE_DIR, "pattern-01.psd"));
    psd = PSD.parse(data.buffer);
  });

  it("parses pattern data", () => {
    expect(psd.patterns).toHaveLength(1);
  });

  it("renders pattern", async () => {
    const [pattern] = psd.patterns;
    const pixelData = await psd.decodePattern(pattern);
    expect(pixelData).toHaveLength(361200);

    const hash = crypto.createHash("sha256").update(pixelData).digest("hex");

    // NOTE: when changing the hash, please make sure the result is coherent :)
    // Either using https://www.npmjs.com/package/canvas or browser build (see README)
    // This looks like a window with green borders
    expect(hash).toStrictEqual(
      "ecc109a64333e792149b04ba74ad9917db3e329228fe3401e338142f872860c8"
    );
  });
});
