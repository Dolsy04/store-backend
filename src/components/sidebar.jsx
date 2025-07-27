import { NavLink } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { BiSolidDashboard } from "react-icons/bi";
import { RiProductHuntFill } from "react-icons/ri";
import { MdOutlineInventory } from "react-icons/md";
import { TbBorderSides } from "react-icons/tb";
import { IoIosPeople } from "react-icons/io";
import { SiContentstack } from "react-icons/si";
import { CgProfile } from "react-icons/cg";
import { FaCog } from "react-icons/fa";
import { CgLogOut } from "react-icons/cg";
import { useState } from "react";

function Sidebar(){

    return(<>
        <nav className="w-full h-[90vh] flex items-start justify-between flex-col pl-7 py-3 relative">
            <ul className="flex items-start gap-[10px] justify-between flex-col">
                <li>
                    <NavLink to="/overview"  end className={({isActive}) => `hover:bg-blue-200 hover:text-blue-600  hover:py-2 hover:px-6 hover:rounded-full transition-all duration-500 flex items-center gap-2 mt-4 ${isActive ? "bg-blue-200 py-2 px-6 rounded-full text-blue-600 font-[mulish] text-sm font-semibold tracking-wide" : ""}`}>
                        <BiSolidDashboard size={20} className="text-gray-700 text-sm font-[mulish] tracking-wide font-medium"/>
                        <span>Overview</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="productpage" end className={({isActive}) => `hover:bg-blue-200 hover:text-blue-600  hover:py-2 hover:px-6 hover:rounded-full transition-all duration-500 flex items-center gap-2 mt-4 ${isActive ? "bg-blue-200 py-2 px-6 rounded-full text-blue-600 font-[mulish] text-sm font-semibold tracking-wide" : "text-gray-700 text-sm font-[mulish] tracking-wide font-medium"}`}>
                        <RiProductHuntFill size={20} className=""/>
                        <span>Products</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/" end className={({isActive}) => `hover:bg-blue-200 hover:text-blue-600  hover:py-2 hover:px-6 hover:rounded-full transition-all duration-500 flex items-center gap-2 mt-4 ${isActive ? "bg-blue-200 py-2 px-6 rounded-full text-blue-600 font-[mulish] text-sm font-semibold tracking-wide" : "text-gray-700 text-sm font-[mulish] tracking-wide font-medium"}`}>
                        <MdOutlineInventory size={20} className=""/>
                        <span>Inventory</span>
                    </NavLink>
                </li>
                <hr className="border-b-gray-300 border-b w-full h-[1px]"/>
                <li>
                    <NavLink to="/" end className={({isActive}) => `hover:bg-blue-200 hover:text-blue-600  hover:py-2 hover:px-6 hover:rounded-full transition-all duration-500 flex items-center gap-2 mt-4 ${isActive ? "bg-blue-200 py-2 px-6 rounded-full text-blue-600 font-[mulish] text-sm font-semibold tracking-wide" : "text-gray-700 text-sm font-[mulish] tracking-wide font-medium"}`}>
                        <TbBorderSides size={20} className=""/>
                        <span>Orders</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/" end className={({isActive}) => `hover:bg-blue-200 hover:text-blue-600  hover:py-2 hover:px-6 hover:rounded-full transition-all duration-500 flex items-center gap-2 mt-4 ${isActive ? "bg-blue-200 py-2 px-6 rounded-full text-blue-600 font-[mulish] text-sm font-semibold tracking-wide" : "text-gray-700 text-sm font-[mulish] tracking-wide font-medium"}`}>
                        <IoIosPeople size={20} className=""/>
                        <span>Customers</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/" end className={({isActive}) => `hover:bg-blue-200 hover:text-blue-600  hover:py-2 hover:px-6 hover:rounded-full transition-all duration-500 flex items-center gap-2 mt-4 ${isActive ? "bg-blue-200 py-2 px-6 rounded-full text-blue-600 font-[mulish] text-sm font-semibold tracking-wide" : "text-gray-700 text-sm font-[mulish] tracking-wide font-medium"}`}>
                        <SiContentstack size={20} className=""/>
                        <span>Content Mangement</span>
                    </NavLink>
                </li>
                <hr className="border-b-gray-600 w-full h-[2px]"/>
                <li>
                    <NavLink to="/" end className={({isActive}) => `hover:bg-blue-200 hover:text-blue-600  hover:py-2 hover:px-6 hover:rounded-full transition-all duration-500 flex items-center gap-2 mt-4 ${isActive ? "bg-blue-200 py-2 px-6 rounded-full text-blue-600 font-[mulish] text-sm font-semibold tracking-wide" : "text-gray-700 text-sm font-[mulish] tracking-wide font-medium"}`}>
                        <CgProfile size={20} className=""/>
                        <span>Profile</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/" end className={({isActive}) => `hover:bg-blue-200 hover:text-blue-600 hover:py-2 hover:px-6 hover:rounded-full transition-all duration-500 flex items-center gap-2 mt-4 ${isActive ? "bg-blue-200 py-2 px-6 rounded-full text-blue-600 font-[mulish] text-sm font-semibold tracking-wide" : "text-gray-700 text-sm font-[mulish] tracking-wide font-medium"}`}>
                        <FaCog size={20} className=""/>
                        <span>Settings</span>
                    </NavLink>
                </li>
                
            </ul>

            <div className="mx-auto w-[95%] h-[44px] rounded-full flex items-center justify-center">
                <NavLink className="flex items-center justify-center gap-1 font-[mulish] tracking-wide text-md font-normal bg-red-600 w-full h-full rounded-full text-white">
                    <CgLogOut />
                    <span>Logout</span>
                </NavLink>
            </div>
        </nav>
    </>)
}

export default Sidebar