import React, { useCallback, useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdRefresh,
  MdClose,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
  MdVisibility,
} from "react-icons/md";

import toast from "react-hot-toast";

import api from "../api/axios";
import socket from "../socket/socket";

import "../styles/HomepageSections.css";

const HomepageSections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorderingId, setReorderingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    name: "",
  });
  const [viewSection, setViewSection] = useState(null);

  /*
  ========================================
  FETCH SECTIONS
  ========================================
  */

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/homepage-sections");

      setSections(response.data.sections || []);
    } catch (error) {
      console.error("Homepage Sections Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to load homepage sections",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  ========================================
  INITIAL LOAD
  ========================================
  */

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  /*
  ========================================
  SOCKET REALTIME UPDATE
  ========================================
  */

  useEffect(() => {
    const handleHomepageUpdate = (data) => {
      const sectionEvents = [
        "section_created",
        "section_updated",
        "section_deleted",
        "section_reordered",
      ];

      /*
      Category/Product/Banner changes
      can also affect this page's data.
      */

      const contentEvents = [
        "category_created",
        "category_updated",
        "category_deleted",
        "category_reordered",

        "product_created",
        "product_updated",
        "product_deleted",

        "banner_created",
        "banner_updated",
        "banner_deleted",
      ];

      if (
        sectionEvents.includes(data?.type) ||
        contentEvents.includes(data?.type)
      ) {
        fetchSections();

        /*
        Refresh open view modal too.
        */

        setViewSection(null);
      }
    };

    socket.on("homepage_updated", handleHomepageUpdate);

    return () => {
      socket.off("homepage_updated", handleHomepageUpdate);
    };
  }, [fetchSections]);

  /*
  ========================================
  SECTION TYPE
  ========================================
  */

  const getSectionType = (type) => {
    if (type === "category") {
      return "Category";
    }

    if (type === "product") {
      return "Product";
    }

    if (type === "banner") {
      return "Banner";
    }

    return type;
  };

  /*
  ========================================
  OPEN DELETE MODAL
  ========================================
  */

  const openDeleteModal = (section) => {
    setDeleteModal({
      open: true,
      id: section._id,
      name: section.name,
    });
  };

  /*
  ========================================
  CLOSE DELETE MODAL
  ========================================
  */

  const closeDeleteModal = () => {
    setDeleteModal({
      open: false,
      id: null,
      name: "",
    });
  };

  /*
  ========================================
  DELETE SECTION
  ========================================
  */

  const handleDelete = async () => {
    try {
      await api.delete(`/homepage-sections/${deleteModal.id}`);

      setSections((prev) =>
        prev.filter((section) => section._id !== deleteModal.id),
      );

      closeDeleteModal();

      toast.success("Section deleted successfully");
    } catch (error) {
      console.error("Delete Section Error:", error);

      toast.error(error.response?.data?.message || "Failed to delete section");
    }
  };

  /*
  ========================================
  REORDER SECTION
  ========================================
  */

  const handleReorder = async (sectionId, direction) => {
    try {
      setReorderingId(sectionId);

      const response = await api.put("/homepage-sections/reorder", {
        sectionId,
        direction,
      });

      setSections(response.data.sections || []);

      toast.success("Section order updated");
    } catch (error) {
      console.error("Reorder Section Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to update section order",
      );
    } finally {
      setReorderingId(null);
    }
  };

  /*
  ========================================
  TOGGLE STATUS
  ========================================
  */

  const handleToggleStatus = async (section) => {
    try {
      const response = await api.put(`/homepage-sections/${section._id}`, {
        isActive: !section.isActive,
      });

      setSections((prev) =>
        prev.map((item) =>
          item._id === section._id ? response.data.section : item,
        ),
      );

      toast.success(
        response.data.section.isActive
          ? "Section activated"
          : "Section deactivated",
      );
    } catch (error) {
      console.error("Toggle Section Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to update section status",
      );
    }
  };

  /*
  ========================================
  GET ITEM COUNT
  ========================================
  */

  const getItemsCount = (section) => {
    if (section.type === "category") {
      return section.categories?.length || 0;
    }

    if (section.type === "product") {
      return section.products?.length || 0;
    }

    if (section.type === "banner") {
      return section.banners?.length || 0;
    }

    return 0;
  };

  /*
  ========================================
  LOADING
  ========================================
  */

  if (loading) {
    return (
      <div className="homepage-sections-page">
        <div className="homepage-sections-loading">
          Loading homepage sections...
        </div>
      </div>
    );
  }

  /*
  ========================================
  UI
  ========================================
  */

  return (
    <>
      <div className="homepage-sections-page">
        {/* HEADER */}

        <div className="homepage-sections-header">
          <div>
            <h1>Homepage Sections</h1>

            <p>Manage dynamic homepage sections</p>
          </div>

          <div className="homepage-sections-header-actions">
            <button
              type="button"
              className="refresh-homepage-sections-btn"
              onClick={fetchSections}
            >
              <MdRefresh />
              Refresh
            </button>

            <Link
              to="/homepage-sections/add"
              className="add-homepage-section-btn"
            >
              <MdAdd />
              Create Section
            </Link>
          </div>
        </div>

        {/* TABLE */}

        <div className="homepage-sections-list-wrapper">
          <table className="homepage-sections-table">
            <thead>
              <tr>
                <th>Order</th>

                <th>Section Name</th>

                <th>Type</th>

                <th>Items</th>

                <th>Status</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sections.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-homepage-sections">
                    No homepage sections found
                  </td>
                </tr>
              ) : (
                sections.map((section, index) => {
                  const isFirst = index === 0;

                  const isLast = index === sections.length - 1;

                  const isReordering = reorderingId === section._id;

                  const itemsCount = getItemsCount(section);

                  return (
                    <tr key={section._id}>
                      {/* ORDER */}

                      <td>
                        <div className="homepage-section-order">
                          <button
                            type="button"
                            className="homepage-section-order-btn"
                            disabled={isFirst || isReordering}
                            title="Move Up"
                            onClick={() => handleReorder(section._id, "up")}
                          >
                            <MdKeyboardArrowUp />
                          </button>

                          <span>{index + 1}</span>

                          <button
                            type="button"
                            className="homepage-section-order-btn"
                            disabled={isLast || isReordering}
                            title="Move Down"
                            onClick={() => handleReorder(section._id, "down")}
                          >
                            <MdKeyboardArrowDown />
                          </button>
                        </div>
                      </td>

                      {/* NAME */}

                      <td>
                        <div className="homepage-section-name-cell">
                          <strong>{section.name}</strong>

                          <span>Homepage section</span>
                        </div>
                      </td>

                      {/* TYPE */}

                      <td>
                        <span className="homepage-section-type">
                          {getSectionType(section.type)}
                        </span>
                      </td>

                      {/* ITEMS */}

                      <td>
                        <span className="homepage-section-items-count">
                          {itemsCount}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td>
                        <button
                          type="button"
                          className={
                            section.isActive
                              ? "homepage-section-status active"
                              : "homepage-section-status inactive"
                          }
                          onClick={() => handleToggleStatus(section)}
                        >
                          {section.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* ACTIONS */}

                      <td>
                        <div className="homepage-section-actions">
                          <button
                            type="button"
                            className="homepage-section-view-btn"
                            title="View Section"
                            onClick={() => setViewSection(section)}
                          >
                            <MdVisibility />
                          </button>

                          <Link
                            to={`/homepage-sections/edit/${section._id}`}
                            className="homepage-section-edit-btn"
                            title="Edit Section"
                          >
                            <MdEdit />
                          </Link>

                          <button
                            type="button"
                            className="homepage-section-delete-btn"
                            title="Delete Section"
                            onClick={() => openDeleteModal(section)}
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================
          VIEW MODAL
      ======================================== */}

      {viewSection && (
        <div
          className="homepage-section-view-overlay"
          onClick={() => setViewSection(null)}
        >
          <div
            className="homepage-section-view-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="homepage-section-view-close"
              onClick={() => setViewSection(null)}
            >
              <MdClose />
            </button>

            <h2>{viewSection.name}</h2>

            <div className="homepage-section-view-row">
              <span>Type</span>

              <strong>{getSectionType(viewSection.type)}</strong>
            </div>

            <div className="homepage-section-view-row">
              <span>Status</span>

              <strong>{viewSection.isActive ? "Active" : "Inactive"}</strong>
            </div>

            {/* CATEGORY */}

            {viewSection.type === "category" && (
              <div className="homepage-section-items-list">
                <h3>Categories</h3>

                {viewSection.categories?.length ? (
                  viewSection.categories.map((category) => (
                    <div key={category._id} className="homepage-section-item">
                      <span>{category.name}</span>
                    </div>
                  ))
                ) : (
                  <p>No categories selected</p>
                )}
              </div>
            )}

            {/* PRODUCT */}

            {viewSection.type === "product" && (
              <div className="homepage-section-items-list">
                <h3>Products</h3>

                {viewSection.products?.length ? (
                  viewSection.products.map((product) => (
                    <div key={product._id} className="homepage-section-item">
                      <span>{product.name}</span>
                    </div>
                  ))
                ) : (
                  <p>No products selected</p>
                )}
              </div>
            )}

            {/* BANNERS */}

            {viewSection.type === "banner" && (
              <div className="homepage-section-items-list">
                <h3>Banners</h3>

                {viewSection.banners?.length ? (
                  viewSection.banners.map((banner) => (
                    <div key={banner._id} className="homepage-section-item">
                      <span>{banner.title || "Untitled Banner"}</span>
                    </div>
                  ))
                ) : (
                  <p>No banners selected</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================
          DELETE MODAL
      ======================================== */}

      {deleteModal.open && (
        <div
          className="homepage-section-delete-overlay"
          onClick={closeDeleteModal}
        >
          <div
            className="homepage-section-delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="homepage-section-delete-close"
              onClick={closeDeleteModal}
            >
              <MdClose />
            </button>

            <div className="homepage-section-delete-icon">
              <MdDelete />
            </div>

            <h2>Delete Section?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteModal.name}</strong>?
            </p>

            <span>This action cannot be undone.</span>

            <div className="homepage-section-delete-actions">
              <button
                type="button"
                className="homepage-section-cancel-btn"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="homepage-section-confirm-delete-btn"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomepageSections;
