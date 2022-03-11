// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import type {AppState} from "../model";
import {findElement} from "./common";

export function initControlPanel({
  onUseDefaultPsdCheckboxClick,
  onUseUploadedPsdCheckboxClick,
  onFileInputChange,
  onUseDefaultPsdFileButtonClick,
  onTrialCountChange,
  onShouldApplyOpacityChange,
}: {
  onUseDefaultPsdCheckboxClick?: () => void;
  onUseUploadedPsdCheckboxClick?: () => void;
  onFileInputChange?: (file: File | null) => void;
  onUseDefaultPsdFileButtonClick?: () => void;
  onTrialCountChange?: (value: number) => void;
  onShouldApplyOpacityChange?: (value: boolean) => void;
}) {
  const {useDefaultPsdCheckbox, useUploadedPsdCheckbox} =
    getPsdSourceCheckboxes();
  useDefaultPsdCheckbox.addEventListener("click", () => {
    onUseDefaultPsdCheckboxClick?.();
  });
  useUploadedPsdCheckbox.addEventListener("click", () => {
    onUseUploadedPsdCheckboxClick?.();
  });

  getRunWithDefaultPsdButton().addEventListener("click", () =>
    onUseDefaultPsdFileButtonClick?.()
  );

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
  const {useDefaultPsdCheckbox, useUploadedPsdCheckbox} =
    getPsdSourceCheckboxes();
  if (appState.options.preferDefaultPsd) {
    useDefaultPsdCheckbox.checked = true;
  } else {
    useUploadedPsdCheckbox.checked = true;
  }

  useDefaultPsdCheckbox.disabled = appState.isRunning();
  useUploadedPsdCheckbox.disabled = appState.isRunning();

  const samplePsdDownloadAnchor = findElement<HTMLAnchorElement>(
    "a#sample-psd-download-link",
    "'Download sample PSD' anchor"
  );
  samplePsdDownloadAnchor.href = String(appState.defaultPsdFileUrl);

  const isLoadingDefaultPsdFile = appState.defaultPsdFileData === null;
  getRunWithDefaultPsdButton().disabled =
    !appState.options.preferDefaultPsd ||
    isLoadingDefaultPsdFile ||
    appState.isRunning();

  const fileInput = getFileInput();
  fileInput.disabled =
    appState.options.preferDefaultPsd || appState.isRunning();

  const trialCountInput = getTrialCountInput();
  trialCountInput.valueAsNumber = appState.options.trialCount;
  trialCountInput.disabled = appState.isRunning();

  const applyOpacityCheckbox = getApplyOpacityCheckbox();
  applyOpacityCheckbox.checked = appState.options.shouldApplyOpacity;
  applyOpacityCheckbox.disabled = appState.isRunning();
}

function getPsdSourceCheckboxes() {
  return {
    useDefaultPsdCheckbox: findElement<HTMLInputElement>(
      "input#use-sample-psd-checkbox",
      "'Use sample PSD' checkbox"
    ),
    useUploadedPsdCheckbox: findElement<HTMLInputElement>(
      "input#use-uploaded-psd-checkbox",
      "'Use uploaded PSD' checkbox"
    ),
  };
}

function getRunWithDefaultPsdButton() {
  return findElement<HTMLButtonElement>(
    "button#use-sample-psd-button",
    "'Run with sample PSD' button element"
  );
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
