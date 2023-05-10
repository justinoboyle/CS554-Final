import moment from "moment";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// left side is in dollars

export const options = {
  responsive: true,
  // hide title
  plugins: {
    title: {
      display: false,
      text: "Total portfolio value over time (USD)",
    },
    // hide legend
    legend: {
      display: false,
    },
  },
};

// should be like days[] prices[]
type DaysAndPrices = {
  days: string[];
  prices: number[];
};

export default function StockChart({ days, prices }: DaysAndPrices) {
  const data = {
    labels: days,
    datasets: [
      {
        label: "Total portfolio value over time (USD)",
        data: prices,
        // light blue
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
      },
    ],
  };
  return <Line options={options} data={data} />;
}
