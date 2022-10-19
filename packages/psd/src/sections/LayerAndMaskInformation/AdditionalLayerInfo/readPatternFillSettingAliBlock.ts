// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {PatternFillSettingAliBlock} from "../../../interfaces";
import {readVersionedDescriptor} from "../../../methods";
import {Cursor} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

export function readPatternFillSettingAliBlock(
  cursor: Cursor
): AliBlockBody<PatternFillSettingAliBlock> {
  const data = readVersionedDescriptor(cursor);
  return {data};
}
