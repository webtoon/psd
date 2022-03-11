// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import type {AppState} from "../model";
import {findElement} from "./common";

export function initControlPanel({
  onFileInputChange,
  onTrialCountChange,
  onShouldApplyOpacityChange,
}: {
  onFileInputChange?: (file: File | null) => void;
  onTrialCountChange?: (value: number) => void;
  onShouldApplyOpacityChange?: (value: boolean) => void;
}) {
  getFileInput().addEventListener("change", (event) => {
    const fileInput = event.target as ReturnType<typeof getFileInput>;
    const file = fileInput.files?.[0] ?? null;
    // Immediately reset the file input, so that the user can select the same
    // file multiple times
    fileInput.value = "";
    onFileInputChange?.(file);
  });

  getTrialCountInput().addEventListener("input", (event) => {
    const trialCountInput = event.target as ReturnType<
      typeof getTrialCountInput
    >;
    onTrialCountChange?.(trialCountInput.valueAsNumber);
  });

  getApplyOpacityCheckbox().addEventListener("input", (event) => {
    const applyOpacityCheckbox = event.target as ReturnType<
      typeof getApplyOpacityCheckbox
    >;
    onShouldApplyOpacityChange?.(applyOpacityCheckbox.checked);
  });
}

export function renderControlPanel(appState: AppState) {
  const fileInput = getFileInput();
  fileInput.disabled = appState.isRunning();

  const trialCountInput = getTrialCountInput();
  trialCountInput.valueAsNumber = appState.options.trialCount;
  trialCountInput.disabled = appState.isRunning();

  const applyOpacityCheckbox = getApplyOpacityCheckbox();
  applyOpacityCheckbox.checked = appState.options.shouldApplyOpacity;
  applyOpacityCheckbox.disabled = appState.isRunning();
}

function getFileInput() {
  return findElement<HTMLInputElement>(
    "input#file-input",
    "file input element"
  );
}

function getTrialCountInput() {
  return findElement<HTMLInputElement>(
    "input#repeat-count-input",
    "repeat count input element"
  );
}

function getApplyOpacityCheckbox() {
  return findElement<HTMLInputElement>(
    "input#apply-opacity-checkbox",
    "repeat count input element"
  );
}
