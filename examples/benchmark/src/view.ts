// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {drawChart} from "./chart";

function hideElement(element: HTMLElement) {
  element.style.display = "none";
}

function showElement(element: HTMLElement) {
  element.style.display = "";
}

function getFileInput() {
  const fileInput =
    document.querySelector<HTMLInputElement>("input#file-input");
  if (!fileInput) {
    throw new Error("No file input element");
  }
  return fileInput;
}

export function observeFileInputChange(handler: (file: File | null) => void) {
  const fileInput = getFileInput();
  fileInput.addEventListener("change", () =>
    handler(fileInput.files?.[0] ?? null)
  );
}

export function resetFileInput() {
  const fileInput = getFileInput();
  fileInput.value = "";
}

function getRepeatCountInput() {
  const repeatCountInput = document.querySelector<HTMLInputElement>(
    "input#repeat-count-input"
  );
  if (!repeatCountInput) {
    throw new Error("No repeat count input element");
  }
  return repeatCountInput;
}

export function getRepeatCount() {
  const repeatCountInput = getRepeatCountInput();
  const value = Number(repeatCountInput.value);
  if (!Number.isSafeInteger(value)) {
    throw new Error(
      `Repeat count must be a valid integer (got ${repeatCountInput.value})`
    );
  }
  return value;
}

function getApplyOpacityCheckbox() {
  const applyOpacityCheckbox = document.querySelector<HTMLInputElement>(
    "input#apply-opacity-checkbox"
  );
  if (!applyOpacityCheckbox) {
    throw new Error("No repeat count input element");
  }
  return applyOpacityCheckbox;
}

export function getShouldApplyOpacityWhenDecoding() {
  const applyOpacityCheckbox = getApplyOpacityCheckbox();
  return applyOpacityCheckbox.checked;
}

export function setControlPanelActive(isActive: boolean) {
  const fileInput = getFileInput();
  fileInput.disabled = !isActive;

  const repeatCountInput = getRepeatCountInput();
  repeatCountInput.disabled = !isActive;

  const applyOpacityCheckbox = getApplyOpacityCheckbox();
  applyOpacityCheckbox.disabled = !isActive;
}

export type ProgressValue = number | "indeterminate";

function getProgressBar() {
  const progressBar = document.querySelector<HTMLProgressElement>(
    "progress#progressbar"
  );
  if (!progressBar) {
    throw new Error("No progressbar element");
  }
  return progressBar;
}

export function getProgress(): ProgressValue {
  const progressBar = getProgressBar();
  return progressBar.hasAttribute("value")
    ? progressBar.value
    : "indeterminate";
}

export function setProgress(progress: ProgressValue) {
  const progressBar = getProgressBar();

  if (progress === "indeterminate") {
    progressBar.removeAttribute("value");
  } else if (0 <= progress && progress <= 1) {
    progressBar.value = progress;
  }
}

export function setProgressMessage(message: string) {
  const progressMessageEl = document.querySelector<HTMLElement>(
    ".progress-panel__description"
  );
  if (!progressMessageEl) {
    throw new Error("No progress message element");
  }

  progressMessageEl.textContent = message;
}

function getResultPanel() {
  const resultPanel = document.querySelector<HTMLElement>(".result-panel");
  if (!resultPanel) {
    throw new Error("No result panel element");
  }
  return resultPanel;
}

function getProgressSpinnerContainer() {
  const progressSpinnerContainer = document.querySelector<HTMLElement>(
    ".result-panel__spinner-container"
  );
  if (!progressSpinnerContainer) {
    throw new Error("No progress spinner container element");
  }
  return progressSpinnerContainer;
}

function getResultTableContainer(resultPanel: Element) {
  const resultTableContainer = resultPanel.querySelector<HTMLElement>(
    ".result-panel__table-container"
  );
  if (!resultTableContainer) {
    throw new Error("No result panel table container element");
  }
  return resultTableContainer;
}

function getResultChartCanvas() {
  const canvas = document.querySelector<HTMLCanvasElement>(
    "canvas#result-chart-canvas"
  );
  if (!canvas) {
    throw new Error("No result chart canvas element");
  }
  return canvas;
}

export function setBenchmarkToRunning() {
  const resultPanel = getResultPanel();
  showElement(resultPanel);

  const progressSpinnerContainer = getProgressSpinnerContainer();
  showElement(progressSpinnerContainer);

  const resultTableContainer = getResultTableContainer(resultPanel);
  resultTableContainer.innerHTML = "";
  hideElement(resultTableContainer);

  const canvas = getResultChartCanvas();
  hideElement(canvas);
}

export function setBenchmarkToHalted() {
  const resultPanel = getResultPanel();
  hideElement(resultPanel);

  const progressSpinnerContainer = getProgressSpinnerContainer();
  hideElement(progressSpinnerContainer);

  const resultTableContainer = getResultTableContainer(resultPanel);
  resultTableContainer.innerHTML = "";
  hideElement(resultTableContainer);

  const canvas = getResultChartCanvas();
  hideElement(canvas);
}

export function setBenchmarkToCompleted({
  categories,
  measurements,
}: {
  categories: string[];
  measurements: {parserName: string; values: number[]}[];
}) {
  const resultPanel = getResultPanel();
  showElement(resultPanel);

  const progressSpinnerContainer = getProgressSpinnerContainer();
  hideElement(progressSpinnerContainer);

  const resultTableContainer = getResultTableContainer(resultPanel);
  showElement(resultTableContainer);
  resultTableContainer.innerHTML = `
    <table class="benchmark-table">
      <caption>Average parsing times</caption>
      <thead>
        <tr>
          <th>Parsers</th>
          ${categories.map((category) => `<th>${category}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${measurements
          .map(
            ({parserName, values}) => `
              <tr>
                <th class="benchmark-table__category-header">
                  ${parserName}
                </th>
                ${values
                  .map(
                    (cell) => `
                      <td class="benchmark-table__number-cell">
                        ${cell.toFixed(2)}ms
                      </td>
                    `
                  )
                  .join("")}
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;

  const canvas = getResultChartCanvas();
  showElement(canvas);
  drawChart(canvas, {categories, measurements});
}

export function setErrorMessage(message: string | null) {
  const errorPanel = document.querySelector<HTMLElement>(".error-panel");
  if (!errorPanel) {
    throw new Error("No error panel element");
  }

  const errorMessageEl = errorPanel.querySelector<HTMLElement>(
    ".error-panel__message"
  );
  if (!errorMessageEl) {
    throw new Error("No error panel message element");
  }

  if (message === null) {
    hideElement(errorPanel);
    errorMessageEl.textContent = "";
  } else {
    showElement(errorPanel);
    errorMessageEl.textContent = message;
  }
}
