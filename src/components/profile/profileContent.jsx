import { useAuth } from "../../firebase/authContext";
import { db } from "../../firebase/db";
import { doc, getDoc, setDoc } from "firebase/firestore";
import profileImage from "../../assets/profile-image.png";
import { BsImageAlt } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ProfileContent(){
    const { authUser, loading } = useAuth();
    const [imageUrl, setImageUrl] = useState(profileImage);
    const [userInfo, setUserInfo] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isEditLoading, setIsEditLoading] = useState(false);
    const [editData, setEditData] = useState({ name: "", phoneNumber: "", position: "" });
    

    if(loading) return <p className="text-3xl font-extrabold font-[mulish] flex items-center justify-between w-full h-screen text-white">Loading Profile....</p>

     // -----------Uploading profile-image---------
    const handleUploadImage = (e) => {
        const file = e.target.files[0];
        if(!file || !authUser) return;

        if (file.size >= 1048487) {
            toast.error("Image must be smaller than 1MB", {position: "top-center"});
            return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
            const base64String = reader.result;
            setImageUrl(base64String);

            const dbDocRef = doc(db, "adminUsers", authUser.uid);
            await setDoc(dbDocRef, {profileImage: base64String}, {merge: true});
            toast.success("Profile picture set successfully", {position: "top-center"});
        }
        reader.readAsDataURL(file);
    }

    
    // ------------Fetch profile image from DB-----------

    useEffect(() => {
        const fetchProfileImage = async () => {
            const dbDocRef = doc(db, "adminUsers", authUser.uid);
            const docSnap = await getDoc(dbDocRef);
            if(docSnap.exists()) {
                const data = docSnap.data();
                if(data.profileImage){
                    setImageUrl(data.profileImage);
                }
            }
        }
        fetchProfileImage();
    },[authUser])

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

    const handleEditClick = () => {
        setEditData({
            name: userInfo.name || "",
            phoneNumber: userInfo.phoneNumber || "",
            position: userInfo.position || ""
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        setIsEditLoading(true);
        try {
            const dbDocRef = doc(db, "adminUsers", authUser.uid);
            await setDoc(dbDocRef, { 
                name: editData.name, 
                phoneNumber: editData.phoneNumber, 
                position: editData.position 
            }, { merge: true });
            setIsEditLoading(false);
            toast.success("Profile updated successfully", {position: "top-center"});
            setShowEditModal(false);
            fetchProfile();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile", {position: "top-center"});
            setIsEditLoading(false);
        }finally{
            setIsEditLoading(false);
        }
    };

    return (
        <>
            <h1 className="font-semibold font-[mulish] text-2xl uppercase text-[#242427] tracking-wide">my profile</h1>
            <p className="text-sm text-gray-600 mt-2 font-[mulish] font-normal tracking-wide mb-6">View and Edit your profile</p>

            <div className="w-full h-auto  flex items-center justify-center">
                <div className="w-full bg-white p-2 shadow rounded flex items-start justify-start gap-10">
                    <div>
                        <div className="h-[300px] w-[300px] rounded-md">
                            <img src={imageUrl} alt="profile picture" className="h-full w-full border border-gray-300 rounded-md"/>
                        </div>
                        <div className="flex items-center justify-center gap-3 mt-3">
                            <input type="file" accept="image/*" id="profileUpload" className="hidden" onChange={handleUploadImage}/>
                            <label htmlFor="profileUpload" className="p-3 flex items-center justify-center gap-3 text-sm text-gray-700 font-[mulish] font-semibold cursor-pointer border-dashed border-1 border-gray-600 rounded"><BsImageAlt /> Upload Profile</label>

                            <button onClick={handleEditClick} className="p-3 flex items-center justify-center gap-3 text-sm text-gray-700 font-[mulish] font-semibold cursor-pointer border-dashed border-1 border-gray-600 rounded"><MdEdit className=""/> Edit Profile</button>
                        </div>
                    </div>

                    <div>
                        <div className="my-3">
                            <p className="font-semibold font-[mulish] text-sm tracking-wide text-[#0f003ff7]">Name:</p>
                            <p className="font-semibold font-[lato] text-base text-gray-600 tracking-wide">{userInfo.name}</p>
                        </div>
                        <div className="my-3">
                            <p className="font-semibold font-[mulish] text-sm tracking-wide text-[#0f003ff7]">Email:</p>
                            <p className="font-semibold font-[lato] text-base text-gray-600 tracking-wide">{userInfo.email}</p>
                        </div>
                        <div className="my-3">
                            <p className="font-semibold font-[mulish] tracking-wide text-sm text-[#0f003ff7]">Phone Number:</p>
                            <p className="font-semibold font-[lato] text-base text-gray-600 tracking-wide">{userInfo.phoneNumber}</p>
                        </div>
                        <div className="my-3">
                            <p className="font-semibold font-[mulish] tracking-wide text-sm text-[#0f003ff7]">Position:</p>
                            <p className="font-semibold font-[lato] text-base text-gray-600 tracking-wide">{userInfo.position}</p>
                        </div>
                        <div className="my-3">
                            <p className="font-semibold font-[mulish] text-sm tracking-wide text-[#0f003ff7]">Role:</p>
                            <p className="font-semibold font-[lato] text-base text-gray-600 tracking-wide">{userInfo.role}</p>
                        </div>
                    </div>
                </div>
            </div>



            {/* ---- Edit Modal ---- */}
            {showEditModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-[#000000c9] z-50">
                    <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Edit Profile</h2>
                            <button className="cursor-pointer" onClick={() => setShowEditModal(false)}><IoClose size={24}/></button>
                        </div>

                        <div>
                            <label className="font-[mulish] font-normal text-sm tracking-wide">Full Name</label>
                            <input type="text" value={editData.name} onChange={(e)=>setEditData({...editData, name: e.target.value})} placeholder="Full Name" className="w-full mb-3 p-2 border-2 rounded border-gray-200 outline-0 font-[mulish] font-normal text-base tracking-wide"/>
                        </div>
                        <div>
                            <label className="font-[mulish] font-normal text-sm tracking-wide">Phone Number</label>
                            <input type="text" value={editData.phoneNumber} onChange={(e)=>setEditData({...editData, phoneNumber: e.target.value})}
                            placeholder="Phone Number" className="w-full mb-3 p-2 border-2 rounded border-gray-200 outline-0 font-[mulish] font-normal text-base tracking-wide"/>
                        </div>
                        <div>
                            <label className="font-[mulish] font-normal text-sm tracking-wide">Position</label>
                            <input type="text" value={editData.position} 
                            onChange={(e)=>setEditData({...editData, position: e.target.value})}
                            placeholder="Position" className="w-full mb-3 p-2 border-2 rounded border-gray-200 outline-0 font-[mulish] font-normal text-base tracking-wide"/>
                        </div>
                        <button onClick={handleSaveEdit} disabled={isEditLoading} className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 ${isEditLoading ? "bg-blue-300" : "bg-blue-600"}`}>{isEditLoading ? (
                            <div className="flex items-center justify-center gap-1">
                                <span className="font-normal text-sm font-[mulish]">Loading...</span>
                                <div className="w-4 h-4 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
                            </div>
                        ) :"Save Changes"}</button>
                    </div>
                </div>
            )}
        </>
    )
}