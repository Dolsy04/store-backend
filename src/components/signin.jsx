import image from "../assets/image-sign.jpg";
import {auth, db} from "../firebase/db.js";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {useNavigate} from "react-router-dom";
import { useState, useEffect } from "react";
import {  toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SignIn(){
    const [emailInput, setEmailInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [isloading, setIsLoading] = useState(false);
    // const [response, setResponse] = useState("");
    const Navigate = useNavigate();

    

    async function handleLogin(e) {
        e.preventDefault();

        const email = emailInput.trim();
        const password = passwordInput.trim();

        if (!email || !password) {
            toast.error("All fields are required");
            return;
        }

    setIsLoading(true);

    try {
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDocRef = doc(db, "adminUsers", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();

                if (userData.role === "Admin") {
                    // ---------- Grant access
                    toast.success("Login Successfully", { position: "top-right", autoClose: 3000 });
                    setEmailInput("");
                    setPasswordInput("");

                    setTimeout(() => {
                        Navigate("/overview");
                    }, 1000);

                } else {
                    //---------- Not admin so sign out and redirect
                    await signOut(auth);
                    toast.error("Access denied. You are not an admin.", { position: "top-right", autoClose: 3000 });
                    window.location.href = "https://scp-shop.vercel.app/"; 
                }
            } else {
                // ----------No Firestore record so block access
                await signOut(auth);
                toast.error("No account record found. Contact admin.", { position: "top-right", autoClose: 3000 });
                window.location.href = "https://scp-shop.vercel.app/"; 
            }

        } catch (error) {
            console.log("Error when trying to login", error.message);
            toast.error(`Error Occurred: ${error.message}`, { position: "top-right", autoClose: 6000 });
        } finally {
            setIsLoading(false);
        }
    }

    
    return(<>
        <section className="w-full h-screen overflow-hidden">
            <div className="flex items-start justify-between w-full h-full lg:relative md:relative relative">
                <div className="relative max-w-[700px] w-full h-full flex flex-col items-center justify-center">
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
                <div className="lg:relative absolute inset-0 -z-50 w-full h-screen">
                    <img src={image} alt="" className="w-full h-full lg:h-auto object-cover"/>
                </div>
            </div>
        </section>
    </>)
}

export default SignIn