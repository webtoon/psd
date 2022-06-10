// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import {beforeAll, describe, expect, it} from "vitest";

import type Psd from "../../src/index";
import PSD, {ColorMode, GuideDirection, SliceOrigin} from "../../src/index";

const FIXTURE_DIR = path.join(__dirname, "fixtures/example");

describe.each([
  {
    fixtureFile: "example.psd",
  },
  {
    fixtureFile: "example.psb",
  },
])(`@webtoon/psd (with fixture $fixtureFile)`, ({fixtureFile}) => {
  let data: ArrayBuffer;
  let psd: Psd;

  beforeAll(() => {
    data = fs.readFileSync(path.resolve(FIXTURE_DIR, fixtureFile)).buffer;
  });

  it(`should parse the file successfully`, () => {
    psd = PSD.parse(data);
  });

  it("should correctly parse file properties", () => {
    expect(psd.width).toBe(400);
    expect(psd.height).toBe(800);

    expect(psd.layers).toHaveLength(14);
    expect(psd.depth).toBe(8);
    expect(psd.channelCount).toBe(3); // RGB image has three channels
    expect(psd.colorMode).toBe(ColorMode.Rgb);
    expect(psd.opacity).toBe(255);
  });

  it("should parse all layers and layer groups", () => {
    expect(psd.children).toHaveLength(13);

    expect(psd.children[0].type).toBe("Layer");
    expect(psd.children[1].type).toBe("Group");
    expect(psd.children[2].type).toBe("Layer");
    expect(psd.children[3].type).toBe("Layer");
    expect(psd.children[4].type).toBe("Layer");
    expect(psd.children[5].type).toBe("Layer");
    expect(psd.children[6].type).toBe("Layer");
    expect(psd.children[7].type).toBe("Layer");
    expect(psd.children[8].type).toBe("Layer");
    expect(psd.children[9].type).toBe("Layer");
    expect(psd.children[10].type).toBe("Layer");
    expect(psd.children[11].type).toBe("Layer");
    expect(psd.children[12].type).toBe("Layer");

    expect(psd.children[0].children).toBeUndefined();
    expect(psd.children[1].children).toHaveLength(2);
    // Use Object.is() to avoid generating massive diffs on failure
    expect(Object.is(psd.children[1].children?.[1], psd.layers[2])).toBe(true);
    expect(Object.is(psd.children[1].children?.[0], psd.layers[1])).toBe(true);
    expect(psd.children[2].children).toBeUndefined();
    expect(psd.children[3].children).toBeUndefined();
    expect(psd.children[4].children).toBeUndefined();
    expect(psd.children[5].children).toBeUndefined();
    expect(psd.children[6].children).toBeUndefined();
    expect(psd.children[7].children).toBeUndefined();
    expect(psd.children[8].children).toBeUndefined();
    expect(psd.children[9].children).toBeUndefined();
    expect(psd.children[10].children).toBeUndefined();
    expect(psd.children[11].children).toBeUndefined();
    expect(psd.children[12].children).toBeUndefined();

    expect(psd.layers).toHaveLength(14);
  });

  it.each([
    // layer index, name
    [0, "캔버스 바깥 레이어"],
    [1, "🍎"],
    [2, "🤣"],
    [3, "∑"],
    [4, "한글텍스트 나눔바른고딕"],
    [5, "Text layer"],
    [6, "한글이름 레이어"],
    [7, "Transculent"],
    [8, "Layer 3 + shadow"],
    [9, "Layer 2"],
    [10, "Layer 1"],
    [11, "Overflow Vertical"],
    [12, "Overflow Horizontal"],
    [13, "배경"],
  ])("should correctly parse layer %i name", (layerIndex, name) => {
    expect(psd.layers[layerIndex].name).toBe(name);
  });

  it.each([
    // layer index, left (X), top (Y), width, height
    [0, -41, 411, 159, 160],
    [1, 14, 324, 82, 82],
    [2, 299, 473, 49, 46],
    [3, 30, 593, 34, 48],
    [4, 75, 663, 261, 113],
    [5, 157, 554, 220, 51],
    [6, 51, 346, 215, 190],
    [7, 161, 287, 148, 158],
    [8, 121, 187, 220, 199],
    [9, 32, 63, 298, 296],
    [10, 19, 35, 228, 192],
    [11, 327, -23, 53, 873],
    [12, -99, 575, 599, 111],
    [13, 0, 0, 400, 800],
  ])(
    "should correctly parse layer %i dimensions",
    (layerIndex, left, top, width, height) => {
      const layer = psd.layers[layerIndex];
      expect(layer.left).toBe(left);
      expect(layer.top).toBe(top);
      expect(layer.width).toBe(width);
      expect(layer.height).toBe(height);
    }
  );

  it.each([
    // layer index, opacity
    [0, 255],
    [1, 255],
    [2, 255],
    [3, 255],
    [4, 255],
    [5, 255],
    [6, 255],
    [7, 128], // 50% opacity
    [8, 255],
    [9, 255],
    [10, 255],
    [11, 255],
    [12, 255],
    [13, 255],
  ])("should correctly parse layer %i opacity", (layerIndex, opacity) => {
    expect(psd.layers[layerIndex].opacity).toBe(opacity);
  });

  it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])(
    "should correctly parse layer %i raw image data",
    (layerIndex) => {
      const layerImageData = psd.layers[layerIndex].composite(false, false);
      const fixtureLayerImageData = fs.readFileSync(
        path.resolve(FIXTURE_DIR, `layer${layerIndex}`)
      );
      expect(layerImageData).toHaveLength(fixtureLayerImageData.length);
      expect(
        layerImageData.every(
          (value, index) => value === fixtureLayerImageData[index]
        )
      ).toBe(true);
    }
  );

  it("should correctly parse the combined raw image data", () => {
    const combinedImageData = psd.composite(true, true);
    const fixtureCombinedImageData = fs.readFileSync(
      path.resolve(FIXTURE_DIR, "imageData")
    );

    expect(
      combinedImageData.every(
        (value, index) => value === fixtureCombinedImageData[index]
      )
    ).toBe(true);
  });

  it("should correctly parse Grid and Guides", () => {
    expect(psd.guides).toHaveLength(3);
    expect(psd.guides).toContainEqual({
      direction: GuideDirection.Horizontal,
      position: 9797,
    });
    expect(psd.guides).toContainEqual({
      direction: GuideDirection.Horizontal,
      position: 19548,
    });
    expect(psd.guides).toContainEqual({
      direction: GuideDirection.Vertical,
      position: 11312,
    });
  });

  it("should correctly parse Slices", () => {
    expect(psd.slices).toHaveLength(9);

    expect(psd.slices[0].origin).toBe(SliceOrigin.LayerGenerated);
    expect(psd.slices[0].left).toBe(115);
    expect(psd.slices[0].top).toBe(184);
    expect(psd.slices[0].right).toBe(348);
    expect(psd.slices[0].bottom).toBe(396);

    expect(psd.slices[1].origin).toBe(SliceOrigin.UserGenerated);
    expect(psd.slices[1].left).toBe(50);
    expect(psd.slices[1].top).toBe(122);
    expect(psd.slices[1].right).toBe(272);
    expect(psd.slices[1].bottom).toBe(545);

    expect(psd.slices[2].origin).toBe(SliceOrigin.UserGenerated);
    expect(psd.slices[2].left).toBe(272);
    expect(psd.slices[2].top).toBe(396);
    expect(psd.slices[2].right).toBe(348);
    expect(psd.slices[2].bottom).toBe(800);

    expect(psd.slices[3].origin).toBe(SliceOrigin.AutoGenerated);
    expect(psd.slices[3].left).toBe(0);
    expect(psd.slices[3].top).toBe(0);
    expect(psd.slices[3].right).toBe(400);
    expect(psd.slices[3].bottom).toBe(122);

    expect(psd.slices[4].origin).toBe(SliceOrigin.AutoGenerated);
    expect(psd.slices[4].left).toBe(0);
    expect(psd.slices[4].top).toBe(122);
    expect(psd.slices[4].right).toBe(50);
    expect(psd.slices[4].bottom).toBe(800);

    expect(psd.slices[5].origin).toBe(SliceOrigin.AutoGenerated);
    expect(psd.slices[5].left).toBe(272);
    expect(psd.slices[5].top).toBe(122);
    expect(psd.slices[5].right).toBe(400);
    expect(psd.slices[5].bottom).toBe(184);

    expect(psd.slices[6].origin).toBe(SliceOrigin.AutoGenerated);
    expect(psd.slices[6].left).toBe(348);
    expect(psd.slices[6].top).toBe(184);
    expect(psd.slices[6].right).toBe(400);
    expect(psd.slices[6].bottom).toBe(800);

    expect(psd.slices[7].origin).toBe(SliceOrigin.AutoGenerated);
    expect(psd.slices[7].left).toBe(50);
    expect(psd.slices[7].top).toBe(545);
    expect(psd.slices[7].right).toBe(272);
    expect(psd.slices[7].bottom).toBe(800);

    expect(psd.slices[8].origin).toBe(SliceOrigin.AutoGenerated);
    expect(psd.slices[8].left).toBe(0);
    expect(psd.slices[8].top).toBe(0);
    expect(psd.slices[8].right).toBe(400);
    expect(psd.slices[8].bottom).toBe(800);
  });

  it("should correctly parse the text of text layers", () => {
    expect(psd.layers[0].text).toBeUndefined();
    expect(psd.layers[1].text).toBeUndefined();
    expect(psd.layers[2].text).toBe("🤣");
    expect(psd.layers[3].text).toBe("∑");
    expect(psd.layers[4].text).toBe("한글텍스트\r나눔바른고딕");
    expect(psd.layers[5].text).toBe("Text layer");
    expect(psd.layers[6].text).toBeUndefined();
    expect(psd.layers[7].text).toBeUndefined();
    expect(psd.layers[8].text).toBeUndefined();
    expect(psd.layers[9].text).toBeUndefined();
    expect(psd.layers[10].text).toBeUndefined();
    expect(psd.layers[11].text).toBeUndefined();
    expect(psd.layers[12].text).toBeUndefined();
    expect(psd.layers[13].text).toBeUndefined();
  });
});
