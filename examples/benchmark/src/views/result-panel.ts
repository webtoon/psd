// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import type {AppState, BenchmarkMeasurements} from "../model";
import {drawChart} from "./chart";
import {findElement, hideElement, showElement} from "./common";

const MEASUREMENT_NAMES = Object.freeze<
  Record<keyof BenchmarkMeasurements, string>
>({
  parseTime: "Metadata",
  imageDecodeTime: "Decoding (merged image)",
  layerDecodeTime: "Decoding (all layers)",
});

export function renderResultPanel(appState: AppState) {
  const resultPanel = findElement<HTMLElement>(
    ".result-panel",
    "result panel element"
  );
  if (
    appState.isRunning() ||
    (appState.isComplete() && appState.benchmarkResults.length > 0)
  ) {
    showElement(resultPanel);
  } else {
    hideElement(resultPanel);
  }

  const progressSpinnerContainer = findElement<HTMLElement>(
    ".result-panel__spinner-container",
    "progress spinner container element"
  );
  if (appState.isRunning()) {
    showElement(progressSpinnerContainer);
  } else {
    hideElement(progressSpinnerContainer);
  }

  const resultTableContainer = findElement<HTMLElement>(
    ".result-panel__table-container",
    "result panel table container element"
  );
  if (appState.isComplete() || appState.benchmarkResults.length > 0) {
    showElement(resultTableContainer);
    resultTableContainer.innerHTML = `
      <table class="benchmark-table">
        <caption>Average parsing times</caption>
        <thead>
          <tr>
            <th>Parsers</th>
            <th>${MEASUREMENT_NAMES.parseTime}</th>
            <th>${MEASUREMENT_NAMES.imageDecodeTime}</th>
            <th>${MEASUREMENT_NAMES.layerDecodeTime}</th>
          </tr>
        </thead>
        <tbody>
          ${appState.benchmarkResults
            .map(
              (result) => `
                <tr>
                  <th class="benchmark-table__category-header">
                    ${result.libraryName}
                  </th>
                  <td class="benchmark-table__number-cell">
                    ${result.measurements.parseTime.toFixed(2)}ms
                  </td>
                  <td class="benchmark-table__number-cell">
                    ${result.measurements.imageDecodeTime.toFixed(2)}ms
                  </td>
                  <td class="benchmark-table__number-cell">
                    ${result.measurements.layerDecodeTime.toFixed(2)}ms
                  </td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;
  } else {
    hideElement(resultTableContainer);
    resultTableContainer.innerHTML = "";
  }

  const canvas = findElement<HTMLCanvasElement>(
    "canvas#result-chart-canvas",
    "result chart canvas element"
  );
  if (appState.isComplete() && appState.benchmarkResults.length > 0) {
    showElement(canvas);
    drawChart(canvas, {
      measurementNames: MEASUREMENT_NAMES,
      benchmarkResults: appState.benchmarkResults,
    });
  } else {
    hideElement(canvas);
  }
}
