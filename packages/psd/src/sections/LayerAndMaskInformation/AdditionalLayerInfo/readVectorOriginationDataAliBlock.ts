// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {VectorOriginationDataAliBlock} from "../../../interfaces/AdditionalLayerInfo/VectorOriginationDataAliBlock";
import {readVersionedDescriptor} from "../../../methods";
import {Cursor} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

export function readVectorOriginationDataAliBLock(
  cursor: Cursor
): AliBlockBody<VectorOriginationDataAliBlock> {
  const version = cursor.read("u32");
  const data = readVersionedDescriptor(cursor);
  return {version, data};
}
