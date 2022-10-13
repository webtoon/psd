// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import {beforeAll, describe, expect, it} from "vitest";

import type Psd from "../../src/index";
import PSD, {Layer} from "../../src/index";

const FIXTURE_DIR = path.join(__dirname, "fixtures");

describe(`@webtoon/psd reads user masks`, () => {
  let psd: Psd;
  beforeAll(() => {
    const data = fs.readFileSync(path.resolve(FIXTURE_DIR, "mask.psd")).buffer;
    psd = PSD.parse(data);
  });

  describe(`layer without user mask`, () => {
    let maskedLayer: Layer;
    beforeAll(() => {
      maskedLayer = psd.layers[0];
    });

    it(`should not parse the mask real flags if they are missing`, () => {
      expect(maskedLayer.maskData).toStrictEqual({
        backgroundColor: 0,
        top: 39,
        bottom: 59,
        left: 579,
        right: 600,
        flags: {
          invertMaskWhenBlending: false,
          layerMaskDisabled: false,
          masksHaveParametersApplied: false,
          positionRelativeToLayer: false,
          userMaskFromRenderingOtherData: true,
        },
        parameters: undefined,
        realData: undefined,
      });
    });

    it(`should extract mask pixels`, async () => {
      // NOTE: maybe we should introduce decoding into some grayscale format instead?
      // 21 (width) * 20 (height) * 4 (since we decompress into RGBA format)
      expect(await maskedLayer.userMask()).toHaveLength(1680);
      expect(await maskedLayer.realUserMask()).toBeUndefined();
    });
  });

  describe(`layer with real user mask`, () => {
    let maskedLayer: Layer;
    beforeAll(() => {
      maskedLayer = psd.layers[3];
    });

    it(`should parse the mask properties successfully`, () => {
      expect(maskedLayer.maskData).toStrictEqual({
        backgroundColor: 0,
        top: -31,
        bottom: 102,
        left: -107,
        right: 704,
        flags: {
          invertMaskWhenBlending: false,
          layerMaskDisabled: false,
          masksHaveParametersApplied: false,
          positionRelativeToLayer: false,
          userMaskFromRenderingOtherData: true,
        },
        parameters: undefined,
        realData: {
          backgroundColor: 255,
          bottom: 5600,
          left: 0,
          right: 640,
          top: 0,
          flags: {
            invertMaskWhenBlending: false,
            layerMaskDisabled: true,
            masksHaveParametersApplied: false,
            positionRelativeToLayer: false,
            userMaskFromRenderingOtherData: false,
          },
        },
      });
    });

    it(`should extract real mask pixels`, async () => {
      const mask = await maskedLayer.realUserMask();
      expect(mask).toHaveLength(14_336_000);
    });
  });
});
