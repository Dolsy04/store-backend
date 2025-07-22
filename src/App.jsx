import SignIn from "./components/signin";
import Overview from "./components/overview";
import OverviewContent from "./components/overviewContent";
import {Routes, Route} from "react-router-dom";

function App() {
  return (
    <>
      <Overview />

      <Routes>
        <Route path="/" element={<SignIn />} />

        <Route path="" element={<Overview />}>
           <Route index element={<OverviewContent />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
