import {Navigate} from "react-router-dom";
import {useAuth} from "./authContext.jsx"


function ProtectedPage({children, requiredRole}){
    const {authUser, userRole, loading} = useAuth();

    if(loading) return <p className="text-3xl font-extrabold font-[mulish] flex items-center justify-between w-full h-screen text-white">Loading......</p>

    if(!authUser){
        return <Navigate to="/"/>
    }

    if (requiredRole && userRole !== requiredRole) {
        return <Navigate to="/" />;
    }
    return children;
}

export default ProtectedPage;