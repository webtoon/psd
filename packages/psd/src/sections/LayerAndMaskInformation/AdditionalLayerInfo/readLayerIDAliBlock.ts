// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {LayerIDAliBlock} from "../../../interfaces";
import {Cursor} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

export function readLayerIDAliBlock(
  cursor: Cursor
): AliBlockBody<LayerIDAliBlock> {
  const value = cursor.read("u32");
  return {value};
}
