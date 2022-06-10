// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  matchBlendMode,
  matchDividerType,
  SectionDividerSettingAliBlock,
  SectionDividerSubtype,
} from "../../../interfaces";
import {Cursor, InvalidSectionDividerSetting} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

/**
 * Parses a partial {@link SectionDividerSettingAliBlock} from the current
 * {@link cursor} position.
 * @param cursor
 * @param size Size of the current ALI block
 */
export function readSectionDividerSettingAliBlock(
  cursor: Cursor,
  size: number
): AliBlockBody<SectionDividerSettingAliBlock> {
  const dividerType = matchDividerType(cursor.read("u32"));

  if (size < 12) {
    return {dividerType};
  }

  const dividerSignature = cursor.readString(4);
  if (dividerSignature !== "8BIM") {
    throw new InvalidSectionDividerSetting(
      `Invalid Section Divider Setting signature: ${dividerSignature}`
    );
  }

  const blendMode = matchBlendMode(cursor.readString(4));

  if (size < 16) {
    return {dividerType, dividerSignature, blendMode};
  }

  const subType = cursor.read("u32");
  if (!(subType in SectionDividerSubtype)) {
    throw new InvalidSectionDividerSetting(
      `Invalid Section Divider Setting subtype: ${subType}`
    );
  }

  return {dividerType, dividerSignature, blendMode, subType};
}
