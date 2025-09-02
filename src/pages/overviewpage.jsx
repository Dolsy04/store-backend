import Header from "../components/header.jsx";
import ResSideBar from "../components/resHeader.jsx";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar.jsx";
import Footer from "../components/footer.jsx";
import { IoClose } from "react-icons/io5";
import { useState, useEffect } from "react";

function Overview(){
    const [responseMessage, setResponseMessage] = useState("");
    const [count, setCount] = useState(0);
    const [visible, setVisible] = useState(false);


    useEffect(()=>{
        if(responseMessage ){
            setCount(7);
            setVisible(true);

            const hideTimer = setTimeout(() => {
                setVisible(false); 
            }, 6500);

            const timer = setTimeout(()=>{
                setResponseMessage("");
            }, 7000);
    
            const countTimer = setInterval(() => {
                setCount(prev => {
                    if(prev <= 1){
                        clearInterval(countTimer);
                        return 0;
                    }
                    return prev - 1;
                });
            },1000);
    
            return () =>{
                clearTimeout(hideTimer);
                clearTimeout(timer)
                clearInterval(countTimer)
            };
        }
    },[responseMessage]);

    const isSuccess = responseMessage.toLowerCase().includes("successfully");
    const isError = responseMessage.toLowerCase().includes("error");

    return(<>
            <Header />
        <div className="flex gap-0 h-[90vh] w-full overflow-hidden bg-[#f5f2f2]">
            <div className="lg:max-w-[300px] w-full lg:h-[90vh] overflow-y-scroll  top-0 left-0 z-50 lg:relative bg-white sidebar-custom-scrollbar hidden lg:block">
                <Sidebar />
            </div>

            <div className="w-full bg-[#f2f2f2] flex flex-col overflow-y-scroll">
                {responseMessage && (
                    <div className={`fixed top-15 left-1/2 -translate-x-1/2 transition-all duration-500 z-[100] w-[320px] text-white bg-blue-600 rounded-xl shadow px-4 py-4 text-center text-sm font-[mulish] ${isSuccess ? "bg-green-600" : ""} ${isError ? "bg-red-600" : ""} ${visible ? "opacity-100 translate-y-0": "opacity-0 -translate-y-5"}`}>
                        <div className="flex flex-col items-center gap-2 relative">
                            <p>{responseMessage}</p>
                            <p className="text-xs text-white/80">Closing in <span className="border-2 border-white rounded-full w-[40px] h-[40px] flex items-center justify-center">{count}s</span></p>
                        </div>
                    </div>
                )}
                <div className="grow px-10 py-10 ">
                    <Outlet context={{setResponseMessage}}/>
                </div>
                <hr className="border border-gray-300 w-[95%] mx-auto"/>
                <Footer />
            </div>
        </div>

    </>)
}

export default Overview