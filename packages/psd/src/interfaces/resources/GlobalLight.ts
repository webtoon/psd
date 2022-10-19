// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ImageResourceBlockBase} from "./ImageResourceBlockBase";
import {ResourceType} from "./ResourceType";

export type GlobalLightResourceBlock = ImageResourceBlockBase<
  ResourceType.GlobalLightAltitude | ResourceType.GlobalLightAngle,
  number
>;
