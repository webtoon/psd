// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {BlendMode} from "../BlendMode";
import {GroupDivider} from "../GroupDivider";
import {KnownAliBlock} from "./AliBlockBase";
import {AliKey} from "./AliKey";
import {SectionDividerSubtype} from "./SectionDividerSettingAliBlock";

export interface NestedSectionDividerSettingAliBlock
  extends KnownAliBlock<AliKey.NestedSectionDividerSetting> {
  dividerType: GroupDivider;
  dividerSignature?: "8BIM";
  blendMode?: BlendMode;
  subType?: SectionDividerSubtype;
}
