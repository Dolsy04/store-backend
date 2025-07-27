import image from "../assets/image-sign.jpg";
import {auth} from "../firebase/db.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import {useNavigate} from "react-router-dom";
import { useState, useEffect } from "react";

function SignIn(){
    const [emailInput, setEmailInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [isloading, setIsLoading] = useState(false);
    const [response, setResponse] = useState("");
    const [count, setCount] = useState(7);
    const Navigate = useNavigate();

    async function handleLogin(e){
        e.preventDefault();

        const email = emailInput.trim();
        const password = passwordInput.trim();

        if(!email || !password){
            setResponse("All fields are required");
            return;
        }

        setIsLoading(true);
        setResponse("Loading...")

        try{
            await signInWithEmailAndPassword(auth, email, password);
            setResponse("Login Successfully");

            setEmailInput("")
            setPasswordInput("");

            setTimeout(()=>{
                Navigate("/overview")
            },4000)

        }catch (error){
            console.log("Error when trying to login", error.message);
            setResponse(`Error Occured: ${error.message}`);
        }
        finally{
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (response && response !== "Loading...") {
            setCount(7);
            const timer = setTimeout(() => setResponse(""), 7000);
            const countTimer = setInterval(() => {
                setCount(prev => prev - 1);
            },1000);
            return () =>{
                clearTimeout(timer)
                clearInterval(countTimer)
            };
        }
    }, [response]);
    return(<>
        <section className="w-full h-screen overflow-hidden">
            <div className="flex items-start justify-between w-full h-full">
                <div className="relative max-w-[700px] w-full h-full flex flex-col items-center justify-center">
                    <div className={`absolute top-3 right-2 transition-all duration-500 ease-in-out transform ${response ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>
                        <p className="font-bold text-md tracking-wide text-white font-[mulish] bg-red-500 py-2 px-2 rounded text-sm">{count} - {response}</p>
                    </div>
                    <div className="bg-white max-w-[400px] w-full shadow-xl p-2 rounded-md">
                        <h2 className="text-3xl font-bold font-[Montserrat] tracking-wide text-blue-700 px-2 uppercase">Sign In</h2>
                        <p className="font-normal text-sm px-2 text-gray-600 font-[Montserrat] tracking-wide">Welcome back! - Fill in your credentials</p>

                        <div className=" mt-3 w-full">
                            <form onSubmit={handleLogin}>
                                <div className="w-full h-auto">
                                    <label className="font-[lato] text-md text-gray-700 tracking-wide" htmlFor="email">Email</label><br />
                                    <input value={emailInput} onChange={(e)=> setEmailInput(e.target.value)} className="border border-gray-400 outline-hidden rounded-md px-2 font-[lato] tracking-wide text-md text-gray-600 w-full h-[40px] mt-1" type="email" id="email" placeholder="Enter your registered Email" />
                                </div>
                                <div className="w-full h-auto mt-4">
                                    <label className="font-[lato] text-md text-gray-700 tracking-wide" htmlFor="password">Password</label><br />
                                    <input value={passwordInput} onChange={(e)=> setPasswordInput(e.target.value)} className="border border-gray-400 outline-hidden rounded-md px-2 font-[lato] tracking-wide text-md text-gray-600 w-full h-[40px] mt-1" type="password" id="password" placeholder="Enter your registered password" />
                                </div>
                                <div className="mt-5 w-full h-auto flex items-center justify-center rounded-md cursor-pointer">
                                    {isloading ? (<button className="font-[lato] font-normal text-lg text-white w-full h-[40px] bg-blue-500 rounded-md" type="submit" disabled={isloading}>Loggin......</button>): (<button className="font-[lato] font-normal text-lg text-white w-full h-[40px] cursor-pointer  bg-blue-700 rounded-md">Login</button>)}
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