import { useState, useEffect } from "react";
import ShownShoeProduct from "./shoeproduct/showshoeproduct.jsx";
import StatisticsOverview from "./productstatistics/productstatistics.jsx";
import AddShoeProduct from "./shoeproduct/addshoeproduct.jsx";

function ShoeProducts(){
    const [isLoading, setIsLoading] = useState(false);
    
    const outletShown = [
        {id: 1, title: "Product Statistics", component: <StatisticsOverview />},
        {id: 2, title: "Add New Product (Shoe)", component: <AddShoeProduct />},
        {id: 3, title: "Avaliable Products", component: <ShownShoeProduct />},
    ]

    const navBtn = [
        {id: 1, title: "Product Statistics", component: <StatisticsOverview />},
        {id: 2, title: "Add New Product (Shoe)", component: <AddShoeProduct />},
        {id: 3, title: "Show Avaliable Product (Shoe)", component: <ShownShoeProduct /> }
    ]

    const [selectedInnerPage, setSelectedInnerPage] = useState(outletShown[0])

    return(<>
        <h3 className="mt-10 font-semibold text-2xl capitalize font-[mulish] text-[#131]">Shoe Product</h3>
        <p className="text-gray-500 text-sm font-[mulish]">Here product are added to database and are publicly on main website and preview are shown here when click on show avaliable product</p>

        <div className="mt-4 flex items-center gap-5">
            {navBtn.map(nav=>(
                <div key={nav.id}>
                    <button onClick={() => setSelectedInnerPage(nav)} className={selectedInnerPage.id === nav.id ? "bg-white border border-gray-300 rounded px-6 py-2 font-[mulish] text-sm shadow" : "bg-blue-600 text-white rounded px-6 py-2 font-[mulish] text-sm cursor-pointer"}>{nav.title}</button>
                </div>
            ))}
        </div>

        <div className="mt-7">
            <p className="mb-2 font-[mulish] tracking-wide text-md text-gray-700">{selectedInnerPage.title}</p>

            <div className="w-full">
                {selectedInnerPage.component}
            </div>
        </div>
    </>)
}

export default ShoeProducts