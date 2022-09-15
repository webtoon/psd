// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {SolidColorSheetSettingAliBlock} from "../../../interfaces";
import {readDescriptor} from "../../../methods";
import {Cursor} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

export function readSolidColorSheetSettingAliBlock(
  cursor: Cursor
): AliBlockBody<SolidColorSheetSettingAliBlock> {
  const version = cursor.read("u32");
  const data = readDescriptor(cursor);

  return {version, data};
}
