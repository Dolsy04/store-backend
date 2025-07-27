import { useState, useEffect } from "react";
import { Pie, Line } from "react-chartjs-2";


import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  BarElement,
  Legend,
  Filler,
  Title,ArcElement
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  Title,
  BarElement,ArcElement
);

function ShoeOverview(){
    const [isLoading, setIsLoading] = useState(false);
    // ---------for -- showing total items ----------


    const totaProductCount = [
        { name: "Sneakers", totalCount: 40, color: "#0000ff" },
        { name: "Loafers", totalCount: 50, color: "#363838" },
        { name: "Boots", totalCount: 92, color: "green" },
        { name: "Slides", totalCount: 90, color: "#75a505" },
    ]
    const chartData = {
        labels: totaProductCount.map(item => `${item.name} (${item.totalCount})`),
        datasets: [
            {
                label: "Total Products",
                data: totaProductCount.map(item => item.totalCount),
                borderColor: "#4bc0c0",
                backgroundColor: "#4bc0c0",
                tension: 0.4,
                pointBackgroundColor: totaProductCount.map(item => item.color),
                pointBorderWidth: 0,
                fill: false,
                borderWidth: 2,
            },
        ],
    };
    const chartOptions = {
        plugins: {
            legend: {
                display: true,
                position: "bottom",
                labels: {
                font: { size: 12 },
                }
            },
            tooltip: {
                callbacks: {
                    label: context => `Total: ${context.raw}`
                }
            },
        },
        responsive: true,
        maintainAspectRatio: false,
        
        scales: {
            x: {
                title: { display: true, text: 'Product Type',  },
                },
            y: {
                beginAtZero: true,
                ticks: {
                    stepsSize: 10
                }
            }
        }
    }
    // -----------------------------------------
    // -----------for low stock items -----------------

    const lowStockItems = [
        { name: "Sneakers", count: 5, totalCount: 40, color: "#FF6384" },
        { name: "Loafers", count: 30, totalCount: 50, color: "#36A2EB" },
        { name: "Boots", count: 82, totalCount: 92, color: "#FFCE56" }, // remain 7
        { name: "Slides", count: 78, totalCount: 90, color: "#0000ff" }, // remain 12
    ];
    
    const fliteredStock = lowStockItems.filter(item => item.totalCount - item.count <= 20);

    const chartLowStock = {
        labels: fliteredStock.map(item => `${item.name} (${item.totalCount - item.count} left)`),
        datasets: [
            {
                data: fliteredStock.map(item => item.totalCount - item.count),
                backgroundColor: fliteredStock.map(item => item.color),
                borderWidth: 1,
            },
        ],
    }

    const chartOptionsLowStock = {
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12 }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    };
    // --------------------------------------

    return(<>
        <div className="w-full flex items-center gap-8">
            <div className="w-[600px] bg-white h-auto p-5 border border-gray-300 rounded shadow relative">
                <h4 className="text-center font-normal font-[mulish] mb-2 text-sm text-gray-700">Total Item For Each Products</h4>
                <div className="w-full h-[300px] pb-2">
                    <Line  data={chartData} options={chartOptions}/>
                </div>
            </div>

            <div className="bg-white w-[400px] h-auto p-5 border border-gray-300 rounded shadow relative">
                <h4 className="text-center font-normal mb-2 text-sm font-[mulish] text-gray-700">Low Stock Products</h4>
                 <div className="w-full h-[300px] pb-2">
                    <Pie data={chartLowStock} options={chartOptionsLowStock}/>
                </div>
            </div>
        </div>
    </>)
}

export default ShoeOverview