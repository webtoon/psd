// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import {describe, expect, it} from "vitest";

import PSD from "../../src/index";

const FIXTURE_DIR = path.join(__dirname, "fixtures");

describe("placed layer data parsing", () => {
  it("should return array of descriptors", () => {
    const data = fs.readFileSync(path.resolve(FIXTURE_DIR, "placedLayer.psd"));
    const psd = PSD.parse(data.buffer);
    const blockKeys = psd.layers.map(
      ({
        layerFrame: {
          layerProperties: {additionalLayerInfos},
        },
      }) => additionalLayerInfos.map(({key}) => key)
    );
    // XXX: TS, why?!
    const flatKeys = ([] as string[]).concat(...blockKeys)
    expect(flatKeys).toStrictEqual([
      "luni",
      "lyid",
      "clbl",
      "infx",
      "knko",
      "lspf",
      "lclr",
      "shmd",
      "PlLd",
      "SoLd",
      "fxrp",
      "luni",
      "lyid",
      "clbl",
      "infx",
      "knko",
      "lspf",
      "lclr",
      "shmd",
      "SoLE",
      "fxrp",
      "luni",
      "lyid",
      "clbl",
      "infx",
      "knko",
      "lspf",
      "lclr",
      "shmd",
      "SoLE",
      "fxrp",
      "luni",
      "lnsr",
      "lyid",
      "clbl",
      "infx",
      "knko",
      "lspf",
      "lclr",
      "shmd",
      "fxrp",
    ]);
  });
});
