// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ResolutionInfoResourceBlock} from "../../interfaces";
import {Cursor} from "../../utils";

export function readResolutionInfo(
  cursor: Cursor
): ResolutionInfoResourceBlock["resource"] {
  const horizontal = cursor.readFixedPoint32bit();
  const horizontalUnit = cursor.read("u16");
  const widthUnit = cursor.read("u16");

  const vertical = cursor.readFixedPoint32bit();
  const verticalUnit = cursor.read("u16");
  const heightUnit = cursor.read("u16");

  return {
    horizontal,
    horizontalUnit,
    widthUnit,
    vertical,
    verticalUnit,
    heightUnit,
  };
}
