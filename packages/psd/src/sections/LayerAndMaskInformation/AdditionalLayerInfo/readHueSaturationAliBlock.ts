// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {HSLChange, HSLValue, HueSaturationAliBlock} from "../../../interfaces";
import {Cursor} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

function readHSL(cursor: Cursor): HSLValue {
  const hue = cursor.read("i16");
  const saturation = cursor.read("i16");
  const lightness = cursor.read("i16");
  return {
    hue,
    saturation,
    lightness,
  };
}

function readHSLChange(cursor: Cursor): HSLChange {
  const beginRamp = cursor.read("i16");
  const beginSustain = cursor.read("i16");
  const endSustain = cursor.read("i16");
  const endRamp = cursor.read("i16");
  return {
    beginRamp,
    beginSustain,
    endSustain,
    endRamp,
    ...readHSL(cursor),
  };
}

function readAdjustment(cursor: Cursor): HSLChange[] {
  return Array.from(Array(6), () => readHSLChange(cursor));
}

export function readHueSaturationAliBlock(
  cursor: Cursor
): AliBlockBody<HueSaturationAliBlock> {
  const version = cursor.read("u16");
  const colorize = cursor.read("u8");
  cursor.pass(1);
  const colorization = readHSL(cursor);
  const master = readHSL(cursor);
  return {
    version,
    colorize,
    colorization,
    master,
    adjustment: colorize ? undefined : readAdjustment(cursor),
  };
}
