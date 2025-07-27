

function Footer(){
    return(<>
        <div className="flex items-center justify-center flex-col mt-2 py-2">
            <p className="font-bold text-gray-500 text-sm uppercase tracking-wide font-[mulish]">SCPS - Store</p>
            <p className="font-bold text-gray-500 text-sm tracking-wide font-[mulish]">&copy; {new Date().getFullYear()} SCPS - All right reserved.</p>
        </div>
    </>)
}

export default Footer