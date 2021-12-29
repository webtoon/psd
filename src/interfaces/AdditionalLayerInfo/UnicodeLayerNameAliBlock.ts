// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {KnownAliBlock} from "./AliBlockBase";
import {AliKey} from "./AliKey";

/**
 * (Photoshop 5.0) ALI block that stores the unicode name of a layer.
 */
export interface UnicodeLayerNameAliBlock
  extends KnownAliBlock<AliKey.UnicodeLayerName> {
  name: string;
}
