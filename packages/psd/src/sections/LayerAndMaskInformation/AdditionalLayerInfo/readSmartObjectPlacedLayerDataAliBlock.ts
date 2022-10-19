// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {SmartObjectPlacedLayerDataAliBlock} from "../../../interfaces";
import {readVersionedDescriptor} from "../../../methods";
import {Cursor} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

export function readSmartObjectPlacedLayerDataAliBlock(
  cursor: Cursor
): AliBlockBody<SmartObjectPlacedLayerDataAliBlock> {
  const identifier = cursor.readString(4);
  const version = cursor.read("u32");
  const data = readVersionedDescriptor(cursor);
  return {data, version, identifier};
}
