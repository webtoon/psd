// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {VersionedDescriptor} from "../Descriptor";
import {KnownAliBlock} from "./AliBlockBase";
import {AliKey} from "./AliKey";

/**
 * (Photoshop 6.0) ALI block that stores the text data of a text layer.
 */
export interface TypeToolObjectSettingAliBlock
  extends KnownAliBlock<AliKey.TypeToolObjectSetting> {
  version: 1;
  transformXX: number;
  transformXY: number;
  transformYX: number;
  transformYY: number;
  transformTX: number;
  transformTY: number;
  textVersion: 50;
  textData: VersionedDescriptor;
  warpVersion: 1;
  warpData: VersionedDescriptor;
  left: number;
  top: number;
  right: number;
  bottom: number;
}
