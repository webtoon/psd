// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

export interface EngineData {
  // TODO: Check if these properties are consistent between PS versions
  DocumentResources: Readonly<Record<string, unknown>>;
  EngineDict: Readonly<Record<string, unknown>>;
  ResourceDict: Readonly<Record<string, unknown>>;
}
