import { useState, useEffect } from "react";
import { Pie, Line } from "react-chartjs-2";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase/db.js";
import { useOutletContext } from "react-router-dom";

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
  BarElement,ArcElement,
);



const StatisticsOverview = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [shoeProduct, setShoeProduct] = useState([]);
    const [clothProduct, setClothProduct] = useState([]);
    const [perfumeProduct, setPerfumeProduct] = useState([]);
    const { setResponseMessage } = useOutletContext();

    const fetchShoeProduct =  () => {
        setIsLoading(true);
        
        const getProductRef = collection(db, "shoeproductDB");
        const productSnapShot =  onSnapshot(getProductRef, (snapshot) => {
            const products = snapshot.docs.map(doc =>({
                id: doc.id, ...doc.data(),
            }));
            setShoeProduct(products);
            console.log(products);
            setIsLoading(false)
        },(error) => {
            setResponseMessage(`Error occured: ${error.message}`);
            console.error(error);
            setIsLoading(false)
        })
        return productSnapShot
    }
   
    const fetchClothProduct =  () => {
        setIsLoading(true);
        
        const getProductRef = collection(db, "clothproductDB");
        const productSnapShot =  onSnapshot(getProductRef, (snapshot) => {
            const products = snapshot.docs.map(doc =>({
                id: doc.id, ...doc.data(),
            }));
            setClothProduct(products);
            console.log(products);
            setIsLoading(false)
        },(error) => {
            setResponseMessage(`Error occured: ${error.message}`);
            console.error(error);
            setIsLoading(false)
        })
        return productSnapShot
    }

    const fetchPerfumeProduct =  () => {
        setIsLoading(true);
        
        const getProductRef = collection(db, "perfumeproductDB");
        const productSnapShot =  onSnapshot(getProductRef, (snapshot) => {
            const products = snapshot.docs.map(doc =>({
                id: doc.id, ...doc.data(),
            }));
            setPerfumeProduct(products);
            console.log(products);
            setIsLoading(false)
        },(error) => {
            setResponseMessage(`Error occured: ${error.message}`);
            console.error(error);
            setIsLoading(false)
        })
        return productSnapShot
    }

    useEffect(()=>{
        const ProductShoes = fetchShoeProduct();
        const ProductCloth = fetchClothProduct();
        const ProductPerfume = fetchPerfumeProduct();
        return ()=>{
            ProductShoes()
            ProductCloth()
            ProductPerfume()
        }
    },[])

    const totalProducts = shoeProduct.length;
    const totalClothProducts = clothProduct.length;
    const totalPerfumeProducts = perfumeProduct.length;

    const chartValue = [0, totalProducts, totalClothProducts, totalPerfumeProducts,];

    const generateRandomColors = (length) => {
        return Array.from({ length }, () =>
            `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
        );
    };

    const lowCount = 20;
    const compareCount = 20

    const comparelowStockShoe = ((lowCount - shoeProduct.length) <= compareCount);
    const comparelowStockCloth = ((lowCount - clothProduct.length) <= compareCount) ;
    const comparelowStockPerfume = ((lowCount - perfumeProduct.length) <= compareCount) ;

    const lowStockShoe  = (comparelowStockShoe ? (lowCount - shoeProduct.length) : "")
    const lowStockCloth = (comparelowStockCloth ? (lowCount - clothProduct.length) : "")
    const lowStockPerfume = (comparelowStockPerfume ? (lowCount - perfumeProduct.length) : "")
    

    const colors = generateRandomColors(chartValue.length);
    const filteredStock = [0,lowStockShoe, lowStockCloth, lowStockPerfume];
    const filteredStockPie = [lowStockShoe, lowStockCloth, lowStockPerfume];

        
    const chartData = {
        labels: [ [0], [`Shoe (${totalProducts} items) & (${lowStockShoe} left)`], [`Cloth (${totalClothProducts} items) & (${lowStockCloth} left)`], [`Pefume (${totalPerfumeProducts} items) & (${lowStockPerfume} left)`]],  //-----------X-axis
        
        datasets: [
            {
                label: "Total Products",
                data: chartValue,
                borderColor: "#00000bcc",
                backgroundColor: "#00000bcc",
                tension: 0.9,
                pointBackgroundColor: colors,
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 10, 
                fill: false,
                borderWidth: 1,
            },
            {
                label: "Low Stock Products",
                data: filteredStock,
                borderColor: "#ff0000",
                backgroundColor: "#ff0000",
                tension: 0.9,
                pointBackgroundColor: colors,
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 10, 
                fill: false,
                borderWidth: 1,
            }
        ],
    };
  

    const chartOptions = {
        plugins: {
            legend: {
                display: true,
                position: "top",
                labels: {
                font: { size: 12 },
                }
            },
            tooltip: {
                callbacks: {
                    label: context => `Total: ${context.raw}`
                }
            },
            backgroundColor: {},
        },
        responsive: true,
        maintainAspectRatio: false,
        
        scales: {
            x: {
                title: { display: true, text: 'Product Type', align: 'center', padding: { top: 10 }
                },
            ticks: {
                font: { size: 13 }
                }},
            y: {
                beginAtZero: true,
                ticks: {
                    stepsSize: 10
                }
            }
        }
    }



    // Combine all for the pie chart
   
    const chartLowStock = {
        labels:  [[`Shoe (${lowStockShoe} Left)`], [`Cloth (${lowStockCloth} Left)`], [`Pefume (${lowStockPerfume} Left)`]],
        datasets: [
            {
                data: filteredStockPie,
                backgroundColor: colors,
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
    
    return (
        <>
            <div className="w-full flex items-center gap-8">
            <div className="w-[600px] bg-white h-auto p-5 border border-gray-300 rounded shadow relative">
                <h4 className="text-center font-normal font-[mulish] mb-2 text-sm text-gray-700">Total Item For Each Products</h4>
                <div className="w-full h-[300px] pb-2">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            <div className="bg-white w-[400px] h-auto p-5 border border-gray-300 rounded shadow relative">
                <h4 className="text-center font-normal mb-2 text-sm font-[mulish] text-gray-700">Low Stock Products</h4>
                 <div className="w-full h-[300px] pb-2">
                    <Pie data={chartLowStock} options={chartOptionsLowStock}/>
                </div>
            </div>
        </div>
        </>
    );
}


export default StatisticsOverview;