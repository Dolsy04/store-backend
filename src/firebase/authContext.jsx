import {createContext, useContext, useEffect, useState} from "react"
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./db.js";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({children}){
    const [authUser, setAuthUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    useEffect(()=>{
        const notLoggedIn = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setAuthUser(user);

                try {
                // Fetch user doc from Firestore
                const userDocRef = doc(db, "adminUsers", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    setUserRole(userDocSnap.data().role || "user");
                } else {
                    setUserRole("user");
                }
                } catch (error) {
                console.error("Error fetching user role:", error);
                setUserRole("user");
                }
            } else {
                setAuthUser(null);
                setUserRole(null);
            }
            setLoading(false);
            });

        return ()=> notLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{authUser, userRole, loading}}>
            {!loading && children}
        </AuthContext.Provider>
    );
}


export function useAuth(){
    const context = useContext(AuthContext);
     if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}