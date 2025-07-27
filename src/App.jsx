import {Routes, Route} from "react-router-dom";
import ProtectedPage from "./firebase/protectedRoute.jsx";
import SignIn from "./components/signin";
import Overview from "./pages/overviewpage";
import OverviewContent from "./components/overviewContent";
import ProductsPage from "./pages/productspage.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<SignIn />} />

        <Route path="/overview" element={
          <ProtectedPage>
            <Overview />
          </ProtectedPage>
          }>
           <Route index element={<OverviewContent />} />
           <Route path="productpage" element={<ProductsPage/>} />
        </Route>
      </Routes>
    </>
  )
}

export default App
