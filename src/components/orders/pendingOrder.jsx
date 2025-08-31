import { RiProgress6Line } from "react-icons/ri";
import { IoCheckmarkDoneOutline, IoCloseCircleSharp, IoCloseSharp } from "react-icons/io5";
import { FiDownloadCloud } from "react-icons/fi";
import { IoMdSearch, IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { TbCurrencyNaira } from "react-icons/tb";
import {  MdOutlineError } from "react-icons/md";
import { db } from "../../firebase/db.js"
import { collection, onSnapshot, orderBy, query, getDocs, where, updateDoc, doc } from "firebase/firestore";
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PendingOrderContent() {
    const [ordersWithItems, setOrdersWithItems] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const { setResponseMessage } = useOutletContext();
    const [showAllItems, setShowAllItems] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [orderItems, setOrderItems] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

  
    const fetchOrdersWithItems = () => {
        setIsLoading(true);

        const ordersQuery = query(
            collection(db, "orders"), 
            orderBy("createdAt", "desc"), where("status", "==", "Pending" )
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
                    setFilteredOrders(ordersWithItemsData);
                    setIsLoading(false);
                    
                } catch (error) {
                    console.error("Error fetching orders with items:", error);
                    setResponseMessage(`Error: ${error.message}`);
                    setIsLoading(false);
                }
            }, 
            (error) => {
                setResponseMessage(`Snapshot error: ${error.message}`);
                console.error(error);
                setIsLoading(false);
            }
        );
        
        return unsubscribe;
    };

    useEffect(() => {
        const unsubscribe = fetchOrdersWithItems();
        return unsubscribe;
    }, []);
    
    useEffect(() => {
        if (searchInput) {
            const searchTerm = searchInput.trim().toLowerCase();
            const filterResult = ordersWithItems.filter(order => 
                order.billingFirstName?.toLowerCase().includes(searchTerm) || 
                order.billingLastName?.toLowerCase().includes(searchTerm) ||
                order.billingEmail?.toLowerCase().includes(searchTerm) ||
                order.billingNumber?.toLowerCase().includes(searchTerm) ||
                order.billingAddress?.toLowerCase().includes(searchTerm) ||
                order.orderNumber?.toLowerCase().includes(searchTerm) ||
                order.deliveryFirstName?.toLowerCase().includes(searchTerm) ||
                order.deliveryLastName?.toLowerCase().includes(searchTerm) ||
                order.deliveryEmail?.toLowerCase().includes(searchTerm) ||
                order.deliveryNumber?.toLowerCase().includes(searchTerm) ||
                order.deliveryAddress?.toLowerCase().includes(searchTerm)
            );
            
            setFilteredOrders(filterResult);
            setCurrentPage(1);
        } else {
            setFilteredOrders(ordersWithItems);
        }
    }, [ordersWithItems, searchInput]);

    const hanldeViewDetails = async (order) => {
        setDetailLoading(true);
        setSelectedOrder(order);
        try {
            const itemsRef = collection(db, "orders", order.id, "items");
            const itemsSnapshot = await getDocs(itemsRef);
            const items = itemsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrderItems(items);
            setShowModal(true);
            setDetailLoading(false);
            } catch (error) {
            console.error("Error fetching order items:", error);
            setDetailLoading(false);
            } finally {
            setDetailLoading(false);
            }
    }
    
     const handleAcceptOrder = async (orderId) => {
            try {
            setUpdating(true);
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, {
                status: "Completed",
                paymentStatus: "Paid"
            });
            setResponseMessage("✅ Order accepted successfully!");
            } catch (error) {
            console.error("Error accepting order:", error);
            setResponseMessage("❌ Failed to accept order");
            } finally {
            setUpdating(false);
              setShowModal(false); 
            }
    };
    
    const handleRejectOrder = async (orderId) => {
        try {
            setUpdating(true);
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, {
            status: "Rejected",
            paymentStatus: "Not Paid"
            });
            setResponseMessage("⚠️ Order rejected!");
        } catch (error) {
            console.error("Error rejecting order:", error);
            setResponseMessage("❌ Failed to reject order");
        } finally {
            setUpdating(false);
          setShowModal(false);
        }
    };

    
    const exportOrdersPDF = (orders) => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Pending Orders Report", 14, 20);

        let tableRows = [];
        let grandTotal = 0;

        orders.forEach((order, index) => {
            let orderTotal = 0;
            order.items.forEach((item) => {
            const itemTotal = item.price * item.qty;
            orderTotal += itemTotal;

            tableRows.push([
                index + 1,
                order.id,
                `${order.billingFirstName} ${order.billingLastName}`,
                order.billingEmail,
                order.billingAddress,
                order.billingNumber,
                order.status,
                order.paymentStatus,
                item.name,
                item.size,
                item.qty,
                `₦${item.price.toLocaleString()}`,
                `${order.deliveryFirstName} ${order.deliveryLastName}`,
                order.deliveryAddress,
                order.deliveryEmail,
                order.deliveryNumber,
                `₦${itemTotal.toLocaleString()}`
            ]);
            });

            tableRows.push([
            "", "", "", "", "", "", "", "",
            "", "", "", "", "", "", "", "Order Total:",
            `₦${orderTotal.toLocaleString()}`
            ]);

            grandTotal += orderTotal;
        });

        const tableColumn = [
            "S/N", "Order ID", "Billing Name", "Billing Email", "Billing Address",
            "Billing Phone", "Status", "Payment", "Item Name", "Size", "Qty", "Price (₦)",
            "Delivery Name", "Delivery Address", "Delivery Email", "Delivery Number", "Total (₦)"
        ];

        // ✅ Use autoTable directly
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            styles: { fontSize: 8 },
            columnStyles: {
            16: { halign: "right", fontStyle: "bold" }
            }
        });

        const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 40;
        doc.setFontSize(14);
        doc.text(`Grand Total: ₦${grandTotal.toLocaleString()}`, 14, finalY);

        doc.save("Pending_orders.pdf");
    };

    const paginatedPage = filteredOrders.slice((currentPage - 1) * 15, currentPage * 15);
    const pageNumber = Math.ceil(filteredOrders.length / 15)
    return (<>
        <section className="mt-3">
            <div className="flex items-center justify-between my-10">
                <h3 className="font-[mulish] text-2xl font-semibold text-gray-700 tracking-wide">
                    {`Pending Orders (${String(ordersWithItems.length).padStart("2", 0)}) `}
                </h3>
                <div className="flex items-center gap-2 justify-between max-w-[400px] w-full h-[44px] px-2 bg-[#f6f6f6] rounded-md shadow">
                    <IoMdSearch size={20} color="gray" className="w-[20px] h-full"/>
                    <input type="search" placeholder="Search by ref, name or price" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full h-full font-[mulish] text-sm font-normal px-2 border-none outline-none"/>
                </div>
                <div>
                    <button onClick={()=>exportOrdersPDF(filteredOrders)} className="border border-gray-400 py-2 px-4 rounded-md font-[mulish] text-base text-black cursor-pointer flex items-center gap-2"><FiDownloadCloud /> Export</button>
                </div>
            </div>

            <div className="flex items-center justify-start flex-wrap gap-2">
                {isLoading ? (
                    <div className="w-full h-auto">
                        <div className="flex items-center justify-center flex-col w-[900px] h-[300px]">
                            <div className="relative">
                                <div className="relative w-20 h-20">
                                    <div className="absolute w-full h-full rounded-full border-[3px] border-gray-100/10 border-r-[#0000ff] border-b-[#000] animate-spin" style={{animationDuration: '3s'}} />
                                    <div className="absolute w-full h-full rounded-full border-[3px] border-gray-100/10 border-t-[#ff0000] animate-spin" style={{animationDuration: '2s', animationDirection: 'reverse'}} />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#000]/20 via-transparent to-[#ff0000]/20 animate-pulse rounded-full blur-sm" />
                            </div>
                            <p className="text-center mt-2 text-md font-medium fomt[mulish] text-gray-500">Generating Orders....</p>
                        </div>
                    </div>
                ) : ordersWithItems.length === 0 ? (<>
                    <div className="bg-amber-100 w-full h-[44px] flex items-center justify-between  rounded">
                        <p className="w-[8px] h-full bg-red-600 p-1"></p>
                        <p className="text-red-500 text-md font-semibold font-[mulish] text-center flex items-center justify-center gap-2 py-3 w-full rounded-md">
                            <MdOutlineError />
                            failed to fetch order from database - check your connection and try again!
                        </p>

                    </div>
                    <div className="flex items-center justify-center w-[20%] h-auto mx-auto">
                        <button className="mb-15 mt-2 w-full h-full border cursor-pointer py-3 bg-red-600 text-white rounded-xl" onClick={()=>fetchOrdersWithItems()}>Refresh</button>
                    </div>
                </>) : searchInput.trim() && filteredOrders.length === 0 ? (
                     <div className="bg-amber-100 w-full h-[44px] flex items-center justify-between my-15 rounded">
                        <p className="w-[8px] h-full bg-red-600 p-1"></p>
                        <p className="text-red-500 text-md font-semibold font-[mulish] text-center flex items-center justify-center gap-2 py-3 w-full rounded-md">
                            <MdOutlineError />
                            No result found for your search!
                        </p>
                    </div>
                ) : (<>
                    {paginatedPage.map((order) => {
                        const displayItems = showAllItems 
                            ? order.items 
                            : order.items?.slice(0, 3);
                            return(
                        <div key={order.id}  className="p-4 shadow-md w-auto rounded-md bg-[#f6f6f6]">
                            <div className="flex justify-between items-start mb-3">
                                {/* Name and order Number */}
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 font-semibold flex items-center justify-center rounded-md uppercase text-base tracking-wide font-[mulish] ${order.status === "Pending" ? "text-gray-700 bg-amber-400" : order.status === "Completed" ? "bg-green-500 text-black" : order.status === "Rejected" ? "bg-red-600 text-white" : "bg-white text-black"}`}>
                                        {order.billingFirstName?.charAt(0)}{order.billingLastName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800 font-[mulish] capitalize">
                                        {`${order.billingFirstName} ${order.billingLastName}`.slice(0, 10)}{`${order.billingFirstName} ${order.billingLastName}`.length > 10 ? '...' : ''}
                                        </p>
                                        <p className="text-xs text-gray-600 font-[mulish]">
                                            {order.orderNumber}
                                        </p>
                                    </div>
                                    {/* End of name and order Number */}
                                </div>
    
                                {/* Order status */}
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1 ${order.status === "Pending" ? "text-gray-700 bg-amber-400" : order.status === "Completed" ? "bg-green-500 text-black" : order.status === "Rejected" ? "bg-red-600 text-white" : "bg-white text-black"}`}>
                                        {order.status === "Pending" ? (<RiProgress6Line size={14}/>) : order.status === "Rejected" ? (<IoCloseCircleSharp />) : order.status === "Completed" ? (<IoCheckmarkDoneOutline />) : ""}
                                        
                                        {order.status || "Processing"}
                                    </span>
                                {/* End of Order status */}
                            </div>
                            
                            {/* Date and time */}
                            <div className="flex justify-between text-xs font-[mulish] tracking-wide text-gray-500 mb-3">
                                <span>
                                    {order.createdAt?.toDate().toLocaleDateString()}
                                </span>
                                <span>
                                    {order.createdAt?.toDate().toLocaleTimeString()}
                                </span>
                            </div>
    
                            <hr />
    
                            {/* 4 items orders */}
    
                            <div className="mt-3 h-[200px]">
                                {displayItems?.map((item, index) => (
                                    <div key={item.id || index} className="flex justify-between items-center mb-2 bg-white p-2 rounded-xl">
                                        <div >
                                            <p className="text-sm font-[mulish] text-gray-700 capitalize">{item.name || "Unnamed Item"}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs capitalize font-[mulish] text-gray-600">quantity: {item.qty}</span>
                                                <span className="text-xs font-[mulish] text-gray-600">-</span>
                                                <span className="text-xs capitalize font-[mulish] text-gray-600">size: <span className="uppercase"> {item.size}</span></span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm font-[mulish] text-gray-700">
                                            <TbCurrencyNaira size={14} />
                                            {typeof item.price === 'number' 
                                                ? item.price.toLocaleString() 
                                                : (parseFloat(item.price) || 0).toLocaleString()
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
    
                            <hr />
    
                            {/* total amount */}
    
                            <div className="flex justify-between items-center my-1">
                                <span className="font-semibold text-sm font-[mulish]">Total:</span>
                                <span className="font-semibold text-sm flex items-center">
                                    <TbCurrencyNaira size={16} className="" />
                                    {order.totalAmount?.toLocaleString() || "0"}
                                </span>
                            </div>
    
                            <div className="flex gap-2">
                                <button className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-xs hover:bg-blue-200 transition cursor-pointer" onClick={() => {setShowModal(true); hanldeViewDetails(order); }}>
                                    View Details
                                </button>
                                <button disabled={updating || order?.status === "Rejected" || order?.status === "Completed"} onClick={()=> handleRejectOrder(order.id)} className={`flex-1  px-3 py-2 rounded text-xs transition ${order?.status === "Rejected" ? "bg-red-700 text-white cursor-not-allowed" : order?.status === "Completed" ? "bg-[#016d2c] cursor-not-allowed text-white" : order?.status === "Pending" ? "bg-[#FFB900] text-black cursor-pointer" : "" } disabled:opacity-70`}>
                                   Reject Order
                                </button>
                            </div>
                        </div>)
                    })}
                </>)}
            </div>

            <div className="mt-3 flex items-center justify-between px-3 py-4 bg-white rounded shadow">
                <div className="flex items-center gap-5">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)} className={`rounded p-1 shadow flex items-center gap-1 font-[mulish] text-sm text-gray-600 ${currentPage === 1 ? " bg-zinc-100 cursor-auto" : "bg-white cursor-pointer"}`}><IoIosArrowBack size={15} color="gray"/> Previous </button>
                    <button disabled={currentPage === pageNumber} onClick={() => setCurrentPage((prev) => prev + 1)} className={`rounded p-1 shadow flex items-center gap-1 font-[mulish] text-sm text-gray-600 ${currentPage === pageNumber ? " bg-zinc-100 cursor-auto" : "bg-white cursor-pointer"}`}>Next <IoIosArrowForward size={15} color="gray"/></button>
                </div>
                <div>
                    <p className="font-semibold font-[mulish] text-gray-500 text-sm">Page {currentPage} of {pageNumber}</p>
                </div>
            </div>
        </section>

        <section className={`w-full h-screen bg-[#000000ab] fixed top-0 z-50 transition-all duration-300 ${showModal ? "right-0" : "right-[-100%]"}`}>
         {showModal && selectedOrder && (
            <section>
                <div className={`bg-[#f4f4f4] w-[40%] h-full absolute right-0 overflow-y-auto`}>
                    <div className="flex items-center justify-between px-4 py-2 sticky top-0  bg-[#f4f4f4] z-20">
                        <div className="flex items-center gap-2">
                            <p className="font-[mulish] font-semibold text-lg text-gray-700">Order ID:</p>
                            <p className="font-semibold font-[mulish] text-base">{selectedOrder.orderNumber}</p>
                        </div>
                        <div className="w-[40px] h-[40px] flex items-center justify-center cursor-pointer bg-white rounded-md" onClick={() => setShowModal(false)}>
                            <IoCloseSharp color="black" size={24}/>
                        </div> 
                    </div>

                    <div className="px-4">
                        {detailLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-4">
                                    <p className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700 font-[mulish] tracking-wide">Status</span>
                                        <span className={`flex items-center gap-1 px-1 py-0.5 rounded-md text-sm ${selectedOrder.status === "Pending" ? "text-gray-700 bg-amber-400" : selectedOrder.status === "Completed" ? "bg-green-500 text-black" : selectedOrder.status === "Rejected" ? "bg-red-600 text-white" : "bg-white text-black"}`}> {selectedOrder.status === "Pending" ? (<RiProgress6Line size={14}/>) : selectedOrder.status === "Rejected" ? (<IoCloseCircleSharp />) : selectedOrder.status === "Completed" ? (<IoCheckmarkDoneOutline />) : ""} {selectedOrder.status}</span></p>
                                        <span className={`flex items-center gap-1 px-1 py-0.5 rounded-md text-sm ${selectedOrder.paymentStatus === "Not Paid" ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>{selectedOrder.paymentStatus}</span>
                                        <p className="text-sm text-gray-700 font-[mulish] tracking-wide">Date {selectedOrder.createdAt?.toDate().toLocaleDateString()} - {selectedOrder.createdAt?.toDate().toLocaleTimeString()}</p>
                                </div>
                                <div className="w-full mb-3 max-h-[400px] p-2 overflow-hidden">
                                    <div className="w-full max-h-[390px] overflow-y-auto">
                                        <h4 className="mb-2 font-[mulish] text-xl text-gray-800 bg-gray-300 p-2 rounded-md">Order Summary</h4>
                                        {orderItems.map((item) => (
                                            <div key={item.id} className="">
                                                <div className="flex items-center justify-between bg-white mb-2 p-2 rounded-md">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-[60px] h-[60px]">
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                                                        </div>
                                                        <div>
                                                            <p className="capitalize text-base font-semibold text-gray-700 font-[mulish] tracking-wide">{item.name}</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="capitalize text-sm text-gray-700 font-[mulish] tracking-wide">quantity: {item.qty}</span>
                                                                <span className="text-gray-700 font-[mulish]"> - </span>
                                                                <span className="capitalize text-sm text-gray-700 font-[mulish] tracking-wide ">size: <span className="uppercase text-gray-700 font-[mulish]">{item.size || "No size"}</span></span>
                                                            </div>
                                                            <div className="flex items-center gap-0.5">
                                                                <p className="font-[mulish] text-gray-700 text-sm">Price:</p>
                                                                <p className="flex items-center font-[mulish] text-gray-700 text-sm"><TbCurrencyNaira size={16} className="" /> {typeof item.price === 'number' ? item.price.toLocaleString() : (parseFloat(item.price) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-700 font-[mulish]">Total Price</p>
                                                        <div className="flex items-center">
                                                            <TbCurrencyNaira size={16} className="" />
                                                            <p className="text-base font-semibold text-gray-700 font-[mulish]">{`${(item.price * item.qty).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between px-4 bg-white py-3 rounded-md">
                                    <p className="text-xl font-bold font-[mulish] text-blue-700">Grand Price:</p>
                                    <p className="flex items-center gap-0.5 text-xl font-bold text-blue-700 font-[mulish]"><TbCurrencyNaira  className="text-xl" /> {selectedOrder.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>

                                <div className="my-3">
                                    <h4 className="mb-2 font-[mulish] text-xl text-gray-800 bg-gray-300 p-2 rounded-md">Delivery Information</h4>

                                    <div className="mt-3">
                                        <p className="font-[mulish] text-base tracking-wide mb-3">Name: {selectedOrder.deliveryFirstName} {selectedOrder.deliveryLastName}</p>
                                        <p className="font-[mulish] text-base tracking-wide mb-3">Email: {selectedOrder.deliveryEmail}</p>
                                        <p className="font-[mulish] text-base tracking-wide mb-3">Pnone: {selectedOrder.deliveryNumber}</p>
                                        <p className="font-[mulish] text-base tracking-wide mb-3">Address: {selectedOrder.deliveryAddress}</p>
                                    </div>
                                </div>
                                <div className="mb-5 mt-3">
                                    <h4 className="mb-2 font-[mulish] text-xl text-gray-800 bg-gray-300 p-2 rounded-md">Billing Information</h4>

                                    <div className="mt-3">
                                        <p className="font-[mulish] text-base tracking-wide mb-3">Name: {selectedOrder.billingFirstName} {selectedOrder.billingLastName}</p>
                                        <p className="font-[mulish] text-base tracking-wide mb-3">Email: {selectedOrder.billingEmail}</p>
                                        <p className="font-[mulish] text-base tracking-wide mb-3">Pnone: {selectedOrder.billingNumber}</p>
                                        <p className="font-[mulish] text-base tracking-wide mb-3">Address: {selectedOrder.billingAddress}</p>
                                    </div>
                                </div>

                                <div  className="text-white w-full h-[44px] my-3 flex items-center justify-center rounded-md">
                                  {selectedOrder.status === "Pending" ? (
                                        <div className="w-full h-[44px] rounded-md flex items-center gap-10">
                                            <button className="w-full h-full bg-blue-600 rounded-md text-white cursor-pointer" onClick={()=> handleAcceptOrder(selectedOrder.id)}>Accept Order</button>
                                            <button className="w-full h-full bg-red-600 rounded-md cursor-pointer text-white" onClick={()=> handleRejectOrder(selectedOrder.id)}>Reject Order</button>
                                        </div>
                                    ) : selectedOrder.status === "Rejected" ? (<div className="bg-red-600 text-white cursor-not-allowed  w-full h-full flex items-center justify-center rounded-md">{`Order ${selectedOrder.status}`}</div>) : selectedOrder.status === "Completed" ? (<div className="bg-[#016d2c] cursor-not-allowed text-white w-full h-full flex items-center justify-center rounded-md">{`Order ${selectedOrder.status}`}</div>) : ""}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>
         )}
        </section>
    </>);
}
