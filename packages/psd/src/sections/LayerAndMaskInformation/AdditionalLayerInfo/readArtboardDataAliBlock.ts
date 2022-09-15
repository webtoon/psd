// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ArtboardDataAliBlock} from "../../../interfaces";
import {readVersionedDescriptor} from "../../../methods";
import {Cursor} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

export function readArtboardDataAliBlock(
  cursor: Cursor
): AliBlockBody<ArtboardDataAliBlock> {
  const data = readVersionedDescriptor(cursor);
  return {data};
}
