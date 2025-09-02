import logo from "/logo.png";
import { RxHamburgerMenu } from "react-icons/rx";
import { MdMessage } from "react-icons/md";
import profileImage from "../assets/profile-image.png";
import { userDB, db  } from "../firebase/db.js";
import { useAuth } from "../firebase/authContext";
import { collection, onSnapshot, orderBy, query, doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ResSideBar from "./resHeader.jsx";

function Header(){
    const { authUser, loading } = useAuth();
    const [imageUrl, setImageUrl] = useState(profileImage);
    const [userInfo, setUserInfo] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [storeAllMessage, setStoreAllMessage] = useState([]);
    const [openSidebar, setOpenSidebar] = useState(false)
   
    
    if(loading) return <p className="text-3xl font-extrabold font-[mulish] flex items-center justify-between w-full h-screen text-white">Loading Profile....</p>

    const fetchInboxes =()=>{
        setLoading(true);

        const messageQuery = query(collection(userDB, "MessageDb"),orderBy("timestamp", "desc"))
        const messageSnapShot = onSnapshot(messageQuery, (snapshot)=>{
            const message = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
            setStoreAllMessage(message);
            setLoading(false)
        }, (error)=> {
            setResponseMessage(`Error Occured ${error.message}`)
            setLoading(false);
        })
        return messageSnapShot
    }
    useEffect(()=>{
        const getInboxes = fetchInboxes()
            return()=>{
            getInboxes();
        }
    },[])

    const unreadCount = storeAllMessage.filter(msg => msg.status === "unread").length;

    // const fetchProfile = async () => {
    //     if (!authUser) {
    //         console.warn("No authenticated user");
    //         return;
    //     }

    //     const dbDocRef = doc(db, "adminUsers", authUser.uid);
    //     const docSnap = await getDoc(dbDocRef);

    //     if (docSnap.exists()) {
    //         const data = docSnap.data();
    //         setUserInfo(data);
    //     }
    // };
    

    const fetchProfile = () => {
  if (!authUser) {
    console.warn("No authenticated user");
    return;
  }

  const dbDocRef = doc(db, "adminUsers", authUser.uid);

  // Listen in real-time
    const unsubscribe = onSnapshot(
        dbDocRef,
        (docSnap) => {
        if (docSnap.exists()) {
            setUserInfo(docSnap.data());
        } else {
            console.warn("No profile found for this user");
        }
        },
        (error) => {
        console.error("Error fetching profile:", error);
        }
    );

    return unsubscribe; // so you can clean up in useEffect
    };
    
    useEffect(() => {
        const unsubscribe = fetchProfile();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [authUser]);

    useEffect(() => {
        if (!authUser) return;

        const dbDocRef = doc(db, "adminUsers", authUser.uid);

        const refSnapShot = onSnapshot(dbDocRef, (docSnap) => {
            if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.profileImage) {
                setImageUrl(data.profileImage);
            }
            }
        });

        return () => refSnapShot();
    }, [authUser]);

    const handleSidebar =()=>{
        setOpenSidebar(!openSidebar);
    }


    return(<>
        <header className="w-full h-[10vh] lg:p-2 bg-[#fff]  items-center justify-between sticky top-0 z-50 flex">
             <div className="flex gap-2 p-0.5 rounded ml-3">
                <div className="flex items-center gap-6 lg:gap-0">
                    <RxHamburgerMenu size={24} className="lg:hidden block" onClick={()=>handleSidebar()}/>
                    <div>
                        <p className="text-blue-950 font-bold font-[Montserrat] uppercase tracking-wider text-xl">scps</p>
                        <p className="font-[lato] text-blue-950 text-xs tracking-wide">SHOE-CLOTH-PEFUME STORE</p>
                    </div>
                </div>
             </div>

             
            <div className="flex items-center gap-4 lg:mr-5">
                <Link to="messagepage" className="p-2 relative hidden items-center gap-1 cursor-pointer lg:flex">
                    <span className="relative"><MdMessage className="cursor-pointer lg:text-[24px] text-[24px]" color="gray"/></span>

                    <span className="bg-red-500 text-xs font-[mulish] text-white rounded-full p-0.5 w-auto h-auto flex items-center justify-center gap-1 absolute top-0 right-0">{String(unreadCount).padStart("2",0)}</span>
                </Link>



                <Link to="profilepage">
                    <div className="flex items-center flex-row  gap-2 lg:mr-5">
                    <div className="max-w-[50px] w-full max-h-[50px] h-full rounded-full">
                        <img src={imageUrl} alt="profile picture" className="w-full h-full object-cover rounded-full"/>
                    </div>
                    <div>
                        <p className="font-[lato] text-blue-950 tracking-wide lg:text-sm text-xs font-semibold lg:block hidden">{userInfo?.name ? userInfo.name.split(" ").slice(0,2).join(" ").toUpperCase() : "Null"}</p>

                        <p className="font-[lato] text-blue-950 tracking-wide lg:text-sm text-xs font-semibold lg:block hidden">{userInfo?.position ? userInfo.position.toUpperCase() : "Null"} - {userInfo?.role ? userInfo.role.toUpperCase() : "Null"}</p>
                    </div>
                    </div>
                </Link>
            </div>

            <div className={`w-full h-[100vh] overflow-y-auto fixed top-0 z-50 lg:relative bg-[#000000ab] sidebar-custom-scrollbar block lg:hidden transition-all duration-500 
            ${openSidebar ? "left-0" : "left-[-100%]"}`}> 
                {openSidebar && (
                    <div className={`w-[90%] h-[100vh] overflow-y-auto relative bg-white sidebar-custom-scrollbar block lg:hidden transition-all duration-300 ${openSidebar ? "opacity-100" : "opacity-30"}`}>
                        <ResSideBar closeSidebar={() => setOpenSidebar(false)}/>
                    </div>
                )}
            </div>
        </header>
    </>)
}

export default Header