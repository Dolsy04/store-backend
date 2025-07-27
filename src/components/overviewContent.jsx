import { IoIosPeople } from "react-icons/io";
import { RiProductHuntFill } from "react-icons/ri";
import { TbBorderSides } from "react-icons/tb";
function OverviewContent(){
    const totalItems = [
        {id:1, title: "Total Order (24h/7d)", number: 29, icon: <TbBorderSides size={25}/>,},
        {id:2, title: "Low Stock", number: 20, icon: <RiProductHuntFill size={25}/>,},
        {id: 3, title: "Total Customer", number: 30, icon: <IoIosPeople size={25}/>,},
    ];


    return(<>
        <section>
            <h2 className="font-[mulish] text-xl font-semibold text-[#00150b] tracking-wide">Dashboard</h2>

            <div className="mt-3">
                <div className="flex items-center justify-between gap-5 w-full">
                    {totalItems.map((item)=>(
                        <div key={item.id} className="bg-white mt-2 rounded-md p-6 max-w-[300px] w-full flex items-center justify-between">
                            <div>
                                <p className="font-semibold font-[mulish] text-md tracking-wide text-[#131313]">{item.title}</p>
                                <p className="font-semibold font-[mulish] text-xl mt-3 tracking-wide text-[#131313]">{item.number}</p>
                            </div>
                            <div className="">
                                {item.icon}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    </>)
}

export default OverviewContent