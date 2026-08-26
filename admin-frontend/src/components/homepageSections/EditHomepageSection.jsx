import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  MdArrowBack,
  MdSearch,
  MdClose,
  MdCheck,
  MdDelete,
} from "react-icons/md";

import toast from "react-hot-toast";

import api from "../../api/axios";
import "../../styles/homepageSection/EditHomepageSection.css";

const EditHomepageSection = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState("");

  const [type, setType] = useState("category");

  const [categories, setCategories] = useState([]);

  const [products, setProducts] = useState([]);

  const [banners, setBanners] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);

  const [selectedProducts, setSelectedProducts] = useState([]);

  const [selectedBanners, setSelectedBanners] = useState([]);

  const [categorySearch, setCategorySearch] = useState("");

  const [productSearch, setProductSearch] = useState("");

  const [bannerSearch, setBannerSearch] = useState("");

  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  /*
  ========================================
  IMAGE URL
  ========================================
  */

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (image.startsWith("http")) {
      return image;
    }

    return `http://localhost:5000${image}`;
  };

  /*
  ========================================
  LOAD DATA
  ========================================
  */

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [
        sectionsResponse,
        categoriesResponse,
        productsResponse,
        bannersResponse,
      ] = await Promise.all([
        api.get("/homepage-sections"),
        api.get("/categories"),
        api.get("/products?admin=true&limit=1000"),
        api.get("/banners"),
      ]);

      const sections = sectionsResponse.data.sections || [];

      const section = sections.find((item) => item._id === id);

      if (!section) {
        toast.error("Homepage section not found");

        navigate("/homepage-sections");

        return;
      }

      setName(section.name || "");
      setType(section.type || "category");
      setIsActive(section.isActive ?? true);

      setCategories(categoriesResponse.data.categories || []);

      setProducts(productsResponse.data.products || []);

      setBanners(bannersResponse.data.banners || []);

      setSelectedCategories(
        section.categories?.map((category) =>
          typeof category === "object" ? category._id : category,
        ) || [],
      );

      setSelectedProducts(
        section.products?.map((product) =>
          typeof product === "object" ? product._id : product,
        ) || [],
      );

      setSelectedBanners(
        section.banners?.map((banner) =>
          typeof banner === "object" ? banner._id : banner,
        ) || [],
      );
    } catch (error) {
      console.error("Edit Homepage Section Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to load homepage section",
      );

      navigate("/homepage-sections");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /*
  ========================================
  SEARCH CATEGORIES
  ========================================
  */

  const filteredCategories = useMemo(() => {
    const value = categorySearch.trim().toLowerCase();

    if (!value) {
      return categories;
    }

    return categories.filter((category) =>
      category.name?.toLowerCase().includes(value),
    );
  }, [categories, categorySearch]);

  /*
  ========================================
  SEARCH PRODUCTS
  ========================================
  */

  const filteredProducts = useMemo(() => {
    const value = productSearch.trim().toLowerCase();

    if (!value) {
      return products;
    }

    return products.filter((product) => {
      const productName = product.name?.toLowerCase() || "";

      const brand = product.brand?.toLowerCase() || "";

      return productName.includes(value) || brand.includes(value);
    });
  }, [products, productSearch]);

  /*
  ========================================
  SEARCH BANNERS
  ========================================
  */

  const filteredBanners = useMemo(() => {
    const value = bannerSearch.trim().toLowerCase();

    if (!value) {
      return banners;
    }

    return banners.filter((banner) => {
      const title = banner.title?.toLowerCase() || "";

      const bannerType = banner.type?.toLowerCase() || "";

      return title.includes(value) || bannerType.includes(value);
    });
  }, [banners, bannerSearch]);

  /*
  ========================================
  CATEGORY
  ========================================
  */

  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }

      return [...prev, categoryId];
    });
  };

  /*
  ========================================
  PRODUCT
  ========================================
  */

  const toggleProduct = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }

      return [...prev, productId];
    });
  };

  /*
  ========================================
  BANNER
  ========================================
  */

  const toggleBanner = (bannerId) => {
    setSelectedBanners((prev) => {
      if (prev.includes(bannerId)) {
        return prev.filter((id) => id !== bannerId);
      }

      return [...prev, bannerId];
    });
  };

  /*
  ========================================
  REMOVE CATEGORY
  ========================================
  */

  const removeCategory = (categoryId) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
  };

  /*
  ========================================
  REMOVE PRODUCT
  ========================================
  */

  const removeProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((id) => id !== productId));
  };

  /*
  ========================================
  REMOVE BANNER
  ========================================
  */

  const removeBanner = (bannerId) => {
    setSelectedBanners((prev) => prev.filter((id) => id !== bannerId));
  };

  /*
  ========================================
  MOVE CATEGORY
  ========================================
  */

  const moveCategory = (index, direction) => {
    setSelectedCategories((prev) => {
      const items = [...prev];

      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= items.length) {
        return prev;
      }

      [items[index], items[targetIndex]] = [items[targetIndex], items[index]];

      return items;
    });
  };

  /*
  ========================================
  MOVE PRODUCT
  ========================================
  */

  const moveProduct = (index, direction) => {
    setSelectedProducts((prev) => {
      const items = [...prev];

      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= items.length) {
        return prev;
      }

      [items[index], items[targetIndex]] = [items[targetIndex], items[index]];

      return items;
    });
  };

  /*
  ========================================
  MOVE BANNER
  ========================================
  */

  const moveBanner = (index, direction) => {
    setSelectedBanners((prev) => {
      const items = [...prev];

      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= items.length) {
        return prev;
      }

      [items[index], items[targetIndex]] = [items[targetIndex], items[index]];

      return items;
    });
  };

  /*
  ========================================
  SELECTED DATA
  ========================================
  */

  const selectedCategoryData = selectedCategories
    .map((selectedId) =>
      categories.find((category) => category._id === selectedId),
    )
    .filter(Boolean);

  const selectedProductData = selectedProducts
    .map((selectedId) => products.find((product) => product._id === selectedId))
    .filter(Boolean);

  const selectedBannerData = selectedBanners
    .map((selectedId) => banners.find((banner) => banner._id === selectedId))
    .filter(Boolean);

  /*
  ========================================
  VALIDATION
  ========================================
  */

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Section name is required");

      return false;
    }

    if (type === "category" && selectedCategories.length === 0) {
      toast.error("Select at least one category");

      return false;
    }

    if (type === "product" && selectedProducts.length === 0) {
      toast.error("Select at least one product");

      return false;
    }

    if (type === "banner" && selectedBanners.length === 0) {
      toast.error("Select at least one banner");

      return false;
    }

    return true;
  };

  /*
  ========================================
  UPDATE
  ========================================
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: name.trim(),

        type,

        categories: type === "category" ? selectedCategories : [],

        products: type === "product" ? selectedProducts : [],

        banners: type === "banner" ? selectedBanners : [],

        isActive,
      };

      await api.put(`/homepage-sections/${id}`, payload);

      toast.success("Homepage section updated successfully");

      navigate("/homepage-sections");
    } catch (error) {
      console.error("Update Homepage Section Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to update homepage section",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  ========================================
  LOADING
  ========================================
  */

  if (loading) {
    return (
      <div className="edit-homepage-section-page">
        <div className="edit-homepage-section-loading">Loading...</div>
      </div>
    );
  }

  /*
  ========================================
  UI
  ========================================
  */

  return (
    <div className="edit-homepage-section-page">
      {/* HEADER */}

      <div className="edit-homepage-section-header">
        <button
          type="button"
          className="edit-homepage-section-back-btn"
          onClick={() => navigate("/homepage-sections")}
        >
          <MdArrowBack />
          Back
        </button>

        <div>
          <h1>Edit Homepage Section</h1>

          <p>Update your homepage section</p>
        </div>
      </div>

      {/* FORM */}

      <form className="edit-homepage-section-form" onSubmit={handleSubmit}>
        <section className="edit-homepage-section-card">
          <div className="edit-homepage-section-title">
            <h2>Section Information</h2>
          </div>

          {/* SECTION NAME */}

          <div className="edit-homepage-section-group">
            <label>Section Name *</label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Example: Trending Now"
            />
          </div>

          {/* SECTION TYPE */}

          <div className="edit-homepage-section-group">
            <label>Section Type *</label>

            <select
              value={type}
              onChange={(e) => {
                const newType = e.target.value;

                setType(newType);

                setSelectedCategories([]);

                setSelectedProducts([]);

                setSelectedBanners([]);
              }}
            >
              <option value="category">Category Section</option>

              <option value="product">Product Section</option>

              <option value="banner">Banner Section</option>
            </select>
          </div>

          {/* CATEGORY SECTION */}

          {type === "category" && (
            <>
              <div className="edit-homepage-section-group">
                <label>Select Categories</label>

                <div className="edit-homepage-section-search">
                  <MdSearch />

                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search categories..."
                  />

                  {categorySearch && (
                    <button type="button" onClick={() => setCategorySearch("")}>
                      <MdClose />
                    </button>
                  )}
                </div>
              </div>

              <div className="edit-homepage-category-grid">
                {filteredCategories.length === 0 ? (
                  <div className="edit-homepage-empty">No categories found</div>
                ) : (
                  filteredCategories.map((category) => {
                    const selected = selectedCategories.includes(category._id);

                    return (
                      <button
                        type="button"
                        key={category._id}
                        className={
                          selected
                            ? "edit-homepage-select-item selected"
                            : "edit-homepage-select-item"
                        }
                        onClick={() => toggleCategory(category._id)}
                      >
                        <div className="edit-homepage-select-image">
                          {category.image ? (
                            <img
                              src={getImageUrl(category.image)}
                              alt={category.name}
                            />
                          ) : (
                            <span>No Image</span>
                          )}
                        </div>

                        <span>{category.name}</span>

                        <div className="edit-homepage-check">
                          {selected && <MdCheck />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {selectedCategoryData.length > 0 && (
                <div className="edit-homepage-selected-box">
                  <div className="edit-homepage-selected-header">
                    <h3>Selected Categories</h3>

                    <span>{selectedCategoryData.length}</span>
                  </div>

                  <div className="edit-homepage-selected-list">
                    {selectedCategoryData.map((category, index) => (
                      <div
                        className="edit-homepage-selected-item"
                        key={category._id}
                      >
                        <span className="edit-homepage-number">
                          {index + 1}
                        </span>

                        <div className="edit-homepage-selected-image">
                          {category.image ? (
                            <img
                              src={getImageUrl(category.image)}
                              alt={category.name}
                            />
                          ) : (
                            <span>N/A</span>
                          )}
                        </div>

                        <strong>{category.name}</strong>

                        <div className="edit-homepage-selected-actions">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveCategory(index, "up")}
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            disabled={index === selectedCategoryData.length - 1}
                            onClick={() => moveCategory(index, "down")}
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            className="remove"
                            onClick={() => removeCategory(category._id)}
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* PRODUCT SECTION */}

          {type === "product" && (
            <>
              <div className="edit-homepage-section-group">
                <label>Select Products</label>

                <div className="edit-homepage-section-search">
                  <MdSearch />

                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                  />

                  {productSearch && (
                    <button type="button" onClick={() => setProductSearch("")}>
                      <MdClose />
                    </button>
                  )}
                </div>
              </div>

              <div className="edit-homepage-product-grid">
                {filteredProducts.length === 0 ? (
                  <div className="edit-homepage-empty">No products found</div>
                ) : (
                  filteredProducts.map((product) => {
                    const selected = selectedProducts.includes(product._id);

                    return (
                      <button
                        type="button"
                        key={product._id}
                        className={
                          selected
                            ? "edit-homepage-product-item selected"
                            : "edit-homepage-product-item"
                        }
                        onClick={() => toggleProduct(product._id)}
                      >
                        <div className="edit-homepage-product-image">
                          {product.images?.[0] ? (
                            <img
                              src={getImageUrl(product.images[0])}
                              alt={product.name}
                            />
                          ) : (
                            <span>No Image</span>
                          )}
                        </div>

                        <div className="edit-homepage-product-info">
                          <strong>{product.name}</strong>

                          <span>₹{product.discountPrice || product.price}</span>
                        </div>

                        <div className="edit-homepage-check">
                          {selected && <MdCheck />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {selectedProductData.length > 0 && (
                <div className="edit-homepage-selected-box">
                  <div className="edit-homepage-selected-header">
                    <h3>Selected Products</h3>

                    <span>{selectedProductData.length}</span>
                  </div>

                  <div className="edit-homepage-selected-list">
                    {selectedProductData.map((product, index) => (
                      <div
                        className="edit-homepage-selected-item"
                        key={product._id}
                      >
                        <span className="edit-homepage-number">
                          {index + 1}
                        </span>

                        <div className="edit-homepage-selected-image">
                          {product.images?.[0] ? (
                            <img
                              src={getImageUrl(product.images[0])}
                              alt={product.name}
                            />
                          ) : (
                            <span>N/A</span>
                          )}
                        </div>

                        <strong>{product.name}</strong>

                        <div className="edit-homepage-selected-actions">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveProduct(index, "up")}
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            disabled={index === selectedProductData.length - 1}
                            onClick={() => moveProduct(index, "down")}
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            className="remove"
                            onClick={() => removeProduct(product._id)}
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* BANNER SECTION */}

          {type === "banner" && (
            <>
              <div className="edit-homepage-section-group">
                <label>Select Banners</label>

                <div className="edit-homepage-section-search">
                  <MdSearch />

                  <input
                    type="text"
                    value={bannerSearch}
                    onChange={(e) => setBannerSearch(e.target.value)}
                    placeholder="Search banners..."
                  />

                  {bannerSearch && (
                    <button type="button" onClick={() => setBannerSearch("")}>
                      <MdClose />
                    </button>
                  )}
                </div>
              </div>

              <div className="edit-homepage-banner-list">
                {filteredBanners.length === 0 ? (
                  <div className="edit-homepage-empty">No banners found</div>
                ) : (
                  filteredBanners.map((banner) => {
                    const selected = selectedBanners.includes(banner._id);

                    return (
                      <button
                        type="button"
                        key={banner._id}
                        className={
                          selected
                            ? "edit-homepage-banner-item selected"
                            : "edit-homepage-banner-item"
                        }
                        onClick={() => toggleBanner(banner._id)}
                      >
                        <div className="edit-homepage-banner-image">
                          {banner.image ? (
                            <img
                              src={getImageUrl(banner.image)}
                              alt={banner.title || "Banner"}
                            />
                          ) : (
                            <span>No Image</span>
                          )}
                        </div>

                        <div className="edit-homepage-banner-info">
                          <strong>{banner.title || "Untitled Banner"}</strong>

                          <span>{banner.type}</span>
                        </div>

                        <div className="edit-homepage-check">
                          {selected && <MdCheck />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {selectedBannerData.length > 0 && (
                <div className="edit-homepage-selected-box">
                  <div className="edit-homepage-selected-header">
                    <h3>Selected Banners</h3>

                    <span>{selectedBannerData.length}</span>
                  </div>

                  <div className="edit-homepage-selected-list">
                    {selectedBannerData.map((banner, index) => (
                      <div
                        className="edit-homepage-selected-item"
                        key={banner._id}
                      >
                        <span className="edit-homepage-number">
                          {index + 1}
                        </span>

                        <div className="edit-homepage-selected-image">
                          {banner.image ? (
                            <img
                              src={getImageUrl(banner.image)}
                              alt={banner.title || "Banner"}
                            />
                          ) : (
                            <span>N/A</span>
                          )}
                        </div>

                        <strong>{banner.title || "Untitled Banner"}</strong>

                        <div className="edit-homepage-selected-actions">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveBanner(index, "up")}
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            disabled={index === selectedBannerData.length - 1}
                            onClick={() => moveBanner(index, "down")}
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            className="remove"
                            onClick={() => removeBanner(banner._id)}
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ACTIVE STATUS */}

          <div className="edit-homepage-active-row">
            <div>
              <strong>Active Section</strong>

              <span>Show this section on homepage</span>
            </div>

            <button
              type="button"
              className={
                isActive
                  ? "edit-homepage-switch active"
                  : "edit-homepage-switch"
              }
              onClick={() => setIsActive(!isActive)}
            >
              <span />
            </button>
          </div>
        </section>

        {/* ACTIONS */}

        <div className="edit-homepage-actions">
          <button
            type="button"
            className="edit-homepage-cancel-btn"
            onClick={() => navigate("/homepage-sections")}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="edit-homepage-save-btn"
            disabled={saving}
          >
            {saving ? "Updating..." : "Update Section"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditHomepageSection;
