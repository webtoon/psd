// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries
// Unforunately not available in Node 14 according to Typescript
export function fromEntries<K extends string | number, V>(
  iterable: Iterable<[K, V]>
): Record<K, V> {
  const obj = {} as Record<K, V>;
  for (const [k, value] of iterable) {
    obj[k] = value;
  }
  return obj;
}
