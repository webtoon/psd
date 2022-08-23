// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ImageResourceBlockBase} from "./ImageResourceBlockBase";
import {ResourceType} from "./ResourceType";

export type ICCProfileResourceBlock = ImageResourceBlockBase<
  ResourceType.ICCProfile,
  // ICC Profile is simply a chunk of bytes to be decoded by conversion tool
  // like Little-CMS (https://github.com/mm2/Little-CMS)
  Uint8Array
>;
