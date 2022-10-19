// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {VectorStrokeDataAliBlock} from "../../../interfaces";
import {readVersionedDescriptor} from "../../../methods";
import {Cursor} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

export function readVectorStrokeDataAliBlock(
  cursor: Cursor
): AliBlockBody<VectorStrokeDataAliBlock> {
  const data = readVersionedDescriptor(cursor);
  return {data};
}
