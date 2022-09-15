// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {GradientFillSettingAliBlock} from "../../../interfaces";
import {readVersionedDescriptor} from "../../../methods";
import {Cursor} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

/**
 * Parses a partial {@link UnicodeLayerNameAliBlock} from the current
 * {@link cursor} position.
 * @param cursor
 */
export function readGradientFillSettingAliBlock(
  cursor: Cursor
): AliBlockBody<GradientFillSettingAliBlock> {
  const data = readVersionedDescriptor(cursor);
  return {data};
}
