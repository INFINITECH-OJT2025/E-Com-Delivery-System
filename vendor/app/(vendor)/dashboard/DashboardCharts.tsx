"use client";

import { FC } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define types for props
interface DashboardChartsProps {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

const DashboardCharts: FC<DashboardChartsProps> = ({ totalOrders, pendingOrders, totalRevenue }) => {
  const chartData = {
    labels: ["Total Orders", "Pending Orders", "Total Revenue"],
    datasets: [
      {
        label: "Metrics",
        data: [totalOrders, pendingOrders, totalRevenue],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Restaurant Dashboard Metrics",
        font: {
          size: 18,
        },
      },
    },
    // Added border radius for rounded charts
    elements: {
      bar: {
        borderRadius: 12, // Rounded bars
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md mt-8 transition-all duration-300">
    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
      Dashboard Metrics
    </h2>
    <Bar data={chartData} options={options} />
  </div>
  );
};

export default DashboardCharts;
