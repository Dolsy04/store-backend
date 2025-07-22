import Header from "./header.jsx";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar.jsx";

function Overview(){
    return(<>
            <Header />
        <div className="flex gap-2 max-w-[300px] w-full">
            <Sidebar />
            <div>
                <Outlet />
            </div>
        </div>
    </>)
}

export default Overview