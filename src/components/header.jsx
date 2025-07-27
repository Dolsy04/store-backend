import logo from "../../public/logo.png";
import { MdMessage } from "react-icons/md";

function Header(){
    return(<>
        <header className="w-full h-[10vh] p-2 bg-blue-950 flex items-center justify-between sticky top-0 z-50">
             <div className="flex gap-2 bg-blue-600 p-0.5 rounded ml-3">
                <div>
                    <img src={logo} width={40} alt="scpc Logo" className="rounded-full"/>
                </div>
                <div>
                    <p className="text-white font-bold font-[Montserrat] tracking-wider text-xl ">scps</p>
                    <p className="font-[lato] text-white text-sm tracking-wide">Dashboard</p>
                </div>
             </div>

             
             <div className="flex items-center gap-8 mr-5">
                <div className="p-2 relative">
                    <MdMessage className="cursor-pointer" color="white" size={24}/>
                    <span className="absolute top-0 right-0 bg-red-500 text-sm font-[mulish] text-white rounded-full w-[20px] h-[20px] flex items-center justify-center">01</span>
                </div>
                <div className="flex items-center gap-2 mr-5">
                    <div>
                        <p className="max-w-[50px] w-full max-h-[50px] h-full bg-blue-600 text-lg text-white font-[Montserrat] rounded-full p-3 flex items-center justify-center font-bold">AD</p>
                    </div>
                    <div>
                        <p className="font-[lato] text-white tracking-wide text-sm">Abdulrahman Dolapo</p>
                        <p className="font-[lato] text-white tracking-wide text-sm">CEO</p>
                    </div>
                </div>
             </div>
        </header>
    </>)
}

export default Header