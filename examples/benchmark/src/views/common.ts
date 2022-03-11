// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

export function hideElement(element: HTMLElement) {
  element.style.display = "none";
}

export function showElement(element: HTMLElement) {
  element.style.display = "";
}

export function findElement<T extends Element>(
  query: string,
  description: string
): T {
  const element = document.querySelector<T>(query);
  if (!element) {
    throw new Error(`No ${description}`);
  }
  return element;
}
