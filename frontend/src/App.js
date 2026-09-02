import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./App.css";

import Navbar from "./components/Navbar";
import CategoryNav from "./components/home/CategoryNav";

import Home from "./pages/Home";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import UserVerifyOTP from "./pages/UserVerifyOTP";
import Cart from "./pages/Cart";
import Delivery from "./pages/Delivery";
import Payment from "./pages/Payment";
import OrderSuccess from "./pages/OrderSuccess";
import Profile from "./pages/Profile";
import MyAccount from "./pages/MyAccount";
import Wishlist from "./pages/Wishlist";
import CategoryRoutes from "./routes/categoryRoutes";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
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

          {CategoryRoutes}

          <Route path="/login" element={<UserLogin />} />

          <Route path="/register" element={<UserRegister />} />

          <Route path="/verify-otp" element={<UserVerifyOTP />} />

          <Route path="/cart" element={<Cart />} />

          <Route path="/wishlist" element={<Wishlist />} />

          <Route path="/checkout/cart/delivery" element={<Delivery />} />

          <Route path="/payment/:orderId" element={<Payment />} />

          <Route path="/order-success/:orderId" element={<OrderSuccess />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/account" element={<MyAccount />} />

          <Route path="/account/orders-returns" element={<MyAccount />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2000,
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
