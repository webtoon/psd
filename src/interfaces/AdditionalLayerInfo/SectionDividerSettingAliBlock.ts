// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {BlendMode} from "../BlendMode";
import {GroupDivider} from "../GroupDivider";
import {KnownAliBlock} from "./AliBlockBase";
import {AliKey} from "./AliKey";

/**
 * (Photoshop 6.0) ALI block that stores information about a section divider
 * (i.e. layer group divider).
 */
export type SectionDividerSettingAliBlock =
  | SectionDividerSettingAliBlockBase
  | SectionDividerSettingAliBlockExtra;

/**
 * Minimal Section Divider block.
 */
interface SectionDividerSettingAliBlockBase
  extends KnownAliBlock<AliKey.SectionDividerSetting> {
  dividerType: GroupDivider;
}

/**
 * Section Divider block with additional fields.
 */
interface SectionDividerSettingAliBlockExtra
  extends SectionDividerSettingAliBlockBase {
  dividerSignature: "8BIM";
  blendMode: BlendMode;
  subType?: SectionDividerSubtype;
}

export enum SectionDividerSubtype {
  Normal = 0,
  SceneGroup = 1,
}
