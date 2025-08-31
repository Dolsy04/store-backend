import { useState, useEffect } from "react";
import { db, userDB } from "../../firebase/db.js"
import { collection, onSnapshot, orderBy, query, getDocs } from "firebase/firestore";
import { FiShoppingBag, FiMail, FiUsers } from "react-icons/fi";
import { MdInventory2 } from "react-icons/md";
import { toast } from "react-toastify";
import { PieChart, Pie, Cell, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {  Line,  } from "recharts";
import { ComposedChart } from "recharts";
import RecentOrder from "./recentOrder.jsx";
import RecentInbox from "./recentInbox.jsx";

export default function OverviewContent(){ 
    const [isLoading, setLoading] = useState(false);
    const [totalMessage, setTotalMessage] = useState([]);
    const [totalProduct, setTotalProduct] = useState([]);
    const [totalOrder, setTotalOrder] = useState([]);
    const [totalUserManger, setTotalUserManger] = useState([]);
    // for product state-----------
    const [shoeProduct, setShoeProduct] = useState([]);
    const [clothProduct, setClothProduct] = useState([]);
    const [perfumeProduct, setPerfumeProduct] = useState([]);
    // --------for order state
    const [ordersWithItems, setOrdersWithItems] = useState([]);
    const [pendingOrder, setPendingOrder] = useState([]);
    const [completedOrder, setCompletedOrder] = useState([]);
    const [rejectedOrder, setRejectedOrder] = useState([]);

    // for message state -----------------
    const [unreadStatus, setUnreadStatus] = useState(0);
    const [readStatus, setReadStatus] = useState(0);

    // for amAdmin & notAdmin--------------
    const [amAdmin, setAmAdmin] = useState([])
    const [amNotAdmin, setAmNotAdmin] = useState([])


    // ------------For total Message 
    const fetchInboxes = () =>{
        setLoading(true);

        const messageQuery = query(collection(userDB, "MessageDb"),orderBy("timestamp", "desc"))
        const messageSnapShot = onSnapshot(messageQuery, (snapshot)=>{
            const message = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
            setTotalMessage(message);
            setLoading(false)
        }, (error)=> {
            setResponseMessage(`Error Occured ${error.message}`)
            setLoading(false);
        })
        return messageSnapShot
    }
    useEffect(()=>{
        const getInboxes = fetchInboxes()
        return()=>{
            getInboxes();
        }
    },[])
    useEffect(()=>{
        const unreadMessage = totalMessage.filter((item)=> item.status === "unread")
        setUnreadStatus(unreadMessage.length)
        const readMessage = totalMessage.filter((item)=> item.status === "read")
        setReadStatus(readMessage.length)
    },[totalMessage])

    // -----------for products -------------
    const fetchShoeProduct =  () => {
        setLoading(true);
        
        const getProductRef = collection(db, "shoeproductDB");
        const productSnapShot =  onSnapshot(getProductRef, (snapshot) => {
            const products = snapshot.docs.map(doc =>({
                id: doc.id, ...doc.data(),
            }));
            setShoeProduct(products);
            // console.log(products);
            setLoading(false)
        },(error) => {
            setResponseMessage(`Error occured: ${error.message}`);
            console.error(error);
            setLoading(false)
        })
        return productSnapShot
    }
   
    const fetchClothProduct =  () => {
        setLoading(true);
        
        const getProductRef = collection(db, "clothproductDB");
        const productSnapShot =  onSnapshot(getProductRef, (snapshot) => {
            const products = snapshot.docs.map(doc =>({
                id: doc.id, ...doc.data(),
            }));
            setClothProduct(products);
            // console.log(products);
            setLoading(false)
        },(error) => {
            setResponseMessage(`Error occured: ${error.message}`);
            console.error(error);
            setLoading(false)
        })
        return productSnapShot
    }

    const fetchPerfumeProduct =  () => {
        setLoading(true);
        
        const getProductRef = collection(db, "perfumeproductDB");
        const productSnapShot =  onSnapshot(getProductRef, (snapshot) => {
            const products = snapshot.docs.map(doc =>({
                id: doc.id, ...doc.data(),
            }));
            setPerfumeProduct(products);
            // console.log(products);
            setLoading(false)
        },(error) => {
            setResponseMessage(`Error occured: ${error.message}`);
            console.error(error);
            setLoading(false)
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

   

    // -------for order product
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

    useEffect(() => {
        const pendingVar = ordersWithItems.filter((item)=> item.status === "Pending");
        setPendingOrder(pendingVar.length)
        const completedVar = ordersWithItems.filter((item)=> item.status === "Completed")
        setCompletedOrder(completedVar.length)
        const rejectVar = ordersWithItems.filter((item)=> item.status === "Rejected")
        setRejectedOrder(rejectVar.length)
    },[ordersWithItems])

    // ------------for userMangerContent
    const fetchUsers = () => {
        const adminUserQuery = query(collection(db, "adminUsers"),orderBy("createdAt", "desc"))
        const adminUsersSnapshot = onSnapshot(adminUserQuery, (snapShot)=> {
            const usersData = snapShot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
            setTotalUserManger(usersData);
        }, (error)=>{
            toast.error(error.message, {position: "top-center", autoClose: 2000});
            console.log(error.message);
        })
        return adminUsersSnapshot
    };
    
    useEffect(() => {
        const getInboxes = fetchUsers()
        return()=>{
            getInboxes();
        }
    }, []);



    useEffect(() => {
        const addProduct = shoeProduct.length + clothProduct.length + perfumeProduct.length;
        setTotalProduct(addProduct);
        const orderLength = ordersWithItems.length
        setTotalOrder(orderLength)
        const amAdmin = totalUserManger.filter((item)=>item.role === "Admin")
        setAmAdmin(amAdmin.length)
        const amNotAdmin = totalUserManger.filter((item)=>item.role === "Not Admin")
        setAmNotAdmin(amNotAdmin.length)
    }, [shoeProduct, clothProduct, perfumeProduct, ordersWithItems, totalUserManger]);

    const data = [
        { 
            name: "Messages", 
            unreadMessage: unreadStatus, 
            readMessage: readStatus,
            total: unreadStatus + readStatus
        },
        { 
            name: "Products", 
            shoeProduct: shoeProduct.length, 
            clothProduct: clothProduct.length, 
            perfumeProduct: perfumeProduct.length,
            total: shoeProduct.length + clothProduct.length + perfumeProduct.length
        },
        { 
            name: "Orders", 
            pendingOrder, 
            rejectedOrder, 
            completedOrder,
            total: pendingOrder + rejectedOrder + completedOrder
        },
    ];

    const pieData = [
        { name: "Admins", value: amAdmin },
        { name: "Not Admins", value: amNotAdmin }
    ];

    return(<>
        <section>
            {/* <h2 className="font-[mulish] text-2xl uppercase font-semibold text-[#00150b] tracking-wide">Dashboard</h2> */}
           
           <div className="bg-white flex items-center justify-center gap-7 p-4 rounded-xl">
                <div className="flex items-start gap-3 border-r pr-10 border-gray-300">
                    <div className="w-[40px] h-[40px] bg-white rounded-full flex items-center justify-center">
                        <FiShoppingBag className="text-blue-600" size={20}/>
                    </div>
                    <div className="ml-2 mt-2">
                        <p className="font-[Montserrat] text-sm font-normal tracking-wide text-gray-700">Total Order</p>
                        <p className="font-[mulish] text-2xl mt-2 font-bold tracking-wider text-gray-700">{String(totalOrder).padStart("3",0)}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 border-r pr-10 border-gray-300">
                    <div className="w-[40px] h-[40px] bg-white rounded-full flex items-center justify-center">
                        <FiMail className="text-blue-600" size={20}/>
                    </div>
                    <div className="ml-2 mt-2">
                        <p className="font-[Montserrat] text-sm font-normal tracking-wide text-gray-700">Total Message</p>
                        <p className="font-[mulish] text-2xl mt-2 font-bold tracking-wider text-gray-700">{String(totalMessage.length).padStart("3", 0)}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 border-r pr-10 border-gray-300">
                    <div className="w-[40px] h-[40px] bg-white rounded-full flex items-center justify-center">
                        <FiUsers className="text-blue-600" size={20}/>
                    </div>
                    <div className="ml-2 mt-2">
                        <p className="font-[Montserrat] text-sm font-normal tracking-wide text-gray-700">Total Admin</p>
                        <p className="font-[mulish] text-2xl mt-2 font-bold tracking-wide text-gray-700">{String(totalUserManger.length).padStart("3", 0)}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="w-[40px] h-[40px] bg-white rounded-full flex items-center justify-center">
                        <MdInventory2 className="text-blue-600" size={20}/>
                    </div>
                    <div className="ml-2 mt-2">
                        <p className="font-[Montserrat] text-sm font-normal tracking-wide text-gray-700">Total Product</p>
                        <p className="font-[mulish] text-2xl mt-2 font-bold tracking-wide text-gray-700">{String(totalProduct).padStart("3", 0)}</p>
                    </div>
                </div>
           </div>

           {/* bar & pie chart */}

           <div className="w-full h-64 flex items-center gap-10 mt-10">
                <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 p-2 w-full h-full rounded-xl">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data}>
                            <XAxis 
                            dataKey="name" 
                            stroke="#fff" 
                            tick={{ fill: "#fff", fontSize: 14, fontWeight: 600 }}
                            />
                            
                            <YAxis 
                            stroke="#fff" 
                            tick={{ fill: "#fff", fontSize: 14, fontWeight: 600 }}
                            />

                            <Tooltip />

                            <Bar dataKey="unreadMessage" fill="#ef4444" radius={[6, 6, 0, 0]} name="Unread Message"/>
                            <Bar dataKey="readMessage" fill="#facc15" radius={[6, 6, 0, 0]} name="Read Message"/>
                            <Bar dataKey="shoeProduct" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Shoes"/>
                            <Bar dataKey="clothProduct" fill="#10b981" radius={[6, 6, 0, 0]} name="Cloth"/>
                            <Bar dataKey="perfumeProduct" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Pefume"/>
                            <Bar dataKey="pendingOrder" fill="#FFB900" radius={[6, 6, 0, 0]} name="Pending Order"/>
                            <Bar dataKey="rejectedOrder" fill="#f87171" radius={[6, 6, 0, 0]} name="Rejected Order"/>
                            <Bar dataKey="completedOrder" fill="#22c55e" radius={[6, 6, 0, 0]} name="Completed Order"/>

                            {/* Line connecting the same data points */}
                            <Line 
                            type="monotone" 
                            dataKey="total" 
                            stroke="orange" 
                            strokeWidth={3} 
                            dot={{ fill: "red", r: 5 }}
                            />

                            {/* Gradient */}
                            <defs>
                            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#60a5fa" stopOpacity={1}/>
                                <stop offset="100%" stopColor="#2563eb" stopOpacity={1}/>
                            </linearGradient>
                            </defs>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white w-[45%] h-full rounded-xl">
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie 
                            data={pieData}
                            cx="50%" 
                            cy="50%" 
                            innerRadius={60}
                            outerRadius={90} 
                            dataKey="value"
                            paddingAngle={3}
                            >
                            <Cell fill="#3b82f6" />
                            <Cell fill="#f59e0b" />
                            </Pie>

                            <Tooltip />
                            <Legend />

                            <text 
                            x="50%" 
                            y="45%" 
                            textAnchor="middle" 
                            dominantBaseline="middle"
                            className="text-base tracking-wide font-semibold uppercase fill-gray-700 font-[Montserrat]"
                            >
                            {String(`${amAdmin + amNotAdmin} Admins`).padStart("2", 0)}
                            </text>
                        </PieChart>
                        </ResponsiveContainer>

                </div>
           </div>

           <div className="w-full h-[350px] mt-10 flex items-center gap-5">
            <div className="w-[45%] h-full bg-white rounded-xl">
                <RecentInbox />
            </div>
            <div className="w-[70%] h-full bg-white rounded-xl">
                <RecentOrder />
            </div>
           </div>
        </section>
    </>)
}

