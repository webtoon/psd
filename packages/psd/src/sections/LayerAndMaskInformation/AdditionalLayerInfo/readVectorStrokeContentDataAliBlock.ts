// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {VectorStrokeContentDataAliBlock} from "../../../interfaces";
import {readVersionedDescriptor} from "../../../methods";
import {Cursor} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

export function readVectorStrokeContentDataAliBlock(
  cursor: Cursor
): AliBlockBody<VectorStrokeContentDataAliBlock> {
  const version = cursor.read("u32");
  const data = readVersionedDescriptor(cursor);
  return {version, data};
}
