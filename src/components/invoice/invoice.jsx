import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { db } from "../../firebase/db.js"
import { collection, onSnapshot, orderBy, query, getDocs, where } from "firebase/firestore";
import { TbCurrencyNaira } from "react-icons/tb";
import { IoMdSearch,IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { IoPrintOutline } from "react-icons/io5";

export default function InvoiceContent(){
    const [ordersWithItems, setOrdersWithItems] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const { setResponseMessage } = useOutletContext();
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const printRef = useRef(); 

    const fetchOrdersWithItems = () => {
        setIsLoading(true);

        const ordersQuery = query(
            collection(db, "orders"), 
            orderBy("createdAt", "desc"), where("status", "==", "Completed" )
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
                order.deliveryAddress?.toLowerCase().includes(searchTerm) ||
                order.orderNumber?.toLowerCase().includes(searchTerm)
            );
            
            setFilteredOrders(filterResult);
            setCurrentPage(1);
        } else {
            setFilteredOrders(ordersWithItems);
        }
    }, [ordersWithItems, searchInput]);

    const paginatedPage = filteredOrders.slice((currentPage - 1) * 15, currentPage * 15);
    const pageNumber = Math.ceil(filteredOrders.length / 15)

    const handlePrint = (invoice) => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; width: 700px;">
        <h1 style="text-align: center;">Payment Receipt</h1>
        <hr />
        <h3>Order Information</h3>
        <p><strong>Order Number:</strong> ${invoice.orderNumber}</p>
        <p><strong>Customer:</strong> ${invoice.billingFirstName} ${invoice.billingLastName}</p>
        <p><strong>Status:</strong> ${invoice.status}</p>
        <p><strong>Date:</strong> ${invoice.createdAt?.toDate().toLocaleDateString()} - ${invoice.createdAt?.toDate().toLocaleTimeString()}</p>

        <h3 style="margin-top: 20px;">Items</h3>
        <table border="1" cellspacing="0" cellpadding="8" style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f2f2f2;">
              <th align="left">Item</th>
              <th align="right">Quatity</th>
              <th align="right">Price</th>
              <th align="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map(
                (item) => `
              <tr>
                <td>${item.name}</td>
                <td align="right">${item.qty}</td>
                <td align="right">₦${Number(item.price).toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2})}</td>
                <td align="right">₦${Number(item.price * item.qty).toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2})}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <h2 style="text-align: right;">Grand Total: ₦${Number(invoice.totalAmount).toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits:2})}</h2>
        <p style="text-align: center; margin-top: 40px;">Thank you for your purchase!</p>
      </div>
    `;

    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write("<html><head><title>Invoice</title></head><body>");
    printWindow.document.write(printContent);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close(); // ✅ closes popup after printing
    };

    return (<>
        <div className=" flex items-center justify-between py-3">
            <div className="w-[40%]">
                <h3 className="font-semibold font-[mulish] text-2xl uppercase text-[#242427] tracking-wide">Payment Receipt</h3>

                <p className="text-sm text-gray-600 mt-2 font-[mulish] font-normal tracking-wide">View all your invoice or payment receipt. Create new invoice if product are bought on site.</p>
            </div>

            <button className="py-2 px-5 bg-blue-600 text-white font-[mulish] font-semibold text-sm rounded-md cursor-pointer tracking-wide">+ Create Invoice</button>
        </div>

        <div className="border-b border-b-gray-400 pb-3 mt-10 w-full">
            <div className="flex items-center justify-between" >
                <p className="font-[mulish] text-xl font-semibold tracking-wide text-[#000032]">Invoices</p>

                <div className="flex items-center gap-1 w-[50%] h-[40px] border-2 border-gray-400 rounded-md">
                    <IoMdSearch size={16} className="w-[5%] text-gray-600 h-full"/>
                    <input type="search" placeholder="Search invoices" value={searchInput} onChange={(e)=> setSearchInput(e.target.value)} className="w-full h-full border-none outline-none text-sm px-2 font-[mulish]"/>
                </div>
            </div>
        </div>

        <div>
            <div className="w-full h-full">
                {isLoading ? (
                    <div className="w-full h-[200px] flex items-center justify-center flex-col">
                        <div className="flex flex-row gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce [animation-delay:-.3s]" />
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce [animation-delay:-.5s]" />
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce [animation-delay:-.7s]" />
                        </div>
                        <p className="text-base font-[mulish] font-normal mt-2 text-gray-500">Fetching Invoices.... please wait</p>
                    </div>
                ) : ordersWithItems.length === 0 ? (
                    <div className=" w-full h-[300px] flex items-center justify-center">
                        <div className="bg-red-600 w-full py-3 rounded-md">
                            <p className="text-sm text-center font-[mulish] font-normal text-white">No invoice avaliable due to no Completed orders. Refresh your page if wrong or contact your technicial</p>
                        </div>
                    </div>
                ) :  searchInput.trim() && filteredOrders.length === 0 ? (
                    <div className=" w-full h-[300px] flex items-center justify-center">
                        <div className="bg-red-600 w-full py-3 rounded-md">
                            <p className="text-sm text-center font-[mulish] font-normal text-white">No result found for your search!</p>
                        </div>
                    </div>
                    ) : (<>
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <td className="px-4 py-2 text-sm font-[mulish] text-gray-700 font-normal tracking-wide border-b border-gray-200 ">Invoice #</td>
                                    <td className="px-4 py-2 text-sm font-[mulish] text-gray-700 font-normal tracking-wide border-b border-gray-200 ">Customer</td>
                                    {/* <td className="px-4 py-2 text-sm font-[mulish] text-gray-700 font-normal tracking-wide border-b border-gray-200 ">Email</td> */}
                                    <td className="px-4 py-2 text-sm font-[mulish] text-gray-700 font-normal tracking-wide border-b border-gray-200 ">Status</td>
                                    <td className="px-4 py-2 text-sm font-[mulish] text-gray-700 font-normal tracking-wide border-b border-gray-200 ">Amount</td>
                                    <td  className="px-4 py-2 text-sm font-[mulish] text-gray-700 font-normal tracking-wide border-b border-gray-200  text-center">Actions</td>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPage.map((invoice, index) => (
                                    <tr key={invoice.id} className={index % 2 === 0 ? "bg-white hover:bg-gray-100" : "bg-gray-50 hover:bg-gray-100"}>

                                        <td className="px-4 py-5 text-xs tracking-wide text-gray-500 border-b border-b-gray-300 font-[mulish] font-normal">{invoice.orderNumber}</td>

                                        <td className="px-4 py-5 text-sm capitalize tracking-wide text-gray-700 border-b border-b-gray-300 font-[mulish] font-normal">
                                            {(invoice.billingFirstName + " " + invoice.billingLastName).length > 15
                                            ? (invoice.billingFirstName + " " + invoice.billingLastName).slice(0, 15) + "..."
                                            : invoice.billingFirstName + " " + invoice.billingLastName}
                                        </td>

                                        <td className="px-4 py-3 text-xs tracking-wide text-gray-500 border-b border-b-gray-300 font-[mulish] font-normal ">
                                                <span className="bg-green-400 p-1 rounded-full text-black">
                                                {invoice.status}
                                                </span>
                                            </td>

                                        <td className="px-4 py-5 text-sm tracking-wide text-gray-700 border-b border-b-gray-300 font-[mulish] font-normal flex items-center "><TbCurrencyNaira size={15}/> {Number(invoice.totalAmount).toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2})}</td>

                                        <td className="px-4 py-3  text-gray-500 border-b border-b-gray-300">
                                            <div className="flex items-center justify-center gap-3">
                                                {/* <span className="text-xs tracking-wide font-[mulish] font-normal text-white bg-blue-600 px-2 py-2 rounded cursor-pointer">Open details</span> */}
                                                <IoPrintOutline size={20} className="cursor-pointer shadow-md" onClick={() => handlePrint(invoice)}/>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex items-center justify-between w-full mt-2">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setCurrentPage((prev) => prev - 1)} disabled={currentPage === 1} className={`flex items-center gap-1 text-sm font-[mulish] text-gray-600 bg-white shadow p-1 rounded ${currentPage === 1 ? "cursor-not-allowed" : "cursor-pointer"}`}><IoIosArrowBack/> Previous</button>

                                <button onClick={() => setCurrentPage((prev) => prev + 1)} disabled={currentPage === pageNumber} className={`flex items-center gap-1 text-sm font-[mulish] text-gray-600 bg-white shadow p-1 rounded ${currentPage === pageNumber ? "cursor-not-allowed" : "cursor-pointer"}`}>Next<IoIosArrowForward/> </button>
                            </div>
                            <div>
                                <p className="font-[mulish] text-sm text-gray-600">Page {currentPage} of {pageNumber}</p>
                            </div>
                        </div>
                    </>)}
            </div>
        </div>
    </>)
}