// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {Descriptor} from "../Descriptor";
import {KnownAliBlock} from "./AliBlockBase";
import {AliKey} from "./AliKey";

export interface MultipleObjectBasedEffectsAliBlock
  extends KnownAliBlock<AliKey.MultipleObjectBasedEffects> {
  version: number;
  descriptorVersion: number;
  descriptor: Descriptor;
}
