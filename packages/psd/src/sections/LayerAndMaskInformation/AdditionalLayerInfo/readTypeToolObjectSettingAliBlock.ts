// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {TypeToolObjectSettingAliBlock} from "../../../interfaces";
import {readVersionedDescriptor} from "../../../methods";
import {Cursor, InvalidTypeToolObjectSetting} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

/**
 * Parses a partial {@link TypeToolObjectSettingAliBlock} from the current
 * {@link cursor} position.
 * @param cursor
 */
export function readTypeToolObjectSettingAliBlock(
  cursor: Cursor
): AliBlockBody<TypeToolObjectSettingAliBlock> {
  const version = cursor.read("u16");
  if (version !== 1) {
    throw new InvalidTypeToolObjectSetting(
      `Invalid type tool object setting version: ${version}`
    );
  }

  const transformXX = cursor.read("f64");
  const transformXY = cursor.read("f64");
  const transformYX = cursor.read("f64");
  const transformYY = cursor.read("f64");
  const transformTX = cursor.read("f64");
  const transformTY = cursor.read("f64");

  const textVersion = cursor.read("u16");
  if (textVersion !== 50) {
    throw new InvalidTypeToolObjectSetting(
      `Invalid text version: ${textVersion}`
    );
  }

  const textData = readVersionedDescriptor(cursor);

  const warpVersion = cursor.read("u16");
  if (warpVersion !== 1) {
    throw new InvalidTypeToolObjectSetting(
      `Invalid warp version: ${warpVersion}`
    );
  }

  const warpData = readVersionedDescriptor(cursor);

  const left = cursor.read("f64");
  const top = cursor.read("f64");
  const right = cursor.read("f64");
  const bottom = cursor.read("f64");

  return {
    version,
    transformXX,
    transformXY,
    transformYX,
    transformYY,
    transformTX,
    transformTY,
    textVersion,
    textData,
    warpVersion,
    warpData,
    left,
    top,
    right,
    bottom,
  };
}
