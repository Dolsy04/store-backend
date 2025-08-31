import { useState, useEffect } from "react";
import { db, userDB } from "../../firebase/db.js"
import { collection, onSnapshot, orderBy, query, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function RecentOrder(){
    const [ordersWithItems, setOrdersWithItems] = useState([]);
    const [isLoading, setLoading] = useState(false);

    const fetchOrdersWithItems = () => {
        setLoading(true);

        const ordersQuery = query(
            collection(db, "orders"), 
            orderBy("createdAt", "desc")
        );
        
        const unsubscribe = onSnapshot(ordersQuery, 
            async (ordersSnapshot) => {
                try {
                    const ordersPromises = ordersSnapshot.docs.map(async (orderDoc) => {
                        // Get order data
                        const orderData = {
                            id: orderDoc.id,
                            ...orderDoc.data()
                        };

                        // Get items for this order
                        const itemsSnapshot = await getDocs(
                            collection(db, "orders", orderDoc.id, "items")
                        );
                        
                        const items = itemsSnapshot.docs.map(itemDoc => ({
                            id: itemDoc.id,
                            ...itemDoc.data()
                        }));

                        // Combine order with its items
                        return {
                            ...orderData,
                            items: items
                        };
                    });

                    // Wait for all orders with their items
                    const ordersWithItemsData = await Promise.all(ordersPromises);
                    
                    setOrdersWithItems(ordersWithItemsData);
                    
                    setLoading(false);
                    
                } catch (error) {
                    console.error("Error fetching orders with items:", error);
                    setResponseMessage(`Error: ${error.message}`);
                    setLoading(false);
                }
            }, 
            (error) => {
                setResponseMessage(`Snapshot error: ${error.message}`);
                console.error(error);
                setLoading(false);
            }
        );
        
        return unsubscribe;
    };

    useEffect(() => {
        const unsubscribe = fetchOrdersWithItems();
        return unsubscribe;
    }, []);

    const SliceProduct = ordersWithItems.slice(0, 4)

    return(<>
        
        <div className="bg-white w-full h-full rounded-lg shadow-xs p-3">
            <div className="mb-4">
                <h1 className="text-xl font-semibold text-gray-800">Recent Order</h1>
                <Link to="orderpage" className="font-[mulish] font-normal text-sm capitalize text-blue-500 tracking-wide">view orders</Link>
            </div>
            <div>
                {isLoading ? (
                    <div>
                        <p>LOADING......</p>
                    </div>
                ) : ordersWithItems.length === 0 ? (
                    <div>
                        <p>No Order</p>
                    </div>
                ) : (<div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <td className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-[Montserrat]">Order #</td>
                                <td className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-[Montserrat]">Date</td>
                                <td className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-[Montserrat]">Client</td>
                                <td className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-[Montserrat]">Amount</td>
                                <td className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-[Montserrat]">Status</td>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {SliceProduct.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-600">{item.orderNumber} </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-600">{item.createdAt.toDate().toLocaleString()} </td>
                                    <td className="px-4 py-3 capitalize whitespace-nowrap text-sm font-medium text-gray-700 tracking-wide">{item.billingLastName} </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-700">{item.totalAmount.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2})} </td>
                                    <td className={`px-4 py-3 text-center whitespace-nowrap text-xs font-normal font-[mulish]`}><span className={`px-1.5 py-0.5 rounded-full ${item.status === "Pending" ? "bg-[#FFB900]" : item.status === "Completed" ? "bg-[#00C951]" : "bg-[#E7000B]"}`}>{item.status}</span> </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>)}
            </div>
        </div>
    </>)
}

