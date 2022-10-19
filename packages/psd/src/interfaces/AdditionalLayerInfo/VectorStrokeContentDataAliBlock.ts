// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {VersionedDescriptor} from "../Descriptor";
import {KnownAliBlock} from "./AliBlockBase";
import {AliKey} from "./AliKey";

export interface VectorStrokeContentDataAliBlock
  extends KnownAliBlock<AliKey.VectorStrokeContentData> {
  version: number; // NOTE: named "key" in psd-tools, which would override ^
  data: VersionedDescriptor;
}
