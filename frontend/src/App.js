import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import Navbar from "./components/Navbar";
import CategoryNav from "./components/home/CategoryNav";

import Home from "./pages/Home";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import UserVerifyOTP from "./pages/UserVerifyOTP";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>

          {/* HOME */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <CategoryNav />
                <Home />
              </>
            }
          />

          {/* USER LOGIN */}
          <Route
            path="/login"
            element={<UserLogin />}
          />

          {/* USER REGISTER */}
          <Route
            path="/register"
            element={<UserRegister />}
          />

          {/* OTP VERIFICATION */}
          <Route
            path="/verify-otp"
            element={<UserVerifyOTP />}
          />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;