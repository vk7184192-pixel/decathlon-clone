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
} from "react-icons/fi";

import { Link, useNavigate } from "react-router-dom";

import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

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

  useEffect(() => {
    loadUser();

    const handleAuthChange = () => {
      loadUser();
    };

    window.addEventListener("authChanged", handleAuthChange);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    window.dispatchEvent(new Event("authChanged"));

    navigate("/");
  };

  return (
    <header className="navbar">
      {/* ========================================
          LOGO
      ======================================== */}

      <Link to="/" className="navbar-logo">
        <div className="logo-mark">
          <span></span>
        </div>

        <span className="logo-text">DECATHLON</span>
      </Link>

      {/* ========================================
          SEARCH
      ======================================== */}

      <div className="navbar-search">
        <FiSearch className="search-icon" />

        <input type="text" placeholder={'Search for "Surfing Shorts"'} />

        <span className="search-cursor"></span>
      </div>

      {/* ========================================
          RIGHT ACTIONS
      ======================================== */}

      <nav className="navbar-actions">
        {/* ======================================
            ACCOUNT
        ====================================== */}

        <div className="navbar-account">
          <Link
            to={user ? "/profile" : "/login"}
            className="navbar-action account-button"
          >
            <FiUser />

            <span>{user ? "Account" : "Sign In"}</span>
          </Link>

          {/* ACCOUNT DROPDOWN */}

          {user && (
            <div className="account-dropdown">
              <Link to="/profile" className="account-dropdown-item">
                <FiUser />

                <span>My Profile</span>
              </Link>

              <Link to="/orders" className="account-dropdown-item">
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

        {/* ======================================
            MY STORE
        ====================================== */}

        <Link to="/stores" className="navbar-action">
          <FiMapPin />

          <span>My Store</span>
        </Link>

        {/* ======================================
            SUPPORT
        ====================================== */}

        <Link to="/support" className="navbar-action">
          <FiHelpCircle />

          <span>Support</span>
        </Link>

        {/* ======================================
            WISHLIST
        ====================================== */}

        <Link to="/wishlist" className="navbar-action">
          <FiHeart />

          <span>Wishlist</span>
        </Link>

        {/* ======================================
            CART
        ====================================== */}

        <Link to="/cart" className="navbar-action">
          <FiShoppingBag />

          <span>Cart</span>
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
