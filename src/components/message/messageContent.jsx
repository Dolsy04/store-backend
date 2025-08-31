import { IoSearch, IoCheckmarkDoneOutline, IoClose} from "react-icons/io5";
import { IoIosSend } from "react-icons/io";
import { MdOutlineNavigateNext, MdMessage } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";
import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { userDB } from "../../firebase/db.js";
import { collection, onSnapshot, orderBy, query, updateDoc, doc, arrayUnion } from "firebase/firestore";
import emailjs from "emailjs-com";

export default function MessageContent(){
    const [search, setSearch] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [storeFilterMessage, setStoreFilterMessage] = useState([]);
    const [storeAllMessage, setStoreAllMessage] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterType, setFilterType] = useState("all");
    const { setResponseMessage } = useOutletContext();
    const [selectedMessage, setSeletedMessage] = useState(null)
    const [reply, setReply] = useState("");

    const fetchInboxes =()=>{
        setLoading(true);

        const messageQuery = query(collection(userDB, "MessageDb"),orderBy("timestamp", "desc"))
        const messageSnapShot = onSnapshot(messageQuery, (snapshot)=>{
            const message = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
            setStoreFilterMessage(message);
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

    useEffect(()=>{
        let filtered = [...storeAllMessage];


        if (filterType !== "all") {
            filtered = filtered.filter(msg => msg.status === filterType);
        }

        if(search.trim()){
                filtered = filtered.filter(item => 
                    item.name?.toLowerCase().includes(search.toLowerCase()) || 
                    item.email?.toLowerCase().includes(search.toLowerCase()) || 
                    item.textMessage?.toLowerCase().includes(search.toLowerCase()))
        }
        setStoreFilterMessage(filtered);
        setCurrentPage(1);
    }, [storeAllMessage, search, filterType])

    const readCount = storeAllMessage.filter(msg => msg.status === "read").length;
    const unreadCount = storeAllMessage.filter(msg => msg.status === "unread").length;

    const filterMessages = (type) => {
        if (type === "all") {
            setStoreFilterMessage(storeAllMessage);
        } else {
            const filtered = storeAllMessage.filter(msg => msg.status === type);
            setStoreFilterMessage(filtered);
        }
        setFilterType(type);
        setCurrentPage(1);
    }
    const paginatedPage = storeFilterMessage.slice((currentPage - 1) * 5, currentPage * 5)
    const pageNUmber = Math.ceil(storeAllMessage.length / 5)

    const sendReply = async (e) => {
        e.preventDefault();

        if (!reply.trim()){ 
            setResponseMessage("Input is empty! fill in input to send mail")
            return;
        }

            setLoading(true)

            const templateParams = {
                client_email: selectedMessage.email,  // 👈 send to the email stored in DB
                client_name: selectedMessage.name,
                team_message: reply,
                from_name: "SCP-STORE TEAM",
            };

        try {
            const result = await emailjs.send(
            import.meta.env.VITE_EMAIL_SERVICE_ID,
            import.meta.env.VITE_EMAIL_TEMPLATE_ID,
            templateParams,
            import.meta.env.VITE_EMAIL_PUBLIC_KEY
            );

            const msgRef = doc(userDB, "MessageDb", selectedMessage.id);
            const newReply = {
                text: reply,
                repliedAt: new Date(),
            };

            await updateDoc(msgRef, {
                adminResponses: arrayUnion(newReply),
                adminStatus: "replied",
            });

            // Update local state immediately---------------
            setSeletedMessage((prev) => ({
                ...prev,
                adminStatus: "replied",
                adminResponses: prev.adminResponses
                    ? [...prev.adminResponses, newReply]
                    : [newReply],
            }));

            console.log("✅ Reply sent:", result.text);
            setResponseMessage("Reply sent successfully!");
            setReply("");
            setLoading(false)
        } catch (error) {
            console.error("❌ Error:", error.text);
            setResponseMessage("Failed to send reply.");
            setLoading(false)
        }finally{
            setLoading(false)
        }
    };

    const getDetailsToMailBox = async (msg) =>{
        setSeletedMessage(msg);
        if (msg.status === "unread") {
            try {
                const msgRef = doc(userDB, "MessageDb", msg.id);
                await updateDoc(msgRef, { status: "read" });
                setSeletedMessage(prev => ({ ...prev, status: "read" }));
            } catch (error) {
                console.error("Error marking as read:", error);
                setResponseMessage("Error marking as read:", error)
            }
        }
    }

    return (<>
        <section className="w-full">
            <div className="flex items-start justify-between gap-5 w-full ">

                <div className="w-[50%] h-[400px]">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold font-[mulish] text-2xl uppercase text-[#242427] tracking-wide">Inbox</h3>
                        <div className="flex items-center gap-3">
                            <button onClick={() => filterMessages("all")} className={`border-1 border-gray-600 px-4 py-1 rounded-md cursor-pointer text-sm font-[mulish] font-normal ${filterType === "all" ? "bg-gray-300 border-none" : ""}`}>All ({String(storeAllMessage.length).padStart("2",0)})</button>
                            <button onClick={() => filterMessages("read")} className={`border-1 border-gray-600 px-4 py-1 rounded-md cursor-pointer text-sm font-[mulish] font-normal ${filterType === "read" ? "bg-gray-300 border-none" : ""}`}>Read ({String(readCount).padStart(2, "0")})</button>
                            <button onClick={() => filterMessages("unread")} className={`border-1 border-gray-600 cursor-pointer px-4 py-1 rounded-md text-sm font-[mulish] font-normal ${filterType === "unread" ? "bg-gray-300 border-none" : ""}`}>Unread ({String(unreadCount).padStart(2, "0")})</button>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 w-full border-2 border-gray-500 h-[44px] px-2 rounded-xl font-[mulish] font-normal">
                        <IoSearch size={15} className="text-gray-500"/>
                        <input type="search" value={search} onChange={(e)=> setSearch(e.target.value)} placeholder="Search by email or name...." className="w-full h-full border-0 outline-0 font-[mulish] text-sm"/>
                    </div>

                    {/* display messages */}
                    <div className="w-full h-full overflow-hidden py-3">
                        <div className="w-full h-full overflow-x-auto">
                            {isLoading ? (<div className="w-full h-full flex items-center justify-center border">
                                <p className="loader"></p>
                            </div>): storeAllMessage.length === 0 ? (<p className="w-full h-full flex items-center justify-center">
                                <span className="text-base font-[mulish] font-semibold text-red-600">No message avaliable</span>
                            </p>) : search.trim() && storeFilterMessage.length === 0 ? (<p className="w-full h-full flex items-center justify-center">
                                <span className="text-base font-[mulish] font-semibold text-red-600">No Result for your search</span>
                            </p>) : (<div>
                                {paginatedPage.map((msg)=> (<div key={msg.id}>
                                    <div className="bg-[#f3f3f3] w-full p-2 rounded-md mt-2" onClick={()=> {getDetailsToMailBox(msg)}}>
                                        <div className="flex items-center justify-between">
                                            {/* for name and profile name */}
                                            <div className="flex items-start gap-3 w-[80%] h-full">
                                                <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center ${msg.status === "unread" ? "bg-red-600 text-white" : "bg-blue-700 text-white"}`}>
                                                    <p className="font-[mulish] font-bold text-sm tracking-wide">{msg.name.split(" ").slice(0, 2).map((word)=>word.charAt(0)).join("").toUpperCase()}</p>
                                                </div>
                                                <div>
                                                    <p className="font-[mulish] font-bold text-sm tracking-wide capitalize text-gray-900">{msg.name.length > 12 ? `${msg.name.slice(0,12)}...` : `${msg.name}`}</p>
                                                    <p className="font-[mulish] font-normal text-xs tracking-wide text-gray-600">{msg.textMessage.length > 25 ? `${msg.textMessage.slice(0,25)}....` : `${msg.textMessage}`}</p>
                                                </div>
                                            </div>
                                            {/* for date, time and status */}
                                            <div className="w-[20%] flex items-end justify-end flex-col">
                                                <p className="text-xs text-right font-[mulish] font-normal text-gray-600">{msg.timestamp?.toDate().toLocaleTimeString()}</p>
                                                <p className="text-xs text-right font-[mulish] font-normal text-gray-600">{msg.timestamp?.toDate().toLocaleDateString()}</p>
                                                <p>{msg.status === "unread" ? (<span className="w-[10px] h-[10px] bg-red-600 mt-2 mr-2 rounded-full"></span>) : msg.status === "read" ? (<span className="flex items-center gap-1">
                                                    <IoCheckmarkDoneOutline color="blue" size={15}/>
                                                    <span className="text-blue-600 text-xs lowercase font-[mulish] font-normal">Read</span>
                                                </span>) : ""}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>))}

                                
                                <div className="my-5 flex justify-between items-center px-2">
                                    <div className="flex items-center gap-4">
                                        <button disabled={currentPage === 1} className={`flex items-center gap-1 font-[mulish] font-normal text-sm bg-[#f3f3f3] shadow-md rounded-md py-2 px-2 ${currentPage === 1 ? "cursor-not-allowed" : "cursor-pointer"}`} onClick={() => setCurrentPage((prev) => prev - 1)}>
                                            <GrFormPrevious />
                                            <span>Previous</span>
                                        </button>
                                        <button disabled={currentPage === pageNUmber} className={`flex items-center gap-1 font-[mulish] font-normal text-sm bg-[#f3f3f3] shadow-md rounded-md py-2 px-2  ${currentPage === pageNUmber ? "cursor-not-allowed" : "cursor-pointer"}`} onClick={() => setCurrentPage((prev) => prev + 1)}>
                                            <span>Next</span>
                                            <MdOutlineNavigateNext />
                                        </button>
                                    </div>

                                    <div>
                                            <p className="font-normal font-[mulish] text-gray-500 text-sm">Page {currentPage} of {pageNUmber}</p>
                                    </div>
                                </div>
                            </div>)}
                        </div>
                    </div>
                </div>


                {/* send mail */}
                <div className="w-[50%] h-[450px] overflow-hidden bg-gray-200 rounded-md relative">
                    {selectedMessage ? (<div>
                            {/* header------- */}

                            <div className="bg-white w-full h-auto rounded-t-md shadow flex items-center justify-between p-2">
                                <div className="flex items-start gap-3 w-[80%] h-full">
                                    <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center ${selectedMessage.status === "unread" ? "bg-red-600 text-white" : "bg-blue-700 text-white"}`}>
                                        <p className="font-[mulish] font-bold text-sm tracking-wide">{selectedMessage.name.split(" ").slice(0,2).map((word)=>word.charAt(0)).join("").toUpperCase()}</p>
                                    </div>
                                    <div>
                                        <p className="font-[mulish] font-bold text-sm tracking-wide capitalize text-gray-900">{selectedMessage.name.length >  20 ? `${selectedMessage.name.slice(0, 20)}...` : `${selectedMessage.name}`}</p>
                                        <p className="font-[mulish] font-normal text-xs tracking-wide text-gray-600">{selectedMessage.email.length > 50 ? `${selectedMessage.email.slice(0,50)}....` : `${selectedMessage.email}`}</p>
                                    </div>
                                </div>
                                <IoClose className="text-red-700 cursor-pointer mr-3" size={20} onClick={()=>setSeletedMessage(null)}/>
                            </div>

                        <div className="w-full h-[300px] overflow-y-auto message-custom-scrollbar pl-2">
                            <div className="max-w-[350px] w-full my-4">
                                <div className="mt-2 w-full bg-gray-500 text-white p-1 rounded-md">
                                    <p className="text-sm font-[mulish] font-normal tracking-wide">{selectedMessage.textMessage}</p>
                                <div className="w-full flex items-end justify-end flex-col mt-2">
                                    <p className="text-xs text-right font-[mulish] font-normal text-white">
                                    {selectedMessage.timestamp?.toDate().toLocaleTimeString()} - {selectedMessage.timestamp?.toDate().toLocaleDateString()}
                                    </p>
                                    <p>
                                        {selectedMessage.status === "unread" ? (
                                            <p className="w-[10px] h-[10px] bg-red-600 mt-2 mr-2 rounded-full"></p>
                                        ) : selectedMessage.status === "read" ? (
                                            <div className="flex items-center gap-1">
                                            <IoCheckmarkDoneOutline color="white" size={15}/>
                                            <span className="text-white text-xs lowercase font-[mulish] font-normal">Read</span>
                                            </div>
                                        ) : ""}
                                    </p>
                                </div>
                                </div>
                            </div>

                            <hr />
                            {/* outgoing message - moved to right */}
                            
                            <div className="pr-3 flex flex-col justify-end items-end self-end">
                            <div className="mt-3 w-[350px]">
                                {/* <h3 className="font-semibold font-[mulish] text-sm text-gray-500">Admin Replies:</h3> */}
                                {selectedMessage?.adminResponses?.map((res, i) => (
                                    <div key={i} className="p-2 my-1 rounded bg-gray-100">
                                    <p className="font-[mulish] text-sm font-normal">{res.text}</p>
                                    <small className="text-xs text-gray-800 flex items-center justify-end">
                                        {new Date(res.repliedAt.seconds ? res.repliedAt.seconds * 1000 : res.repliedAt).toLocaleString()}
                                    </small>
                                    <p className="flex items-center justify-end">
                                        <IoCheckmarkDoneOutline color="gray"/>
                                        <span className="text-gray-800 text-sm">{selectedMessage.adminStatus}</span>
                                    </p>
                                    </div>
                                ))}
                            </div>

                            </div>

                            {/* mail sender-------------- */}
                            <form onSubmit={sendReply} className="absolute bottom-0 left-0 flex items-center w-full gap-2 flex-1 border border-gray-300 outline-none p-2 font-[mulish] text-sm resize-none focus:ring-2 focus:ring-blue-500">
                                <textarea value={reply} onChange={(e)=> setReply(e.target.value)} className="border-1 border-gray-500 rounded outline-0 px-3 py-2 font-[mulish] text-sm w-[95%] h-full resize-none message-custom-scrollbar"></textarea>
                                <button disabled={isLoading} type="submit" className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition cursor-pointer">
                                    {isLoading ? (<div className="w-10 h-10 border-4 border-t-white border-gray-300 rounded-full animate-spin" />) : (<IoIosSend size={22} />)}
                                </button>
                            </form>

                        </div>
                    </div>) : (<div className="w-full h-full flex items-center justify-center">
                        <p className="w-[80%] mx-auto flex items-center justify-center flex-col">
                            <MdMessage className="text-gray-500 mb-5" size={40}/>
                            <span className="font-[mulish] text-sm font-semibold text-gray-500 text-center">View clicked message and able to reply to there mail directly by sending mail trough text box below.</span>
                        </p>
                    </div>)}
                </div>
            </div>
        </section>
    </>)
}



