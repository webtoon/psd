// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import type {AppState} from "../model";
import {initControlPanel, renderControlPanel} from "./control-panel";
import {renderErrorPanel} from "./error-panel";
import {renderProgressPanel} from "./progress-panel";
import {renderResultPanel} from "./result-panel";

export function initialize(options: Parameters<typeof initControlPanel>[0]) {
  initControlPanel(options);
}

export function render(appState: AppState) {
  renderControlPanel(appState);
  renderProgressPanel(appState);
  renderResultPanel(appState);
  renderErrorPanel(appState);
}
