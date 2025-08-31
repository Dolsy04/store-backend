import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/db.js"; 
import { collection, setDoc, onSnapshot, orderBy, query, updateDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";

export default function UserMangerContent() {
  const [users, setUsers] = useState([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("Admin");
  const [position, setPosition] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users from Firestore
  const fetchUsers = () => {
    const adminUserQuery = query(collection(db, "adminUsers"), orderBy("createdAt", "desc"))
    const adminUsersSnapshot = onSnapshot(adminUserQuery, (snapShot)=> {
        const usersData = snapShot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
        setUsers(usersData);
    }, (error)=>{
        toast.error(error, {position: "top-center", autoClose: 2000});
        console.log(error);
    })
    return adminUsersSnapshot
  };

  useEffect(() => {
    const getInboxes = fetchUsers()
    return()=>{
        getInboxes();
    }
  }, []);

  // Delete user
    const handleDelete = async (id) => {
        try {
            await updateDoc(doc(db, "adminUsers", id), {
            role: "Not Admin",
            });
            toast.success("User access revoked!", { position: "top-center", autoClose: 2000 });
        } catch (error) {
            toast.error("Failed to revoke access", { position: "top-center", autoClose: 2000 });
            console.error("Error updating role: ", error);
        }
    };
    
    // Reset password
    const handleReset = async (id) => {
        try {
            const user = users.find((u) => u.id === id); // find user by uid
            if (!user || !user.email) {
                toast.error("User email not found!", { position: "top-center", autoClose: 2000 });
                return;
            }

            await sendPasswordResetEmail(auth, user.email);
            toast.success("Password reset email sent!", { position: "top-center", autoClose: 2000 });
        } catch (error) {
            toast.error("Failed to send reset link", { position: "top-center", autoClose: 2000 });
            console.error("Error sending reset email: ", error);
        }
    };




  // Add Admin
    const handleAddAdmin = async (e) => {
        e.preventDefault();

        if(!fullName.trim() || !email.trim() || !phoneNumber.trim() || !role.trim() || !password.trim() || !position.trim()) {
            toast.error("All field are required", {position: "top-center", autoClose: 2000});
            return;
        }

        setIsLoading(true);

        try{
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;

            await setDoc(doc(db, "adminUsers", newUser.uid),{
                id: newUser.uid,
                name: fullName,
                email: email,
                phoneNumber: phoneNumber,
                role: role,
                position: position,
                profileImage: "",
                createdAt: new Date().toISOString(),
            })

            toast.success("Account Created Successfully", {position: "top-center", autoClose: 2000});
            setFullName("");
            setEmail("");
            setPhoneNumber("");
            setRole("Admin");
            setPosition("");
            setPassword("");

        }catch(error){
        let errorMsg = "Something went wrong!";
            if(error.code === "auth/email-already-in-use") {
                errorMsg = "This email is already registered!";
            } else if(error.code === "auth/weak-password") {
                errorMsg = "Password should be at least 6 characters.";
            }
            toast.error(errorMsg, {position: "top-center", autoClose: 2000});
            setIsLoading(false);
        }finally{
            setIsLoading(false);
        }

        setShowAddAdmin(false);
        fetchUsers();
    };

  return (
    <div className="p-6">
      <h2 className="font-semibold font-[mulish] text-2xl uppercase text-[#242427] tracking-wide">Manage Users</h2>
      <p className="text-sm text-gray-600 mt-2 font-[mulish] font-normal tracking-wide mb-6">Create, Read and Delete user</p>
      <button
        onClick={() => setShowAddAdmin(!showAddAdmin)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded font-[mulish] cursor-pointer">{showAddAdmin ? "Cancel" : "Add Admin"}</button>

      {/* Add Admin Form */}
      <div className={`w-full h-screen fixed top-0 bg-[#000000ab] z-50 transition-all duration-300 ${showAddAdmin ? "right-0" : "right-[-100%]"}`}>
        {showAddAdmin && (<div className="relative w-full h-screen">
            <form
            onSubmit={handleAddAdmin}
            className="pb-10 bg-gray-100 rounded shadow-md absolute right-0 w-[450px] h-full overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-4 bg-white shadow sticky top-0">
                <h2 className="font-[mulish] text-xl font-semibold text-blue-600 capitalize">Add new Admin</h2>
                <IoClose onClick={()=>setShowAddAdmin(false)} size={20} className="w-[30px] h-[30px] shadow text-red-600 cursor-pointer"/>
            </div>
            
            <div className="mt-4 p-3 w-full">
                <div className="">
                    <label className="font-[mulish] font-normal text-sm tracking">Full Name</label><br />
                    <input value={fullName} onChange={(e)=>setFullName(e.target.value)} className="border-2 border-gray-300 focus:border-blue-600 outline-none w-full h-[40px] rounded-md px-3 font-[mulish] text-sm font-normal" type="text" placeholder="John Doe"/>
                </div>
                <div className="mt-3">
                    <label className="font-[mulish] font-normal text-sm tracking">Email</label><br />
                    <input value={email} onChange={(e)=>setEmail(e.target.value)} className="border-2 border-gray-300 focus:border-blue-600 outline-none w-full h-[40px] rounded-md px-3 font-[mulish] text-sm font-normal" type="email" placeholder="johndoe@gmail.com"/>
                </div>
                <div className="mt-3">
                    <label className="font-[mulish] font-normal text-sm tracking">Phone Number</label><br />
                    <input value={phoneNumber} onChange={(e)=>setPhoneNumber(e.target.value)} className="border-2 border-gray-300 focus:border-blue-600 outline-none w-full h-[40px] rounded-md px-3 font-[mulish] text-sm font-normal" type="tel" placeholder="123456789"/>
                </div>
                <div className="mt-3">
                    <label className="font-[mulish] font-normal text-sm tracking">Role</label><br />
                    <input value={role} onChange={(e)=>setRole(e.target.value)} className="border-2 border-gray-300 focus:border-blue-600 outline-none w-full h-[40px] rounded-md px-3 font-[mulish] text-sm font-normal" type="text" placeholder="Admin"/>
                </div>
                <div className="mt-3">
                    <label className="font-[mulish] font-normal text-sm tracking">Position</label><br />
                    <input value={position} onChange={(e)=>setPosition(e.target.value)} className="border-2 border-gray-300 focus:border-blue-600 outline-none w-full h-[40px] rounded-md px-3 font-[mulish] text-sm font-normal" type="text" placeholder="Accountant"/>
                </div>
                <div className="mt-3">
                    <label className="font-[mulish] font-normal text-sm tracking">Password</label><br />
                    <input value={password} onChange={(e)=>setPassword(e.target.value)} className="border-2 border-gray-300 focus:border-blue-600 outline-none w-full h-[40px] rounded-md px-3 font-[mulish] text-sm font-normal" type="Password" placeholder="password"/>
                </div>
            </div>

            <button disabled={isLoading} type="submit" className={`px-4 py-2 ml-3 text-white rounded ${isLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 cursor-pointer"}`}>{isLoading ? (<div className="flex items-center justify-center gap-1">
                    <span className="font-[mulish] font-normal text-sm tracking-wide">Loading..</span> 
                    <div className="w-6 h-6 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
                </div>) : "Save Admin"}</button>
            </form>
        </div>)}
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-b">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 font-[mulish] text-sm font-normal text-gray-600 border-b border-b-gray-400">Name</th>
              <th className="p-2 font-[mulish] text-sm font-normal text-gray-600 border-b border-b-gray-400">Email</th>
              <th className="p-2 font-[mulish] text-sm font-normal text-gray-600 border-b border-b-gray-400">Phone</th>
              <th className="p-2 font-[mulish] text-sm font-normal text-gray-600 border-b border-b-gray-400">Position</th>
              <th className="p-2 font-[mulish] text-sm font-normal text-gray-600 border-b border-b-gray-400">Role</th>
              <th className="p-2 font-[mulish] text-sm font-normal text-gray-600 border-b border-b-gray-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="">
                <td className="px-0.5 py-3 border-b border-gray-300 text-sm font-[mulish] font-normal text-gray-600">{u.name}</td>
                <td className="px-0.5 py-3 border-b border-gray-300 text-sm font-[mulish] font-normal text-gray-600">{u.email}</td>
                <td className="px-0.5 py-3 border-b border-gray-300 text-sm font-[mulish] font-normal text-gray-600 text-center">{u.phoneNumber}</td>
                <td className="px-0.5 py-3 border-b border-gray-300 text-sm font-[mulish] font-normal text-gray-600 text-center">{u.position}</td>
                <td className="px-0.5 py-3 border-b border-gray-300 text-sm font-[mulish] font-normal text-gray-600">{u.role}</td>
                <td className="px-0.5 py-3 border-b border-gray-300 text-sm font-[mulish] font-normal text-gray-600 flex items-center justify-center gap-2">
                  <button onClick={() => handleReset(u.id)} className="px-3 py-1 bg-blue-600 text-white rounded cursor-pointer">Reset</button>
                  <button onClick={() => handleDelete(u.id)} className="px-3 py-1 bg-red-600 text-white rounded cursor-pointer">Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
