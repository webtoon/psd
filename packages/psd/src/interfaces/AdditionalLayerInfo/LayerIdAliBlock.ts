// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {KnownAliBlock} from "./AliBlockBase";
import {AliKey} from "./AliKey";

export interface LayerIdAliBlock extends KnownAliBlock<AliKey.LayerId> {
  value: number;
}
