import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  MdDashboard,
  MdInventory2,
  MdCategory,
  MdShoppingBag,
  MdPeople,
  MdImage,
  MdViewModule,
  MdLogout,
  MdMenu,
  MdKeyboardDoubleArrowLeft,
} from "react-icons/md";

import "../styles/AdminLayout.css";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth > 700
  );

  const navigate = useNavigate();
  const location = useLocation();

  const adminUser = JSON.parse(localStorage.getItem("adminUser"));

  const handleNav = (path) => {
    navigate(path);
    if (typeof window !== "undefined" && window.innerWidth <= 700) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    if (typeof window !== "undefined" && window.innerWidth <= 700) {
      setSidebarOpen(false);
    }
    navigate("/");
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 700) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isProductsActive = location.pathname.startsWith("/products");

  const isCategoriesActive = location.pathname.startsWith("/categories");

  const isOrdersActive = location.pathname.startsWith("/orders");

  const isUsersActive = location.pathname.startsWith("/users");

  const isBannersActive = location.pathname.startsWith("/banners");

  const isHomepageSectionsActive =
    location.pathname.startsWith("/homepage-sections");

  return (
    <div
      className={`admin-layout ${
        sidebarOpen ? "sidebar-open" : "sidebar-closed"
      }`}
    >
      {/* MOBILE SCREEN BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className="admin-sidebar">
        <div className="sidebar-header">
          {sidebarOpen && <div className="sidebar-logo">DECATHLON</div>}

          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            {sidebarOpen ? <MdKeyboardDoubleArrowLeft /> : <MdMenu />}
          </button>
        </div>

        <nav className="sidebar-menu">
          {/* DASHBOARD */}

          <button
            type="button"
            className={isActive("/dashboard") ? "active" : ""}
            onClick={() => handleNav("/dashboard")}
          >
            <MdDashboard />

            {sidebarOpen && <span>Dashboard</span>}
          </button>

          {/* PRODUCTS */}

          <button
            type="button"
            className={isProductsActive ? "active" : ""}
            onClick={() => handleNav("/products")}
          >
            <MdInventory2 />

            {sidebarOpen && <span>Products</span>}
          </button>

          {/* CATEGORIES */}

          <button
            type="button"
            className={isCategoriesActive ? "active" : ""}
            onClick={() => handleNav("/categories")}
          >
            <MdCategory />

            {sidebarOpen && <span>Categories</span>}
          </button>

          {/* ORDERS */}

          <button
            type="button"
            className={isOrdersActive ? "active" : ""}
            onClick={() => handleNav("/orders")}
          >
            <MdShoppingBag />

            {sidebarOpen && <span>Orders</span>}
          </button>

          {/* USERS */}

          <button
            type="button"
            className={isUsersActive ? "active" : ""}
            onClick={() => handleNav("/users")}
          >
            <MdPeople />

            {sidebarOpen && <span>Users</span>}
          </button>

          {/* BANNERS */}

          <button
            type="button"
            className={isBannersActive ? "active" : ""}
            onClick={() => handleNav("/banners")}
          >
            <MdImage />

            {sidebarOpen && <span>Banners</span>}
          </button>

          {/* HOMEPAGE SECTIONS */}

          <button
            type="button"
            className={isHomepageSectionsActive ? "active" : ""}
            onClick={() => handleNav("/homepage-sections")}
          >
            <MdViewModule />

            {sidebarOpen && <span>Homepage Sections</span>}
          </button>
        </nav>

        {/* LOGOUT */}

        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          <MdLogout />

          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      <main className="admin-content">
        <header className="admin-topbar">
          {!sidebarOpen && (
            <button
              type="button"
              className="topbar-toggle"
              onClick={() => setSidebarOpen(true)}
              title="Open Sidebar"
            >
              <MdMenu />
            </button>
          )}

          <div className="admin-user">
            <div className="admin-avatar">
              {adminUser?.name?.charAt(0)?.toUpperCase()}
            </div>

            <div className="admin-user-info">
              <strong>{adminUser?.name || "Admin"}</strong>

              <span>{adminUser?.role || "admin"}</span>
            </div>
          </div>
        </header>

        <section className="admin-page-content">{children}</section>
      </main>
    </div>
  );
};

export default AdminLayout;
