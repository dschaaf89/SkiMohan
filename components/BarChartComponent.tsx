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

// Register necessary chart.js components
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
  data: ChartData<'bar'>; // Define the expected data type
}

// BarChartComponent renders a bar chart with the provided data and options
const BarChartComponent: React.FC<BarChartProps> = ({ data }) => {
  // Define options inside the client component to avoid server-to-client function issues
  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'top', // Adjust the legend position as needed
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        formatter: (value: number) => value, // Ensure formatter handles the value correctly
        color: '#555', // Set label color
      },
    },
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}> {/* Center the chart with max width */}
      <Bar options={chartOptions} data={data} height={300} width={600} /> {/* Adjust dimensions here */}
    </div>
  );
};

export { BarChartComponent };
