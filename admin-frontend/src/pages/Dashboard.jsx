import React, { useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  MdInventory2,
  MdCategory,
  MdShoppingBag,
  MdPeople,
  MdAdd,
  MdArrowForward,
} from "react-icons/md";

import toast from "react-hot-toast";

import api from "../api/axios";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    users: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);

      const [
        productsResponse,
        categoriesResponse,
        ordersResponse,
        usersResponse,
      ] = await Promise.all([
        api.get("/products?admin=true&limit=1"),
        api.get("/categories"),
        api.get("/orders/admin/all"),
        api.get("/auth/admin/users"),
      ]);

      setStats({
        products: productsResponse.data.totalProducts || 0,

        categories: categoriesResponse.data.categories?.length || 0,

        orders: ordersResponse.data.orders?.length || 0,

        users: usersResponse.data.users?.length || 0,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>

          <p>Welcome back to Admin Panel</p>
        </div>
      </div>

      <section className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <MdInventory2 />
          </div>

          <div>
            <p>Total Products</p>

            <h2>{loading ? "..." : stats.products}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <MdCategory />
          </div>

          <div>
            <p>Total Categories</p>

            <h2>{loading ? "..." : stats.categories}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <MdShoppingBag />
          </div>

          <div>
            <p>Total Orders</p>

            <h2>{loading ? "..." : stats.orders}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <MdPeople />
          </div>

          <div>
            <p>Total Users</p>

            <h2>{loading ? "..." : stats.users}</h2>
          </div>
        </div>
      </section>

      <section className="quick-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>

        <div className="quick-grid">
          <button
            type="button"
            className="quick-card"
            onClick={() => navigate("/products/add")}
          >
            <div className="quick-icon">
              <MdAdd />
            </div>

            <h3>Add Product</h3>

            <p>Create a new product</p>
          </button>

          <button
            type="button"
            className="quick-card"
            onClick={() => navigate("/categories/add")}
          >
            <div className="quick-icon">
              <MdAdd />
            </div>

            <h3>Add Category</h3>

            <p>Create a new category</p>
          </button>

          <button
            type="button"
            className="quick-card"
            onClick={() => navigate("/orders")}
          >
            <div className="quick-icon">
              <MdArrowForward />
            </div>

            <h3>View Orders</h3>

            <p>Manage customer orders</p>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
