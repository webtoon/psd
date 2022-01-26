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

// Initialize Chart.js
Chart.register(BarController, BarElement, CategoryScale, Legend, LinearScale);

const COLOR_SCHEME = {
  backgroundColor: [
    "rgba(245, 121, 58, 0.5)",
    "rgba(169, 90, 161, 0.5)",
    "rgba(133, 192, 249, 0.5)",
  ],
  borderColor: [
    "rgba(245, 121, 58, 1)",
    "rgba(169, 90, 161, 1)",
    "rgba(133, 192, 249, 1)",
  ],
};

export function drawChart(
  canvas: HTMLCanvasElement,
  {
    categories,
    measurements,
  }: {
    categories: string[];
    measurements: {parserName: string; values: number[]}[];
  }
) {
  /** Library names */
  const parserNames = measurements.map(({parserName}) => parserName);
  const datasets = categories.map((category, categoryIndex) => ({
    label: category,
    data: measurements.map(({values}) => values[categoryIndex]),
    backgroundColor: COLOR_SCHEME.backgroundColor[categoryIndex],
    borderColor: COLOR_SCHEME.borderColor[categoryIndex],
    borderWidth: 1,
    barPercentage: 0.6,
  }));

  const chart = Chart.getChart(canvas);
  if (!chart) {
    new Chart(canvas, {
      type: "bar",
      data: {
        labels: parserNames,
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
      },
    });
  } else {
    chart.data.labels = parserNames;
    chart.data.datasets = datasets;
    chart.update();
  }
}
