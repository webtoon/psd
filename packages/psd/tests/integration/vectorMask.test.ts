// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import {beforeAll, describe, expect, it} from "vitest";

import type Psd from "../../src/index";
import PSD from "../../src/index";
import {AliKey, PathRecordType} from "../../src/interfaces";

const FIXTURE_DIR = path.join(__dirname, "fixtures");

describe("vector mask parsing", () => {
  let psd: Psd;
  beforeAll(() => {
    const data = fs.readFileSync(path.resolve(FIXTURE_DIR, "vectorMask.psd"));
    psd = PSD.parse(data.buffer);
  });

  it("should return pathRecords to build vector mask", () => {
    const vmsk = psd.layers[0].additionalProperties.find(
      ({key}) => key === AliKey.VectorMaskSetting1
    );

    expect(vmsk).toStrictEqual({
      key: "vmsk",
      signature: "8BIM",
      version: 3,
      pathRecords: [
        {type: PathRecordType.PathFillRule},
        {type: PathRecordType.InitialFillRule, fill: true},
        {
          type: PathRecordType.ClosedSubpathLength,
          length: 4,
          operation: 3,
          subpathType: 1,
          index: 0,
        },
        {
          type: PathRecordType.ClosedSubpathBezierKnotLinked,
          preceding: {vert: 0.71875, horiz: 0.7919732928276062},
          anchor: {vert: 0.71875, horiz: 0.84375},
          leaving: {vert: 0.71875, horiz: 0.8955267071723938},
        },
        {
          type: PathRecordType.ClosedSubpathBezierKnotLinked,
          preceding: {vert: 0.7607232928276062, horiz: 0.9375},
          anchor: {vert: 0.8125, horiz: 0.9375},
          leaving: {vert: 0.8642767071723938, horiz: 0.9375},
        },
        {
          type: PathRecordType.ClosedSubpathBezierKnotLinked,
          preceding: {vert: 0.90625, horiz: 0.8955267071723938},
          anchor: {vert: 0.90625, horiz: 0.84375},
          leaving: {vert: 0.90625, horiz: 0.7919732928276062},
        },
        {
          type: PathRecordType.ClosedSubpathBezierKnotLinked,
          preceding: {vert: 0.8642767071723938, horiz: 0.75},
          anchor: {vert: 0.8125, horiz: 0.75},
          leaving: {vert: 0.7607232928276062, horiz: 0.75},
        },
        {
          type: PathRecordType.ClosedSubpathLength,
          length: 4,
          operation: 3,
          subpathType: 1,
          index: 1,
        },
        {
          type: PathRecordType.ClosedSubpathBezierKnotLinked,
          preceding: {vert: 0.78125, horiz: 0.7294732928276062},
          anchor: {vert: 0.78125, horiz: 0.78125},
          leaving: {vert: 0.78125, horiz: 0.8330267071723938},
        },
        {
          type: PathRecordType.ClosedSubpathBezierKnotLinked,
          preceding: {vert: 0.8232232928276062, horiz: 0.875},
          anchor: {vert: 0.875, horiz: 0.875},
          leaving: {vert: 0.9267767071723938, horiz: 0.875},
        },
        {
          type: PathRecordType.ClosedSubpathBezierKnotLinked,
          preceding: {vert: 0.96875, horiz: 0.8330267071723938},
          anchor: {vert: 0.96875, horiz: 0.78125},
          leaving: {vert: 0.96875, horiz: 0.7294732928276062},
        },
        {
          type: PathRecordType.ClosedSubpathBezierKnotLinked,
          preceding: {vert: 0.9267767071723938, horiz: 0.6875},
          anchor: {vert: 0.875, horiz: 0.6875},
          leaving: {vert: 0.8232232928276062, horiz: 0.6875},
        },
      ],
      invert: false,
      notLink: false,
      disable: false,
    });
  });
});
