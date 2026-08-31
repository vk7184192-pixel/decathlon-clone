import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiUser,
  FiMapPin,
  FiHelpCircle,
  FiHeart,
  FiShoppingBag,
  FiShoppingCart,
  FiCreditCard,
  FiAward,
  FiMail,
  FiLogOut,
  FiMenu,
  FiMonitor,
  FiMessageSquare,
} from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const isOrdersPage = location.pathname.startsWith("/account");

  const loadUser = () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("User data error:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  const fetchCartCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const response = await api.get("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const items = response.data.cart?.items || [];
      const count = items.reduce((total, item) => total + (item.quantity || 1), 0);
      setCartCount(count);
    } catch (error) {
      console.error("Navbar Fetch Cart Error:", error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    loadUser();
    fetchCartCount();

    const handleAuthChange = () => {
      loadUser();
      fetchCartCount();
    };

    const handleCartChange = () => {
      fetchCartCount();
    };

    window.addEventListener("authChanged", handleAuthChange);
    window.addEventListener("cartUpdated", handleCartChange);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
      window.removeEventListener("cartUpdated", handleCartChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setCartCount(0);

    window.dispatchEvent(new Event("authChanged"));
    navigate("/");
  };

  return (
    <header className="navbar-wrapper">
      <div className={`navbar ${isOrdersPage ? "orders-navbar" : ""}`}>
        {/* ORDERS PAGE LEFT MENU */}
        {isOrdersPage && (
          <div className="orders-navbar-menu">
            <FiMenu />
            <span>
              ALL
              <br />
              SPORTS
            </span>
          </div>
        )}

        {/* LOGO */}
        <Link to="/" className="navbar-logo">
          <div className="logo-mark">
            <span></span>
          </div>
          <span className="logo-text">DECATHLON</span>
        </Link>

        {/* SEARCH */}
        <div className="navbar-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder={
              isOrdersPage
                ? 'Search for "Cricket Bat"'
                : 'Search for "Surfing Shorts"'
            }
          />
          <span className="search-cursor"></span>
        </div>

        {/* ORDERS PAGE DELIVERY LOCATION */}
        {isOrdersPage && (
          <div className="orders-delivery-location">
            <span>Delivery Location</span>
            <strong>
              174026 <em>CHANGE</em>
            </strong>
          </div>
        )}

        {/* RIGHT ACTIONS */}
        <nav className="navbar-actions">
          {/* ACCOUNT */}
          <div className="navbar-account">
            <Link
              to={user ? "/profile" : "/login"}
              className="navbar-action account-button"
            >
              <FiUser />
              <span>{user ? "Account" : "Sign In"}</span>
            </Link>

            {user && (
              <div className="account-dropdown">
                <Link to="/profile" className="account-dropdown-item">
                  <FiUser />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/account/orders-returns?tab=order-returns"
                  className="account-dropdown-item"
                >
                  <FiShoppingCart />
                  <span>Orders & Returns</span>
                </Link>

                <Link to="/wallet" className="account-dropdown-item">
                  <FiCreditCard />
                  <span>Wallet</span>
                </Link>

                <Link to="/rewards" className="account-dropdown-item">
                  <FiAward />
                  <span>Sporty Rewards</span>
                </Link>

                <Link to="/addresses" className="account-dropdown-item">
                  <FiMail />
                  <span>My Addresses</span>
                </Link>

                <button
                  type="button"
                  className="account-dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* MY STORE */}
          <Link to="/stores" className="navbar-action">
            {isOrdersPage ? <FiMonitor /> : <FiMapPin />}
            <span>My Store</span>
          </Link>

          {/* SUPPORT */}
          <Link to="/support" className="navbar-action">
            {isOrdersPage ? <FiMessageSquare /> : <FiHelpCircle />}
            <span>Support</span>
          </Link>

          {/* WISHLIST */}
          <Link to="/wishlist" className="navbar-action">
            <FiHeart />
            <span>Wishlist</span>
          </Link>

          {/* CART */}
          <Link to="/cart" className="navbar-action">
            <div className="cart-icon-wrapper">
              {isOrdersPage ? <FiShoppingCart /> : <FiShoppingBag />}
              {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
            </div>
            <span>Cart</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
