// Use client-side rendering for this component
"use client";

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ChartData, 
  ChartOptions 
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
// Register chart.js components needed for a bar chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

// Interface for the component props
interface BarChartProps {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
}

// Default options for the chart
const defaultOptions: ChartOptions<'bar'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Students in Program',
    },
    datalabels: { // This is where you define how the data labels should appear
      anchor: 'end',
      align: 'top',
      formatter: (value, context) => value,
      color: '#555', // Change the color if needed
    },
  },
  // Make sure to merge this plugins property with the existing one if it's already defined
};

export const BarChartComponent: React.FC<BarChartProps> = ({ data, options }) => {
  const chartOptions = { ...defaultOptions, ...options }; // Merge default options with props options

  return <Bar options={chartOptions} data={data} />;
};