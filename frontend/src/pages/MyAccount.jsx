import React, { useCallback, useEffect, useState } from "react";
import {
  FiChevronRight,
  FiBox,
  FiUser,
  FiMapPin,
  FiPower,
  FiCreditCard,
  FiTarget,
  FiSliders,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../api/axios";
import Navbar from "../components/Navbar";
import AddressDrawer from "../components/AddressDrawer";
import "../styles/MyAccount.css";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

const formatPrice = (price) => {
  return `₹${Number(price || 0).toLocaleString("en-IN")}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getImageUrl = (image) => {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return `http://localhost:5000${image}`;
};

const MyAccount = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Sidebar navigation: 'orders' | 'address'
  const initialNav = searchParams.get("tab") === "address" ? "address" : "orders";
  const [activeNav, setActiveNav] = useState(initialNav);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState("online"); // 'online' | 'store'
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [cancellingId, setCancellingId] = useState("");

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "address") {
      setActiveNav("address");
    } else if (tabParam === "orders" || tabParam === "order-returns") {
      setActiveNav("orders");
    }
  }, [searchParams]);

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    try {
      setLoadingOrders(true);
      const response = await api.get("/orders/my-orders", getAuthConfig());
      const fetchedOrders = response.data.orders || [];
      setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);
    } catch (error) {
      console.error("Fetch My Orders Error:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  }, [navigate]);

  // Fetch Addresses
  const fetchAddresses = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoadingAddresses(true);
      const response = await api.get("/addresses", getAuthConfig());
      const fetchedAddresses = response.data?.addresses || [];
      setAddresses(Array.isArray(fetchedAddresses) ? fetchedAddresses : []);
    } catch (error) {
      console.error("Fetch Addresses Error:", error);
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchAddresses();

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("User parse error", e);
      }
    }
  }, [fetchOrders, fetchAddresses]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChanged"));
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      setCancellingId(orderId);
      const response = await api.put(
        `/orders/${orderId}/cancel`,
        {},
        getAuthConfig()
      );
      toast.success(response.data?.message || "Order cancelled successfully");
      fetchOrders();
    } catch (error) {
      console.error("Cancel Order Error:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingId("");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const response = await api.delete(`/addresses/${addressId}`, getAuthConfig());
      toast.success(response.data?.message || "Address deleted successfully");
      fetchAddresses();
    } catch (error) {
      console.error("Delete Address Error:", error);
      toast.error(error.response?.data?.message || "Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await api.put(
        `/addresses/${addressId}`,
        { isDefault: true },
        getAuthConfig()
      );
      toast.success(response.data?.message || "Set as default address");
      fetchAddresses();
    } catch (error) {
      console.error("Set Default Address Error:", error);
      toast.error(error.response?.data?.message || "Failed to update default address");
    }
  };

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setIsAddressDrawerOpen(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setIsAddressDrawerOpen(true);
  };

  const handleAddressSaved = () => {
    fetchAddresses();
    setIsAddressDrawerOpen(false);
  };

  // Filter orders
  const getFilteredOrders = () => {
    if (activeTab === "store") return [];
    if (filterPeriod === "all") return orders;

    const now = new Date().getTime();
    let days = 30;
    if (filterPeriod === "3months") days = 90;
    if (filterPeriod === "6months") days = 180;

    const cutoffTime = now - days * 24 * 60 * 60 * 1000;

    return orders.filter((order) => {
      const orderTime = new Date(order.createdAt).getTime();
      return orderTime >= cutoffTime;
    });
  };

  const filteredOrders = getFilteredOrders();

  const getPeriodLabel = () => {
    switch (filterPeriod) {
      case "1month":
        return "Last 1 month";
      case "3months":
        return "Last 3 months";
      case "6months":
        return "Last 6 months";
      default:
        return "All orders";
    }
  };

  return (
    <div className="orders-page">
      <Navbar />

      <main className="orders-main">
        <div className="orders-layout">
          {/* SIDEBAR */}
          <aside className="orders-sidebar">
            <div className="orders-phone-box">
              {user?.mobile ? user.mobile : "+919459940381"}
            </div>

            <div className="loyalty-box">
              <div className="loyalty-heading">
                <strong>Loyalty Points</strong>
                <span>
                  0 pts
                  <FiChevronRight />
                </span>
              </div>

              <div className="loyalty-divider"></div>

              <p>
                Start shopping today to earn &amp; redeem points for direct
                savings on purchases!
              </p>

              <button
                type="button"
                onClick={() => toast.info("Loyalty program coming soon")}
              >
                LEARN MORE
              </button>
            </div>

            <div className="sidebar-menu">
              <div
                className={`sidebar-item ${activeNav === "orders" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("orders");
                  setSearchParams({ tab: "orders" });
                }}
              >
                <FiBox />
                <span>My Orders</span>
              </div>

              <div
                className="sidebar-item"
                onClick={() => navigate("/profile")}
              >
                <FiUser />
                <span>My Profile</span>
              </div>

              <div
                className="sidebar-item"
                onClick={() => toast.info("Wallet features coming soon")}
              >
                <FiCreditCard />
                <span>Wallet</span>
                <strong>₹ 0</strong>
              </div>

              <div
                className="sidebar-item"
                onClick={() => toast.info("Rewards coming soon")}
              >
                <FiTarget />
                <span>Sporty Rewards</span>
                <strong>₹ 0</strong>
              </div>

              <div
                className={`sidebar-item ${activeNav === "address" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("address");
                  setSearchParams({ tab: "address" });
                }}
              >
                <FiMapPin />
                <span>Address</span>
              </div>

              <div className="sidebar-item" onClick={handleLogout}>
                <FiPower />
                <span>Logout</span>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT SECTION */}
          <section className="orders-content">
            {activeNav === "address" ? (
              /* =====================================================
                 YOUR ADDRESS VIEW
              ===================================================== */
              <div className="address-section-card">
                <h2 className="address-section-title">Your Address</h2>

                <div className="address-grid">
                  {/* ADD NEW ADDRESS CARD */}
                  <div
                    className="add-address-dashed-card"
                    onClick={handleOpenAddAddress}
                  >
                    <div className="add-address-plus">+</div>
                    <div className="add-address-text">Add New Address</div>
                  </div>

                  {/* SAVED ADDRESS CARDS */}
                  {loadingAddresses ? (
                    <div className="orders-loading-spinner">
                      Loading addresses...
                    </div>
                  ) : (
                    addresses.map((address) => (
                      <div
                        key={address._id}
                        className={`address-card-box ${
                          !address.isDefault ? "non-default" : ""
                        }`}
                      >
                        <div>
                          <div className="address-card-header">
                            {address.addressType || "Home"}
                          </div>
                          <div className="address-card-name">
                            {address.firstName} {address.lastName}
                          </div>
                          <div className="address-card-body">
                            {address.houseBuilding}, {address.streetLocality}
                            {address.landmark ? `, ${address.landmark}` : ""},{" "}
                            {address.cityState}, {address.pincode}
                          </div>
                          <div className="address-card-phone">
                            Phone: {address.mobile}
                          </div>
                        </div>

                        <div className="address-card-actions">
                          <button
                            type="button"
                            className="btn-addr-action"
                            onClick={() => handleEditAddress(address)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn-addr-action"
                            onClick={() => handleDeleteAddress(address._id)}
                          >
                            Delete
                          </button>

                          {address.isDefault ? (
                            <span className="badge-default-address">
                              Default Address
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn-set-default"
                              onClick={() => handleSetDefaultAddress(address._id)}
                            >
                              Set as Default
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* =====================================================
                 MY ORDERS VIEW
              ===================================================== */
              <>
                <div className="orders-tabs">
                  <div className="orders-title">Orders &amp; Returns</div>

                  <button
                    type="button"
                    className={`order-tab ${
                      activeTab === "online" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("online")}
                  >
                    ONLINE ORDER
                  </button>

                  <button
                    type="button"
                    className={`order-tab ${
                      activeTab === "store" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("store")}
                  >
                    STORE ORDER
                  </button>

                  <div style={{ position: "relative", marginLeft: "auto" }}>
                    <button
                      type="button"
                      className="filter-button"
                      onClick={() => setShowFilterDropdown((prev) => !prev)}
                    >
                      <FiSliders />
                      <span>{getPeriodLabel()}</span>
                    </button>

                    {showFilterDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 5px)",
                          right: 0,
                          background: "#fff",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                          zIndex: 10,
                          minWidth: "160px",
                          overflow: "hidden",
                        }}
                      >
                        {[
                          { id: "all", label: "All orders" },
                          { id: "1month", label: "Last 1 month" },
                          { id: "3months", label: "Last 3 months" },
                          { id: "6months", label: "Last 6 months" },
                        ].map((option) => (
                          <div
                            key={option.id}
                            onClick={() => {
                              setFilterPeriod(option.id);
                              setShowFilterDropdown(false);
                            }}
                            style={{
                              padding: "10px 16px",
                              fontSize: "13px",
                              cursor: "pointer",
                              background:
                                filterPeriod === option.id
                                  ? "#f0f2ff"
                                  : "#fff",
                              color:
                                filterPeriod === option.id
                                  ? "#3945bd"
                                  : "#111",
                              fontWeight:
                                filterPeriod === option.id ? "600" : "400",
                            }}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {loadingOrders ? (
                  <div className="orders-loading-spinner">
                    Loading your orders...
                  </div>
                ) : filteredOrders.length > 0 ? (
                  <div className="orders-list">
                    {filteredOrders.map((order) => (
                      <div key={order._id} className="order-card">
                        <div className="order-card-header">
                          <div className="order-card-info">
                            <span className="order-card-id">
                              Order #{order._id.slice(-8).toUpperCase()}
                            </span>
                            <span className="order-card-date">
                              Placed on {formatDate(order.createdAt)} •{" "}
                              {order.orderItems?.length || 0} item(s)
                            </span>
                          </div>

                          <div className="order-card-badges">
                            <span
                              className={`status-badge ${order.orderStatus?.toLowerCase()}`}
                            >
                              {order.orderStatus}
                            </span>
                            <span
                              className={`payment-badge ${order.paymentStatus?.toLowerCase()}`}
                            >
                              {order.paymentStatus === "paid"
                                ? "Paid"
                                : order.paymentStatus === "refunded"
                                ? "Refunded"
                                : order.paymentStatus === "failed"
                                ? "Failed"
                                : "Unpaid"}
                            </span>
                          </div>
                        </div>

                        <div className="order-card-body">
                          {order.orderItems?.map((item, idx) => (
                            <div key={idx} className="order-card-item">
                              <img
                                src={getImageUrl(item.image)}
                                alt={item.name}
                                className="order-item-img"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/60?text=Product";
                                }}
                              />
                              <div className="order-item-details">
                                <h4 className="order-item-name">{item.name}</h4>
                                <span className="order-item-meta">
                                  Qty: {item.quantity}{" "}
                                  {item.size ? `• Size: ${item.size}` : ""}
                                </span>
                              </div>
                              <div className="order-item-price">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="order-card-footer">
                          <div className="order-total-price">
                            Total Amount: {formatPrice(order.totalAmount)}
                          </div>

                          <div className="order-actions">
                            {order.paymentStatus !== "paid" &&
                              order.orderStatus !== "cancelled" && (
                                <button
                                  type="button"
                                  className="btn-order-action btn-pay"
                                  onClick={() =>
                                    navigate(`/payment/${order._id}`)
                                  }
                                >
                                  Pay Now
                                </button>
                              )}

                            {(order.orderStatus === "pending" ||
                              order.orderStatus === "confirmed") && (
                              <button
                                type="button"
                                className="btn-order-action btn-cancel"
                                disabled={cancellingId === order._id}
                                onClick={() => handleCancelOrder(order._id)}
                              >
                                {cancellingId === order._id
                                  ? "Cancelling..."
                                  : "Cancel Order"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-orders">
                    <div className="empty-image">
                      <div className="tag-shape">
                        <div className="tag-hole"></div>
                        <div className="tag-dot"></div>
                      </div>
                    </div>

                    <p>No items are available</p>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <div
        className="floating-close"
        onClick={() => toast.info("Decathlon Support")}
        style={{ cursor: "pointer" }}
      >
        ×
      </div>

      <div
        className="floating-decathlon"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        <div className="floating-mark">
          <span></span>
        </div>
      </div>

      {/* ADDRESS DRAWER / MODAL */}
      <AddressDrawer
        isOpen={isAddressDrawerOpen}
        onClose={() => setIsAddressDrawerOpen(false)}
        onAddressSaved={handleAddressSaved}
        selectedAddress={editingAddress}
        initialShowForm={true}
      />
    </div>
  );
};

export default MyAccount;
