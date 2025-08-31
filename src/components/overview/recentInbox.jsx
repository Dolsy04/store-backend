import { useState, useEffect } from "react";
import { db, userDB } from "../../firebase/db.js"
import { collection, onSnapshot, orderBy, query, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function RecentInbox(){
    const [totalMessage, setTotalMessage] = useState([]);
    const [isLoading, setLoading] = useState(false);

    const fetchInboxes = () =>{
        setLoading(true);

        const messageQuery = query(collection(userDB, "MessageDb"),orderBy("timestamp", "desc"))
        const messageSnapShot = onSnapshot(messageQuery, (snapshot)=>{
            const message = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
            setTotalMessage(message);
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

    const sliceMessage = totalMessage.slice(0, 4)

    return(
        <>
            <div className="bg-white w-full h-full rounded-lg shadow-xs p-3">
                <div className="mb-4">
                    <h1 className="text-xl font-semibold text-gray-800">Recent Inbox</h1>
                    <Link to="messagepage" className="font-[mulish] font-normal text-sm capitalize text-blue-500 tracking-wide">view inbox</Link>
                </div>

                <div>
                    {isLoading ? (
                        <div>
                            <p>LOADING......</p>
                        </div>
                    ) : totalMessage.length === 0 ? (
                        <div>
                            <p>No Inbox</p>
                        </div>
                    ) : (<div className="overflow-x-auto">
                        <div>
                            {sliceMessage.map((msg) => (
                                <div key={msg.id} className="hover:bg-gray-50 border-b border-gray-300 py-3">
                                    <div className="flex items-start gap-3 w-[80%] h-full">
                                        <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center ${msg.status === "unread" ? "bg-red-600 text-white" : "bg-blue-700 text-white"}`}>
                                            <p className="font-[mulish] font-bold text-sm tracking-wide">{msg.name.split(" ").slice(0, 2).map((word)=>word.charAt(0)).join("").toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <p className="font-[mulish] font-bold text-sm tracking-wide capitalize text-gray-900">{msg.name.length > 12 ? `${msg.name.slice(0,12)}...` : `${msg.name}`}</p>
                                            <p className="font-[mulish] font-normal text-xs tracking-wide text-gray-600">{msg.textMessage.length > 25 ? `${msg.textMessage.slice(0,25)}....` : `${msg.textMessage}`}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>)}
                </div>
            </div> 
        </>
    )
}