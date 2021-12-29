// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {AdditionalLayerInfo} from "../../../interfaces";

/**
 * Utility type that should be used by `readX()` functions to return (partial)
 * ALI block objects.
 */
export type AliBlockBody<T extends AdditionalLayerInfo> = T extends unknown
  ? Omit<T, "key" | "signature">
  : never;
