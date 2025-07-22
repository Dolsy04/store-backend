import image from "../assets/image-sign.jpg"

function SignIn(){
    return(<>
        <section className="w-full h-screen overflow-hidden">
            <div className="flex items-start justify-between w-full h-full">
                <div className="max-w-[700px] w-full h-full flex flex-col items-center justify-center">
                    <div className="bg-white max-w-[400px] w-full shadow-xl p-2 rounded-md">
                        <h2 className="text-3xl font-bold font-[Montserrat] tracking-wide text-blue-700 px-2 uppercase">Sign In</h2>
                        <p className="font-normal text-sm px-2 text-gray-600 font-[Montserrat] tracking-wide">Welcome back! - Fill in your credentials</p>

                        <div className=" mt-3 w-full">
                            <form>
                                <div className="w-full h-auto">
                                    <label className="font-[lato] text-md text-gray-700 tracking-wide" htmlFor="email">Email</label><br />
                                    <input className="border border-gray-400 outline-hidden rounded-md px-2 font-[lato] tracking-wide text-md text-gray-600 w-full h-[40px] mt-1" type="email" id="email" placeholder="Enter your registered Email" />
                                </div>
                                <div className="w-full h-auto mt-4">
                                    <label className="font-[lato] text-md text-gray-700 tracking-wide" htmlFor="password">Password</label><br />
                                    <input className="border border-gray-400 outline-hidden rounded-md px-2 font-[lato] tracking-wide text-md text-gray-600 w-full h-[40px] mt-1" type="password" id="password" placeholder="Enter your registered password" />
                                </div>
                                <div className="mt-5 w-full h-auto flex items-center justify-center bg-blue-700 rounded-md cursor-pointer">
                                    <button className="font-[lato] font-normal text-lg text-white w-full h-[40px] cursor-pointer">Login</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div>
                    <img src={image} alt="" className=""/>
                </div>
            </div>
        </section>
    </>)
}

export default SignIn