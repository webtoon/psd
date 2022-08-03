// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {EngineData} from "../interfaces";

const REQUIRED_KEYS = new Set([
  "DocumentResources",
  "EngineDict",
  "ResourceDict",
]);

function hasOwnProperty<K extends string>(
  obj: unknown,
  prop: K
): obj is Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

export function validateEngineData(
  engineData: unknown
): engineData is EngineData {
  let ok = true;
  if (typeof engineData !== "object") {
    return false;
  }
  if (!engineData) {
    return false;
  }
  for (const key of REQUIRED_KEYS) {
    if (hasOwnProperty(engineData, key)) {
      const value = engineData[key];
      ok =
        ok &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Boolean(value);
    } else {
      return false;
    }
  }
  return ok;
}
