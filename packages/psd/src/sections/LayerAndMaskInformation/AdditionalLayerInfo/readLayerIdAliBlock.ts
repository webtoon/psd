// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {LayerIdAliBlock} from "../../../interfaces";
import {Cursor} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

export function readLayerIdAliBlock(
  cursor: Cursor
): AliBlockBody<LayerIdAliBlock> {
  const value = cursor.read("u32");
  return {value};
}
