import { useState } from "react"

import AllOrderContent from "./allOrder.jsx"
import CompleteOrderContent from "./completedOrder.jsx"
import PendingOrderContent from "./pendingOrder.jsx"
import RejectedOrderContent from "./rejectedOrder.jsx"

export default function OrderContent(){
    const orderStatusBtn = [
        {id: 1, Text: "All", onClick: <AllOrderContent  />},
        {id: 2, Text: "Completed", onClick: <CompleteOrderContent />},
        {id: 3, Text: "On Progress", onClick: <PendingOrderContent />},
        {id: 4, Text: "Rejected", onClick: <RejectedOrderContent />},
    ]

    // const [searchInput, setSearchInput] = useState("")
    const [selectedStatus, setSelectedStatus] = useState(orderStatusBtn[0])

    

    return (<>
        <section>
            <h3 className="font-semibold font-[mulish] text-xl uppercase text-[#242427] tracking-wide">Orders</h3>

            <div className="w-full h-[44px]  mt-3 flex items-center justify-between rounded">
                <div className="flex items-center gap-[20px] ml-2 w-auto">
                    {orderStatusBtn.map((btns)=> (
                        <div key={btns.id}>
                            <button className={`w-full h-[40px] px-5 font-[mulish] cursor-pointer text-[#010a80] font-regular text-sm tracking-wide shadow rounded-md ${selectedStatus.id === btns.id ? "bg-blue-500 text-white" : "bg-[#f3f3f3]"}`} onClick={() =>setSelectedStatus(btns)}>{btns.Text}</button>
                        </div>
                    ))}
                </div>
                
            </div>
        </section>

        <section>
            {selectedStatus.onClick}
        </section>
    </>)
}