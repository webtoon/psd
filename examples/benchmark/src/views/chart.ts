// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
} from "chart.js";
import type {BenchmarkMeasurements, BenchmarkResult} from "../model";

// Initialize Chart.js
Chart.register(BarController, BarElement, CategoryScale, Legend, LinearScale);

const COLOR_SCHEME = {
  backgroundColor: {
    parseTime: "rgba(245, 121, 58, 0.5)",
    imageDecodeTime: "rgba(169, 90, 161, 0.5)",
    layerDecodeTime: "rgba(133, 192, 249, 0.5)",
  } as Record<keyof BenchmarkMeasurements, string>,
  borderColor: {
    parseTime: "rgba(245, 121, 58, 1)",
    imageDecodeTime: "rgba(169, 90, 161, 1)",
    layerDecodeTime: "rgba(133, 192, 249, 1)",
  } as Record<keyof BenchmarkMeasurements, string>,
};

export function drawChart(
  canvas: HTMLCanvasElement,
  {
    measurementNames,
    benchmarkResults,
  }: {
    measurementNames: Record<keyof BenchmarkMeasurements, string>;
    benchmarkResults: readonly BenchmarkResult[];
  }
) {
  /** Library names */
  const libraryNames = benchmarkResults.map(({libraryName}) => libraryName);
  const datasets = Object.entries(measurementNames).map(([key, label]) => {
    const measurementType = key as keyof BenchmarkMeasurements;

    return {
      label,
      data: benchmarkResults.map(
        ({measurements}) => measurements[measurementType]
      ),
      backgroundColor: COLOR_SCHEME.backgroundColor[measurementType],
      borderColor: COLOR_SCHEME.borderColor[measurementType],
      borderWidth: 1,
      barPercentage: 0.6,
    };
  });

  const chart = Chart.getChart(canvas);
  if (!chart) {
    new Chart(canvas, {
      type: "bar",
      data: {
        labels: libraryNames,
        datasets,
      },
      options: {
        indexAxis: "y",
        plugins: {
          legend: {
            display: true,
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
        // Since we're re-rendering the chart on every state change, the
        // animations play every time we fiddle with the controls.
        // To prevent this, disable animations altogether
        animation: false,
      },
    });
  } else {
    chart.data.labels = libraryNames;
    chart.data.datasets = datasets;
    chart.update();
  }
}
