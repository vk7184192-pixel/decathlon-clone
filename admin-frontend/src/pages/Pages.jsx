import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdAdd,
  MdLayers,
  MdArrowForward,
  MdCheckCircle,
  MdCancel,
  MdDelete,
  MdSearch,
} from "react-icons/md";
import toast from "react-hot-toast";
import api from "../api/axios";
import "../styles/Pages.css";

const Pages = () => {
  const navigate = useNavigate();

  const [pages, setPages] = useState(() => {
    try {
      const cached = sessionStorage.getItem("cached_admin_pages");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem("cached_admin_pages");
    } catch {
      return true;
    }
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newPageDescription, setNewPageDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchPages = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await api.get("/pages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.pages || [];
      setPages(data);
      try {
        sessionStorage.setItem("cached_admin_pages", JSON.stringify(data));
      } catch (e) {}
    } catch (error) {
      console.error("Fetch Pages Error:", error);
      toast.error(error?.response?.data?.message || "Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleCreatePage = async (e) => {
    e.preventDefault();
    if (!newPageName.trim()) {
      toast.error("Please enter a page name");
      return;
    }

    try {
      setCreating(true);
      const token = localStorage.getItem("adminToken");
      const response = await api.post(
        "/pages",
        {
          name: newPageName.trim(),
          description: newPageDescription.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(response.data?.message || "Page created successfully");
      setShowAddModal(false);
      setNewPageName("");
      setNewPageDescription("");
      fetchPages(false);
    } catch (error) {
      console.error("Create Page Error:", error);
      toast.error(error?.response?.data?.message || "Failed to create page");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (page) => {
    setPages((prev) =>
      prev.map((p) => (p._id === page._id ? { ...p, isActive: !p.isActive } : p))
    );

    try {
      const token = localStorage.getItem("adminToken");
      await api.put(
        `/pages/${page._id}`,
        { isActive: !page.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Page '${page.name}' ${page.isActive ? "disabled" : "enabled"}`);
      fetchPages(false);
    } catch (error) {
      console.error("Toggle Page Active Error:", error);
      toast.error("Failed to update page status");
      fetchPages(false);
    }
  };

  const handleDeletePage = async (page) => {
    if (page.slug === "home") {
      toast.error("The default Home page cannot be deleted");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete page '${page.name}'?`)) {
      return;
    }

    setPages((prev) => prev.filter((p) => p._id !== page._id));

    try {
      const token = localStorage.getItem("adminToken");
      await api.delete(`/pages/${page._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Page deleted successfully");
      fetchPages(false);
    } catch (error) {
      console.error("Delete Page Error:", error);
      toast.error(error?.response?.data?.message || "Failed to delete page");
      fetchPages(false);
    }
  };

  const filteredPages = pages.filter((page) =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pages-management">
      {/* HEADER */}
      <div className="pages-header">
        <div>
          <h2>Pages</h2>
          <p>Manage all store pages and custom section builders</p>
        </div>

        <button
          type="button"
          className="add-page-btn"
          onClick={() => setShowAddModal(true)}
        >
          <MdAdd />
          <span>Add New Page</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="pages-controls">
        <div className="pages-search">
          <MdSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* PAGES LIST */}
      {loading && pages.length === 0 ? (
        <div className="pages-skeleton-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="pages-skeleton-card"></div>
          ))}
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="pages-empty">No pages found</div>
      ) : (
        <div className="pages-grid">
          {filteredPages.map((page) => (
            <div className="page-card" key={page._id}>
              <div className="page-card-header">
                <div className="page-card-title">
                  <h3>{page.name}</h3>
                  <span className="page-slug-badge">/{page.slug}</span>
                </div>

                <div className="page-card-actions">
                  <button
                    type="button"
                    className={`status-pill ${page.isActive ? "active" : "inactive"}`}
                    onClick={() => handleToggleActive(page)}
                    title="Toggle active status"
                  >
                    {page.isActive ? <MdCheckCircle /> : <MdCancel />}
                    <span>{page.isActive ? "Active" : "Disabled"}</span>
                  </button>

                  {page.slug !== "home" && (
                    <button
                      type="button"
                      className="delete-page-btn"
                      onClick={() => handleDeletePage(page)}
                      title="Delete page"
                    >
                      <MdDelete />
                    </button>
                  )}
                </div>
              </div>

              <p className="page-description">
                {page.description || "No description provided"}
              </p>

              <div className="page-card-footer">
                <div className="section-count-info">
                  <MdLayers />
                  <span>{page.sections?.length || 0} Section(s)</span>
                </div>

                <button
                  type="button"
                  className="open-builder-btn"
                  onClick={() => navigate(`/pages/builder/${page._id}`)}
                >
                  <span>Page Builder</span>
                  <MdArrowForward />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD PAGE MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Page</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePage} className="modal-form">
              <div className="form-group">
                <label>Page Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Monsoon Essentials, Running"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Page purpose or details..."
                  value={newPageDescription}
                  onChange={(e) => setNewPageDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={creating}>
                  {creating ? "Creating..." : "Create Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pages;
