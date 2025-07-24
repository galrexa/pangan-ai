import { formatCurrency, formatDate, formatNumber } from "../utils/helpers";
import { CHART_COLORS } from "../utils/constants";

export const createPriceChartConfig = (data, title = "Harga Pangan") => {
  return {
    data: data.map((item, index) => ({
      x: data.map((d) => d.date),
      y: data.map((d) => d.price),
      type: "scatter",
      mode: "lines+markers",
      name: item.region || `Series ${index + 1}`,
      line: { color: CHART_COLORS[index % CHART_COLORS.length] },
      hovertemplate: `
        <b>%{fullData.name}</b><br>
        Tanggal: %{x}<br>
        Harga: %{y:,.0f}<br>
        <extra></extra>
      `,
    })),
    layout: {
      title: title,
      xaxis: {
        title: "Tanggal",
        type: "date",
      },
      yaxis: {
        title: "Harga (IDR)",
        tickformat: ",.0f",
      },
      showlegend: true,
      hovermode: "x unified",
      margin: { t: 50, r: 50, b: 80, l: 80 },
    },
    config: {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ["lasso2d", "select2d"],
    },
  };
};

export const createWeatherChartConfig = (data, weatherType = "temperature") => {
  const weatherConfig = {
    temperature: { title: "Suhu (°C)", yAxisTitle: "Suhu (°C)", format: ".1f" },
    humidity: {
      title: "Kelembaban (%)",
      yAxisTitle: "Kelembaban (%)",
      format: ".1f",
    },
    rainfall: {
      title: "Curah Hujan (mm)",
      yAxisTitle: "Curah Hujan (mm)",
      format: ".1f",
    },
    windSpeed: {
      title: "Kecepatan Angin (m/s)",
      yAxisTitle: "Kecepatan Angin (m/s)",
      format: ".1f",
    },
  };

  const config = weatherConfig[weatherType];

  return {
    data: [
      {
        x: data.map((d) => d.date),
        y: data.map((d) => d[weatherType]),
        type: "scatter",
        mode: "lines+markers",
        name: config.title,
        line: { color: "#388e3c" },
        hovertemplate: `
        <b>${config.title}</b><br>
        Tanggal: %{x}<br>
        Nilai: %{y:${config.format}}<br>
        <extra></extra>
      `,
      },
    ],
    layout: {
      title: config.title,
      xaxis: { title: "Tanggal", type: "date" },
      yaxis: { title: config.yAxisTitle },
      showlegend: false,
      margin: { t: 50, r: 50, b: 80, l: 80 },
    },
    config: {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ["lasso2d", "select2d"],
    },
  };
};

export const createCorrelationChartConfig = (correlationData) => {
  return {
    data: [
      {
        x: correlationData.map((d) => d.factor),
        y: correlationData.map((d) => d.correlation),
        type: "bar",
        marker: {
          color: correlationData.map((d) =>
            d.correlation > 0 ? "#388e3c" : "#d32f2f"
          ),
        },
        hovertemplate: `
        <b>%{x}</b><br>
        Korelasi: %{y:.3f}<br>
        <extra></extra>
      `,
      },
    ],
    layout: {
      title: "Korelasi Faktor dengan Harga",
      xaxis: { title: "Faktor" },
      yaxis: { title: "Koefisien Korelasi", range: [-1, 1] },
      showlegend: false,
      margin: { t: 50, r: 50, b: 100, l: 80 },
    },
    config: {
      responsive: true,
      displayModeBar: true,
    },
  };
};
