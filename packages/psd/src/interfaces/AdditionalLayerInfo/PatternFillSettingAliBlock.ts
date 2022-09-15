// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {VersionedDescriptor} from "../Descriptor";
import {KnownAliBlock} from "./AliBlockBase";
import {AliKey} from "./AliKey";

export interface PatternFillSettingAliBlock
  extends KnownAliBlock<AliKey.PatternFillSetting> {
  data: VersionedDescriptor;
}
