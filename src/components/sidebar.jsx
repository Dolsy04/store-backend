import { NavLink } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { BiSolidDashboard } from "react-icons/bi";
import { RiProductHuntFill } from "react-icons/ri";
import { MdMessage, MdReceipt, MdOutlineAssignment, MdManageAccounts } from "react-icons/md";
import { CgProfile, CgLogOut } from "react-icons/cg";
import { userDB } from "../firebase/db.js";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useState, useEffect } from "react";
import { auth } from "../firebase/db.js";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Sidebar(){
    const [isLoading, setLoading] = useState(false);
    const [storeAllMessage, setStoreAllMessage] = useState([]);
    const navigate = useNavigate();
    
    const fetchInboxes =()=>{
            setLoading(true);
    
            const messageQuery = query(collection(userDB, "MessageDb"),orderBy("timestamp", "desc"))
            const messageSnapShot = onSnapshot(messageQuery, (snapshot)=>{
                const message = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
                setStoreAllMessage(message);
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
    const unreadCount = storeAllMessage.filter(msg => msg.status === "unread").length;

    const performLogout = async () => {
        try {
        await signOut(auth);
        navigate("/")
        localStorage.clear();
        
        toast.success("Logout successfully", {position: "top-center", autoClose: 1000})

        // Prevent browser back navigation
        window.history.pushState(null, "", window.location.href);
        window.onpopstate = function () {
            window.history.go(1);
        };

        
        } catch (error) {
        console.error("Logout failed:", error.message);
        alert("Error during logout.");
        }
    };


    return(<>
        <nav className="w-full h-[90vh] flex items-start justify-between gap-10 flex-col pl-7 pb-3 relative">
            <ul className="flex items-start gap-[10px] justify-between flex-col">
                <li>
                    <NavLink to="/overview"  end className={({isActive}) => `hover:bg-blue-200 hover:text-blue-600  hover:py-2 hover:px-6 hover:rounded-full transition-all duration-500 flex items-center gap-2 mt-4 ${isActive ? "bg-blue-200 py-2 px-6 rounded-full text-blue-600 font-[mulish] text-sm font-semibold tracking-wide" : "text-gray-700 text-sm font-[mulish] tracking-wide font-medium"}`}>
                        <BiSolidDashboard size={20} className="" />
                        <span>Dashboard</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="productpage" end className={({isActive}) => `hover:bg-blue-200 hover:text-blue-600  hover:py-2 hover:px-6 hover:rounded-full transition-all duration-500 flex items-center gap-2 mt-4 ${isActive ? "bg-blue-200 py-2 px-6 rounded-full text-blue-600 font-[mulish] text-sm font-semibold tracking-wide" : "text-gray-700 text-sm font-[mulish] tracking-wide font-medium"}`}>
                        <RiProductHuntFill size={20} className=""/>
                        <span>Products</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="orderpage" end className={({isActive}) => `hover:bg-blue-200 hover:text-blue-600  hover:py-2 hover:px-6 hover:rounded-full transition-all duration-500 flex items-center gap-2 mt-4 ${isActive ? "bg-blue-200 py-2 px-6 rounded-full text-blue-600 font-[mulish] text-sm font-semibold tracking-wide" : "text-gray-700 text-sm font-[mulish] tracking-wide font-medium"}`}>
                        <MdOutlineAssignment size={20} className=""/>
                        <span>Orders</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="invoicepage" end className={({isActive}) => `hover:bg-blue-200 hover:text-blue-600  hover:py-2 hover:px-6 hover:rounded-full transition-all duration-500 flex items-center gap-2 mt-4 ${isActive ? "bg-blue-200 py-2 px-6 rounded-full text-blue-600 font-[mulish] text-sm font-semibold tracking-wide" : "text-gray-700 text-sm font-[mulish] tracking-wide font-medium"}`}>
                        <MdReceipt size={20} className=""/>
                        <span>Invoices</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="messagepage" end className={({isActive}) => `hover:bg-blue-200 hover:text-blue-600  hover:py-2 hover:px-6 hover:rounded-full transition-all duration-500 flex items-center gap-2 mt-4 ${isActive ? "bg-blue-200 py-2 px-6 rounded-full text-blue-600 font-[mulish] text-sm font-semibold tracking-wide" : "text-gray-700 text-sm font-[mulish] tracking-wide font-medium"}`}>
                        <MdMessage size={20} className=""/>
                        <span>Inbox</span>
                        <span className="bg-orange-600 text-sm text-white w-auto h-[20px] flex items-center justify-center rounded p-1">{String(unreadCount).padStart("2", 0)}</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="userMangerpage" end className={({isActive}) => `hover:bg-blue-200 hover:text-blue-600 hover:py-2 hover:px-6 hover:rounded-full transition-all duration-500 flex items-center gap-2 mt-4 ${isActive ? "bg-blue-200 py-2 px-6 rounded-full text-blue-600 font-[mulish] text-sm font-semibold tracking-wide" : "text-gray-700 text-sm font-[mulish] tracking-wide font-medium"}`}>
                        <MdManageAccounts size={20} className=""/>
                        <span>Manage User</span>
                    </NavLink>
                </li>
            </ul>

            <div className="mb-5 border border-gray-400 rounded w-[90%] h-[44px] flex items-center justify-center gap-6">
                <div onClick={()=> performLogout()} className="flex items-center justify-center gap-1 font-[mulish] tracking-wide text-sm font-normal w-full h-[44px] rounded text-red-600 pr-2 cursor-pointer">
                    <CgLogOut />
                    <span>Sign out</span>
                </div>
            </div>
        </nav>
    </>)
}

export default Sidebar