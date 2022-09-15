// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {BlendOptionsCapacityAliBlock} from "../../../interfaces";
import {Cursor} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

export function readBlendOptionsCapacityAliBlock(
  cursor: Cursor
): AliBlockBody<BlendOptionsCapacityAliBlock> {
  const fillOpacity = cursor.read("u8");
  return {fillOpacity};
}
