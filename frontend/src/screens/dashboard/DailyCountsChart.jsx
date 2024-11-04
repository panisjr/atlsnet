import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import annotationPlugin from 'chartjs-plugin-annotation'; // Import the annotation plugin
import "./Dashboard.css";
import "../css/DarkLightMode.css";

// Register necessary components for ChartJS
ChartJS.register(
  LinearScale,
  CategoryScale,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  annotationPlugin // Register the annotation plugin
);

const DailyCountsChart = ({ data }) => {
  // Calculate the highest, lowest, and average counts
  const inCountsValues = data.map((item) => item.in_counts);
  const outCountsValues = data.map((item) => item.out_counts);
  const highest = Math.max(...inCountsValues, ...outCountsValues);
  const lowest = Math.min(...inCountsValues, ...outCountsValues);
  const average = (
    inCountsValues.concat(outCountsValues).reduce((a, b) => a + b, 0) /
    (inCountsValues.length + outCountsValues.length)
  ).toFixed(2);

  // Prepare data for the line chart
  const chartData = {
    labels: data.map((item) => item.day), // Use day names as labels
    datasets: [
      {
        label: "In Counts",
        data: inCountsValues,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
      {
        label: "Out Counts",
        data: outCountsValues,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      },
      {
        label: "Highest",
        data: Array(data.length).fill(highest), // Fill with highest value
        borderColor: "rgba(255, 0, 0, 0.8)",
        borderWidth: 2,
        pointRadius: 0, // Hide points
        borderDash: [5, 5], // Dashed line for visual distinction
        fill: false,
      },
      {
        label: "Average",
        data: Array(data.length).fill(average), // Fill with average value
        borderColor: "rgba(0, 0, 255, 0.8)",
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [5, 5],
        fill: false,
      },
      {
        label: "Lowest",
        data: Array(data.length).fill(lowest), // Fill with lowest value
        borderColor: "rgba(0, 255, 0, 0.8)",
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [5, 5],
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right', // Position legend on the right
        align: 'start',    // Align legend items to start (top)
      },
    },
  };

  return (
    <div className="graph-container">
      <div className="d-flex align-items-center justify-content-start">
        <p className="fs-6 fw-semibold">Daily Trends</p>
        <p className="ms-2 bi bi-graph-up"></p>
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default DailyCountsChart;
