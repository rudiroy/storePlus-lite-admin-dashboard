import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../components/login/LoginPage";
import OTPPage from "../components/login/OTPPage";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/otp" element={<OTPPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;