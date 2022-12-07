// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import {beforeAll, describe, expect, it} from "vitest";

import type Psd from "../../src/index";
import PSD from "../../src/index";

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
    expect(pixelData).toHaveLength(360000);

    const hash = crypto.createHash("sha256").update(pixelData).digest("hex");

    // NOTE: when changing the hash, please make sure the result is coherent :)
    // Either using https://www.npmjs.com/package/canvas or browser build (see README)
    // This looks like a window with green borders
    expect(hash).toStrictEqual(
      "9e8ab22ac1d75bc5f1b675ace63490910527578c4afb8410aa292273ff298e93"
    );
  });
});
