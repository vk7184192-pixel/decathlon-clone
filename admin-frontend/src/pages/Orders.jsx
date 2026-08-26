import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  MdVisibility,
  MdRefresh,
  MdClose,
  MdSearch,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";

import toast from "react-hot-toast";

import api from "../api/axios";
import "../styles/Orders.css";

const ORDERS_PER_PAGE = 10;

const WORKING_STATUSES = ["pending", "confirmed", "processing", "shipped"];

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "return_requested",
  "returned",
  "failed",
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [orderDate, setOrderDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);

  const sortOrders = useCallback((orderList) => {
    return [...orderList].sort((a, b) => {
      const aWorking = WORKING_STATUSES.includes(a.orderStatus);

      const bWorking = WORKING_STATUSES.includes(b.orderStatus);

      if (aWorking && !bWorking) {
        return -1;
      }

      if (!aWorking && bWorking) {
        return 1;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/orders/admin/all");

      const fetchedOrders = response.data.orders || [];

      setOrders(sortOrders(fetchedOrders));

      setCurrentPage(1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [sortOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const value = search.trim().toLowerCase();

    return orders.filter((order) => {
      const orderId = order._id?.toLowerCase() || "";

      const customerName =
        order.user?.name?.toLowerCase() ||
        `${order.shippingAddress?.firstName || ""} ${
          order.shippingAddress?.lastName || ""
        }`.toLowerCase();

      const email = order.user?.email?.toLowerCase() || "";

      const itemName =
        order.orderItems
          ?.map((item) => item.name?.toLowerCase() || "")
          .join(" ") || "";

      const status = order.orderStatus?.toLowerCase() || "";

      const payment = order.paymentStatus?.toLowerCase() || "";

      const matchesSearch =
        !value ||
        orderId.includes(value) ||
        customerName.includes(value) ||
        email.includes(value) ||
        itemName.includes(value) ||
        status.includes(value) ||
        payment.includes(value);

      const matchesStatus =
        statusFilter === "all" || order.orderStatus === statusFilter;

      const matchesDate =
        !orderDate ||
        new Date(order.createdAt).toISOString().slice(0, 10) === orderDate;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, search, statusFilter, orderDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, orderDate]);

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ORDERS_PER_PAGE;

    const end = start + ORDERS_PER_PAGE;

    return filteredOrders.slice(start, end);
  }, [filteredOrders, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setOrderDate("");
    setCurrentPage(1);
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setModalOpen(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });

      setOrders((prev) =>
        sortOrders(
          prev.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  orderStatus: newStatus,
                }
              : order,
          ),
        ),
      );

      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              orderStatus: newStatus,
            }
          : prev,
      );

      toast.success("Order status updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update order status",
      );
    }
  };

  const getStatusClass = (status) => {
    return `order-status status-${status}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="orders-page">
        <div className="orders-header">
          <div>
            <h1>Orders</h1>

            <p>Manage customer orders</p>
          </div>

          <button
            type="button"
            className="refresh-orders-btn"
            onClick={fetchOrders}
          >
            <MdRefresh />
            Refresh
          </button>
        </div>

        <div className="orders-toolbar">
          <div className="orders-search">
            <MdSearch />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders, customers, items..."
            />

            {search && (
              <button
                type="button"
                className="clear-orders-search"
                onClick={() => setSearch("")}
              >
                <MdClose />
              </button>
            )}
          </div>

          <select
            className="orders-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>

            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status
                  .replace("_", " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="orders-date-filter"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
          />

          {(search || statusFilter !== "all" || orderDate) && (
            <button
              type="button"
              className="clear-date-filter"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}

          <span className="orders-count">
            {filteredOrders.length} order
            {filteredOrders.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="orders-loading">Loading orders...</div>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>

                  <th>Customer</th>

                  <th>Date</th>

                  <th>Total</th>

                  <th>Payment</th>

                  <th>Status</th>

                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-orders">
                      {search || statusFilter !== "all" || orderDate
                        ? "No orders match your filters"
                        : "No orders found"}
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <span className="order-id">#{order._id.slice(-8)}</span>
                      </td>

                      <td>
                        <div className="customer-cell">
                          <strong>
                            {order.user?.name ||
                              `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`}
                          </strong>

                          <span>
                            {order.user?.email ||
                              order.shippingAddress?.mobile ||
                              "-"}
                          </span>
                        </div>
                      </td>

                      <td>{formatDate(order.createdAt)}</td>

                      <td>
                        <strong>₹{order.totalAmount}</strong>
                      </td>

                      <td>
                        <span
                          className={`payment-status payment-${order.paymentStatus}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>

                      <td>
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            updateOrderStatus(order._id, e.target.value)
                          }
                          className={getStatusClass(order.orderStatus)}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status
                                .replace("_", " ")
                                .replace(/\b\w/g, (char) => char.toUpperCase())}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="view-order-btn"
                          title="View Order"
                          onClick={() => openOrderModal(order)}
                        >
                          <MdVisibility />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="orders-pagination">
                <button
                  type="button"
                  className="pagination-arrow"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <MdChevronLeft />
                </button>

                <div className="pagination-pages">
                  {Array.from(
                    {
                      length: totalPages,
                    },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      type="button"
                      key={page}
                      className={
                        currentPage === page
                          ? "pagination-page active"
                          : "pagination-page"
                      }
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="pagination-arrow"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <MdChevronRight />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {modalOpen && selectedOrder && (
        <div className="order-modal-overlay" onClick={closeOrderModal}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="order-modal-close"
              onClick={closeOrderModal}
            >
              <MdClose />
            </button>

            <div className="order-modal-header">
              <div>
                <h2>Order #{selectedOrder._id.slice(-8)}</h2>

                <p>{formatDate(selectedOrder.createdAt)}</p>
              </div>

              <span className={getStatusClass(selectedOrder.orderStatus)}>
                {selectedOrder.orderStatus}
              </span>
            </div>

            <div className="order-detail-section">
              <h3>Customer Details</h3>

              <p>
                <strong>Name:</strong>{" "}
                {selectedOrder.user?.name ||
                  `${selectedOrder.shippingAddress?.firstName || ""} ${selectedOrder.shippingAddress?.lastName || ""}`}
              </p>

              <p>
                <strong>Mobile:</strong>{" "}
                {selectedOrder.shippingAddress?.mobile || "-"}
              </p>

              <p>
                <strong>Address:</strong>{" "}
                {selectedOrder.shippingAddress?.houseBuilding},{" "}
                {selectedOrder.shippingAddress?.streetLocality},{" "}
                {selectedOrder.shippingAddress?.cityState},{" "}
                {selectedOrder.shippingAddress?.pincode}
              </p>
            </div>

            <div className="order-detail-section">
              <h3>Order Items</h3>

              <div className="order-items-list">
                {selectedOrder.orderItems?.map((item, index) => (
                  <div className="order-item" key={`${item.product}-${index}`}>
                    <div>
                      <strong>{item.name}</strong>

                      <span>Qty: {item.quantity}</span>
                    </div>

                    <strong>₹{item.price * item.quantity}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-detail-section">
              <h3>Payment Details</h3>

              <div className="order-summary-row">
                <span>Subtotal</span>

                <strong>₹{selectedOrder.subtotal}</strong>
              </div>

              <div className="order-summary-row">
                <span>Discount</span>

                <strong>- ₹{selectedOrder.discount}</strong>
              </div>

              <div className="order-summary-row">
                <span>Delivery</span>

                <strong>₹{selectedOrder.deliveryCharge}</strong>
              </div>

              <div className="order-summary-row total-row">
                <span>Total</span>

                <strong>₹{selectedOrder.totalAmount}</strong>
              </div>
            </div>

            <div className="order-modal-payment">
              <span>Payment Method:</span>

              <strong>{selectedOrder.paymentMethod}</strong>

              <span
                className={`payment-status payment-${selectedOrder.paymentStatus}`}
              >
                {selectedOrder.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;
