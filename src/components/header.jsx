import logo from "/logo.png";
import { MdMessage } from "react-icons/md";
import profileImage from "../assets/profile-image.png";
import { userDB, db  } from "../firebase/db.js";
import { useAuth } from "../firebase/authContext";
import { collection, onSnapshot, orderBy, query, doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom"

function Header(){
    const { authUser, loading } = useAuth();
    const [imageUrl, setImageUrl] = useState(profileImage);
    const [userInfo, setUserInfo] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [storeAllMessage, setStoreAllMessage] = useState([]);
   
    
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

    const fetchProfile = async () => {
        if (!authUser) {
            console.warn("No authenticated user");
            return;
        }

        const dbDocRef = doc(db, "adminUsers", authUser.uid);
        const docSnap = await getDoc(dbDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            setUserInfo(data);
        }
    };
    
    useEffect(() => {
        fetchProfile();
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

    


    return(<>
        <header className="w-full h-[10vh] p-2 bg-[#fff] flex items-center justify-between sticky top-0 z-50">
             <div className="flex gap-2 p-0.5 rounded ml-3">
                <div>
                    <p className="text-blue-950 font-bold font-[Montserrat] uppercase tracking-wider text-xl ">scps</p>
                    <p className="font-[lato] text-blue-950 text-xs tracking-wide">SHOE-CLOTH-PEFUME STORE</p>
                </div>
             </div>

             
             <div className="flex items-center gap-4 mr-5">
                <Link to="messagepage" className="p-2 relative flex items-center gap-1 cursor-pointer">
                    <span className="relative"><MdMessage className="cursor-pointer" color="gray" size={24}/></span>

                    <span className="bg-red-500 text-xs font-[mulish] text-white rounded-full p-0.5 w-auto h-auto flex items-center justify-center gap-1 absolute top-0 right-0">{String(unreadCount).padStart("2",0)}</span>
                </Link>



                <Link to="profilepage">
                    <div className="flex items-center gap-2 mr-5">
                    <div className="max-w-[50px] w-full max-h-[50px] h-full rounded-full">
                        <img src={imageUrl} alt="profile picture" className="w-full h-full object-cover rounded-full"/>
                    </div>
                    <div>
                        <p className="font-[lato] text-blue-950 tracking-wide text-sm font-semibold">{userInfo?.name ? userInfo.name.split(" ").slice(0,2).join(" ").toUpperCase() : "Null"}</p>

                        <p className="font-[lato] text-blue-950 tracking-wide text-sm font-semibold">{userInfo?.position ? userInfo.position.toUpperCase() : "Null"} - {userInfo?.role ? userInfo.role.toUpperCase() : "Null"}</p>
                    </div>
                    </div>
                </Link>
             </div>
        </header>
    </>)
}

export default Header