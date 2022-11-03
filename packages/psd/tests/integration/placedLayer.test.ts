// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import {beforeAll, describe, expect, it} from "vitest";

import type Psd from "../../src/index";
import PSD from "../../src/index";
import {AliKey, StringDescriptorValue} from "../../src/interfaces";

const FIXTURE_DIR = path.join(__dirname, "fixtures");

describe("placed layer data parsing", () => {
  let psd: Psd;
  beforeAll(() => {
    const data = fs.readFileSync(path.resolve(FIXTURE_DIR, "placedLayer.psd"));
    psd = PSD.parse(data.buffer);
  });

  it("should contain links to placed files inside layers", () => {
    const placedObject =
      psd.layers[0].additionalProperties[AliKey.PlacedLayerData];

    const id = placedObject?.data.descriptor.items.get(
      "Idnt"
    ) as StringDescriptorValue;
    expect(id.value).toStrictEqual("5a96c404-ab9c-1177-97ef-96ca454b82b7");
  });

  it("should contain embedded files as extra resources", () => {
    const linkedLayer = psd.additionalLayerProperties[AliKey.LinkedLayer2];
    expect(linkedLayer?.layers[0]).toContain({
      uniqueId: "5a96c404-ab9c-1177-97ef-96ca454b82b7",
      filename: "linked-layer.png",
      filetype: "png ",
    });

    const hash = crypto
      .createHash("sha256")
      .update(linkedLayer?.layers[0].contents ?? "")
      .digest("hex");

    // NOTE: when changing the hash, please make sure the result is coherent :)
    // Just dump file to disk with fs.writeFileSync()
    // This is a PNG with 64x64 black box
    expect(hash).toStrictEqual(
      "d37cfdbc5d4f5cf908846967ce7c0dea357aad74bae9fdcc580f796bf3062fa1"
    );
  });
});
