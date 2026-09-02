import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdAdd,
  MdEdit,
  MdDelete,
  MdCheckCircle,
  MdCancel,
  MdCategory,
  MdInventory2,
  MdImage,
  MdDragIndicator,
} from "react-icons/md";
import toast from "react-hot-toast";
import api from "../api/axios";
import "../styles/PageBuilder.css";

const PageBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // SELECTION DATA FOR SECTION FORMS
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [availableBanners, setAvailableBanners] = useState([]);

  // SECTION MODAL STATES
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionName, setSectionName] = useState("");
  const [sectionType, setSectionType] = useState("category");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedBanners, setSelectedBanners] = useState([]);
  const [savingSection, setSavingSection] = useState(false);

  const getImageUrl = (image) => {
    if (!image) return "";
    if (typeof image === "string" && (image.startsWith("http://") || image.startsWith("https://"))) {
      return image;
    }
    const apiBaseUrl = api.defaults.baseURL || "";
    const backendUrl = apiBaseUrl.replace(/\/api\/?$/, "");
    if (image.startsWith("/uploads/")) return `${backendUrl}${image}`;
    if (image.startsWith("uploads/")) return `${backendUrl}/${image}`;
    return `${backendUrl}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  const fetchPageDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await api.get(`/pages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPage(response.data.page);
    } catch (error) {
      console.error("Fetch Page Details Error:", error);
      toast.error("Failed to load page builder details");
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const headers = { Authorization: `Bearer ${token}` };

      const [catRes, prodRes, banRes] = await Promise.all([
        api.get("/categories", { headers }),
        api.get("/products?limit=100", { headers }),
        api.get("/banners", { headers }),
      ]);

      setAvailableCategories(catRes.data.categories || []);
      setAvailableProducts(prodRes.data.products || []);
      setAvailableBanners(banRes.data.banners || []);
    } catch (error) {
      console.error("Fetch Resources Error:", error);
    }
  };

  useEffect(() => {
    fetchPageDetails();
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleOpenAddModal = () => {
    setEditingSection(null);
    setSectionName("");
    setSectionType("category");
    setSelectedCategories([]);
    setSelectedProducts([]);
    setSelectedBanners([]);
    setShowSectionModal(true);
  };

  const handleOpenEditModal = (sec) => {
    setEditingSection(sec);
    setSectionName(sec.name || "");
    setSectionType(sec.type || "category");

    const catIds = (sec.categories || []).map((c) => (typeof c === "string" ? c : c._id));
    const prodIds = (sec.products || []).map((p) => (typeof p === "string" ? p : p._id));
    const banIds = (sec.banners || []).map((b) => (typeof b === "string" ? b : b._id));

    setSelectedCategories(catIds);
    setSelectedProducts(prodIds);
    setSelectedBanners(banIds);
    setShowSectionModal(true);
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!sectionName.trim()) {
      toast.error("Please enter section name");
      return;
    }

    try {
      setSavingSection(true);
      const token = localStorage.getItem("adminToken");
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        name: sectionName.trim(),
        type: sectionType,
        categories: sectionType === "category" ? selectedCategories : [],
        products: sectionType === "product" ? selectedProducts : [],
        banners: sectionType === "banner" ? selectedBanners : [],
      };

      if (editingSection) {
        await api.put(`/pages/${id}/sections/${editingSection._id}`, payload, { headers });
        toast.success("Section updated successfully");
      } else {
        await api.post(`/pages/${id}/sections`, payload, { headers });
        toast.success("Section added successfully");
      }

      setShowSectionModal(false);
      fetchPageDetails();
    } catch (error) {
      console.error("Save Section Error:", error);
      toast.error(error?.response?.data?.message || "Failed to save section");
    } finally {
      setSavingSection(false);
    }
  };

  const handleToggleSectionActive = async (sec) => {
    try {
      const token = localStorage.getItem("adminToken");
      await api.put(
        `/pages/${id}/sections/${sec._id}`,
        { isActive: !sec.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Section ${sec.isActive ? "disabled" : "enabled"}`);
      fetchPageDetails();
    } catch (error) {
      console.error("Toggle Section Error:", error);
      toast.error("Failed to update section");
    }
  };

  const handleDeleteSection = async (sec) => {
    if (!window.confirm(`Are you sure you want to delete section '${sec.name}'?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      await api.delete(`/pages/${id}/sections/${sec._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Section deleted successfully");
      fetchPageDetails();
    } catch (error) {
      console.error("Delete Section Error:", error);
      toast.error("Failed to delete section");
    }
  };

  const handleSaveReorder = async (updatedSections) => {
    try {
      const token = localStorage.getItem("adminToken");
      const sectionIds = updatedSections.map((s) => s._id);

      // Optimistically update state
      setPage((prev) => ({ ...prev, sections: updatedSections }));

      await api.put(
        `/pages/${id}/sections/reorder`,
        { sectionIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Section layout order updated");
    } catch (error) {
      console.error("Reorder Error:", error);
      toast.error("Failed to update section order");
      fetchPageDetails();
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const sectionsCopy = [...page.sections];
    const [moved] = sectionsCopy.splice(draggedIndex, 1);
    sectionsCopy.splice(targetIndex, 0, moved);

    setDraggedIndex(null);
    handleSaveReorder(sectionsCopy);
  };

  const toggleCategorySelection = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((i) => i !== catId) : [...prev, catId]
    );
  };

  const toggleProductSelection = (prodId) => {
    setSelectedProducts((prev) =>
      prev.includes(prodId) ? prev.filter((i) => i !== prodId) : [...prev, prodId]
    );
  };

  const toggleBannerSelection = (banId) => {
    setSelectedBanners((prev) =>
      prev.includes(banId) ? prev.filter((i) => i !== banId) : [...prev, banId]
    );
  };

  if (loading) {
    return <div className="page-builder-loading">Loading Page Builder...</div>;
  }

  if (!page) {
    return <div className="page-builder-error">Page not found</div>;
  }

  return (
    <div className="page-builder">
      {/* BUILDER HEADER */}
      <div className="builder-header">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/pages")}
        >
          <MdArrowBack />
          <span>Back to Pages</span>
        </button>

        <div className="builder-title">
          <h2>
            {page.name} <span className="builder-slug">/{page.slug}</span>
          </h2>
          <p>Configure sections, content, and order for this page</p>
        </div>

        <button
          type="button"
          className="add-section-btn"
          onClick={handleOpenAddModal}
        >
          <MdAdd />
          <span>+ Add Section</span>
        </button>
      </div>

      {/* SECTIONS LIST */}
      <div className="builder-sections-container">
        {page.sections?.length === 0 ? (
          <div className="sections-empty-state">
            <div className="empty-icon">🧩</div>
            <h3>No sections added yet</h3>
            <p>Click "+ Add Section" to build this page layout</p>
            <button
              type="button"
              className="add-section-btn"
              onClick={handleOpenAddModal}
            >
              <MdAdd />
              <span>Add First Section</span>
            </button>
          </div>
        ) : (
          <div className="sections-list">
            {page.sections.map((sec, idx) => (
              <div
                key={sec._id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                className={`section-row-card ${sec.isActive ? "" : "disabled"} ${
                  draggedIndex === idx ? "dragging" : ""
                }`}
              >
                <div className="section-drag-handle" title="Drag & Swipe to reorder">
                  <MdDragIndicator />
                  <span className="section-index">{idx + 1}</span>
                </div>

                <div className="section-row-info">
                  <div className="section-row-header">
                    <h4>{sec.name}</h4>
                    <span className={`type-tag ${sec.type}`}>
                      {sec.type === "category" && <MdCategory />}
                      {sec.type === "product" && <MdInventory2 />}
                      {sec.type === "banner" && <MdImage />}
                      <span>{sec.type.toUpperCase()}</span>
                    </span>
                  </div>

                  <div className="section-items-summary">
                    {sec.type === "category" && (
                      <span>{sec.categories?.length || 0} Categories selected</span>
                    )}
                    {sec.type === "product" && (
                      <span>{sec.products?.length || 0} Products selected</span>
                    )}
                    {sec.type === "banner" && (
                      <span>{sec.banners?.length || 0} Banners selected</span>
                    )}
                  </div>
                </div>

                <div className="section-row-actions">
                  <button
                    type="button"
                    className={`status-pill ${sec.isActive ? "active" : "inactive"}`}
                    onClick={() => handleToggleSectionActive(sec)}
                  >
                    {sec.isActive ? <MdCheckCircle /> : <MdCancel />}
                    <span>{sec.isActive ? "Active" : "Disabled"}</span>
                  </button>

                  <button
                    type="button"
                    className="edit-sec-btn"
                    onClick={() => handleOpenEditModal(sec)}
                    title="Edit Section"
                  >
                    <MdEdit />
                  </button>

                  <button
                    type="button"
                    className="delete-sec-btn"
                    onClick={() => handleDeleteSection(sec)}
                    title="Delete Section"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION MODAL */}
      {showSectionModal && (
        <div className="modal-overlay" onClick={() => setShowSectionModal(false)}>
          <div
            className="modal-container section-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{editingSection ? "Edit Section" : "Add Section to " + page.name}</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowSectionModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="modal-form">
              <div className="form-group">
                <label>Section Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Popular Categories, Hero Banner"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Section Type *</label>
                <select
                  value={sectionType}
                  onChange={(e) => setSectionType(e.target.value)}
                >
                  <option value="category">Category Section</option>
                  <option value="product">Product Section</option>
                  <option value="banner">Banner Section</option>
                </select>
              </div>

              {/* CATEGORIES PICKER */}
              {sectionType === "category" && (
                <div className="resource-picker-group">
                  <label>Select Categories ({selectedCategories.length} selected)</label>
                  <div className="resource-picker-grid">
                    {availableCategories.map((cat) => (
                      <div
                        key={cat._id}
                        className={`picker-card ${
                          selectedCategories.includes(cat._id) ? "selected" : ""
                        }`}
                        onClick={() => toggleCategorySelection(cat._id)}
                      >
                        <div className="picker-img">
                          {cat.image ? (
                            <img src={getImageUrl(cat.image)} alt={cat.name} />
                          ) : (
                            <MdCategory />
                          )}
                        </div>
                        <span>{cat.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PRODUCTS PICKER */}
              {sectionType === "product" && (
                <div className="resource-picker-group">
                  <label>Select Products ({selectedProducts.length} selected)</label>
                  <div className="resource-picker-grid">
                    {availableProducts.map((prod) => (
                      <div
                        key={prod._id}
                        className={`picker-card ${
                          selectedProducts.includes(prod._id) ? "selected" : ""
                        }`}
                        onClick={() => toggleProductSelection(prod._id)}
                      >
                        <div className="picker-img">
                          {prod.images?.[0] ? (
                            <img src={getImageUrl(prod.images[0])} alt={prod.name} />
                          ) : (
                            <MdInventory2 />
                          )}
                        </div>
                        <span>{prod.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BANNERS PICKER */}
              {sectionType === "banner" && (
                <div className="resource-picker-group">
                  <label>Select Banners ({selectedBanners.length} selected)</label>
                  <div className="resource-picker-grid">
                    {availableBanners.map((ban) => (
                      <div
                        key={ban._id}
                        className={`picker-card ${
                          selectedBanners.includes(ban._id) ? "selected" : ""
                        }`}
                        onClick={() => toggleBannerSelection(ban._id)}
                      >
                        <div className="picker-img">
                          {ban.image ? (
                            <img src={getImageUrl(ban.image)} alt={ban.title} />
                          ) : (
                            <MdImage />
                          )}
                        </div>
                        <span>{ban.title || "Banner"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowSectionModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={savingSection}>
                  {savingSection ? "Saving..." : editingSection ? "Update Section" : "Add Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageBuilder;
