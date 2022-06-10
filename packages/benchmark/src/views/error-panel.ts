// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import type {AppState} from "../model";
import {findElement, hideElement, showElement} from "./common";

export function renderErrorPanel(appState: AppState) {
  const errorPanel = findElement<HTMLElement>(
    ".error-panel",
    "error panel element"
  );
  const errorMessageEl = findElement<Element>(
    ".error-panel__message",
    "error panel message element"
  );

  if (appState.error === null) {
    hideElement(errorPanel);
    errorMessageEl.textContent = "";
  } else {
    showElement(errorPanel);
    errorMessageEl.textContent = appState.error;
  }
}
