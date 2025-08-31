import {Routes, Route} from "react-router-dom";
import ProtectedPage from "./firebase/protectedRoute.jsx";
import SignIn from "./components/signin";
import Overview from "./pages/overviewpage";
import OverviewContent from "./components/overview/overviewContent.jsx";
import ProductsPage from "./pages/productspage.jsx";
import OrderPage from "./pages/orderPage.jsx";
import InvoicePage from "./pages/invoicePage.jsx";
import MessagePage from "./pages/messagePage.jsx";
import UserMangerPage from "./pages/userMangerPage.jsx";
import ProfilePage from "./pages/profilePage.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<SignIn />} />

        <Route path="/overview" element={
          <ProtectedPage requiredRole="Admin">
            <Overview />
          </ProtectedPage>
          }>
           <Route index element={<OverviewContent />} />
           <Route path="productpage" element={<ProductsPage/>} />
           <Route path="orderpage" element={<OrderPage />}/>
           <Route path="invoicepage" element={<InvoicePage />}/>
           <Route path="messagepage" element={<MessagePage />}/>
           <Route path="userMangerpage" element={<UserMangerPage />}/>
           <Route path="profilepage" element={<ProfilePage />}/>
        </Route>
      </Routes>


       <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  )
}

export default App
