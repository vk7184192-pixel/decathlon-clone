import React, { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  MdArrowBack,
  MdSearch,
  MdClose,
  MdCheck,
  MdDelete,
} from "react-icons/md";

import toast from "react-hot-toast";

import api from "../../api/axios";
import "../../styles/homepageSection/AddHomepageSection.css";

const AddHomepageSection = () => {
  const navigate = useNavigate();

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
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    const apiBaseUrl = api.defaults.baseURL || "";
    const backendUrl = apiBaseUrl.replace(/\/api\/?$/, "");
    if (image.startsWith("/uploads/")) return `${backendUrl}${image}`;
    if (image.startsWith("uploads/")) return `${backendUrl}/${image}`;
    return image;
  };

  /*
  ========================================
  FETCH DATA
  ========================================
  */

  const fetchData = async () => {
    try {
      setLoading(true);

      const [categoriesResponse, productsResponse, bannersResponse] =
        await Promise.all([
          api.get("/categories"),

          api.get("/products?admin=true&limit=1000"),

          api.get("/banners"),
        ]);

      setCategories(categoriesResponse.data.categories || []);

      setProducts(productsResponse.data.products || []);

      setBanners(bannersResponse.data.banners || []);
    } catch (error) {
      console.error("Homepage Section Data Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to load section data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /*
  ========================================
  FILTER CATEGORIES
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
  FILTER PRODUCTS
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
  FILTER BANNERS
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
  SELECTION CHECK
  ========================================
  */

  const isCategorySelected = (id) => {
    return selectedCategories.includes(id);
  };

  const isProductSelected = (id) => {
    return selectedProducts.includes(id);
  };

  const isBannerSelected = (id) => {
    return selectedBanners.includes(id);
  };

  /*
  ========================================
  TOGGLE CATEGORY
  ========================================
  */

  const toggleCategory = (id) => {
    setSelectedCategories((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    });
  };

  /*
  ========================================
  TOGGLE PRODUCT
  ========================================
  */

  const toggleProduct = (id) => {
    setSelectedProducts((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    });
  };

  /*
  ========================================
  TOGGLE BANNER
  ========================================
  */

  const toggleBanner = (id) => {
    setSelectedBanners((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    });
  };

  /*
  ========================================
  REMOVE CATEGORY
  ========================================
  */

  const removeSelectedCategory = (id) => {
    setSelectedCategories((prev) => prev.filter((item) => item !== id));
  };

  /*
  ========================================
  REMOVE PRODUCT
  ========================================
  */

  const removeSelectedProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((item) => item !== id));
  };

  /*
  ========================================
  REMOVE BANNER
  ========================================
  */

  const removeSelectedBanner = (id) => {
    setSelectedBanners((prev) => prev.filter((item) => item !== id));
  };

  /*
  ========================================
  MOVE CATEGORY
  ========================================
  */

  const moveCategory = (index, direction) => {
    setSelectedCategories((prev) => {
      const newItems = [...prev];

      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= newItems.length) {
        return prev;
      }

      [newItems[index], newItems[targetIndex]] = [
        newItems[targetIndex],
        newItems[index],
      ];

      return newItems;
    });
  };

  /*
  ========================================
  MOVE PRODUCT
  ========================================
  */

  const moveProduct = (index, direction) => {
    setSelectedProducts((prev) => {
      const newItems = [...prev];

      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= newItems.length) {
        return prev;
      }

      [newItems[index], newItems[targetIndex]] = [
        newItems[targetIndex],
        newItems[index],
      ];

      return newItems;
    });
  };

  /*
  ========================================
  MOVE BANNER
  ========================================
  */

  const moveBanner = (index, direction) => {
    setSelectedBanners((prev) => {
      const newItems = [...prev];

      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= newItems.length) {
        return prev;
      }

      [newItems[index], newItems[targetIndex]] = [
        newItems[targetIndex],
        newItems[index],
      ];

      return newItems;
    });
  };

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

    if (type === "category") {
      if (selectedCategories.length === 0) {
        toast.error("Select at least one category");

        return false;
      }
    }

    if (type === "product") {
      if (selectedProducts.length === 0) {
        toast.error("Select at least one product");

        return false;
      }
    }

    if (type === "banner") {
      if (selectedBanners.length === 0) {
        toast.error("Select at least one banner");

        return false;
      }
    }

    return true;
  };

  /*
  ========================================
  SUBMIT
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

      await api.post("/homepage-sections", payload);

      toast.success("Homepage section created successfully");

      navigate("/homepage-sections");
    } catch (error) {
      console.error("Create Homepage Section Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to create homepage section",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  ========================================
  SELECTED DATA
  ========================================
  */

  const selectedCategoryData = selectedCategories
    .map((id) => categories.find((category) => category._id === id))
    .filter(Boolean);

  const selectedProductData = selectedProducts
    .map((id) => products.find((product) => product._id === id))
    .filter(Boolean);

  const selectedBannerData = selectedBanners
    .map((id) => banners.find((banner) => banner._id === id))
    .filter(Boolean);

  /*
  ========================================
  LOADING
  ========================================
  */

  if (loading) {
    return (
      <div className="add-homepage-section-page">
        <div className="add-homepage-section-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="add-homepage-section-page">
      {/* HEADER */}

      <div className="add-homepage-section-header">
        <button
          type="button"
          className="add-homepage-section-back-btn"
          onClick={() => navigate("/homepage-sections")}
        >
          <MdArrowBack />
          Back
        </button>

        <div>
          <h1>Create Homepage Section</h1>

          <p>Create a dynamic section for your homepage</p>
        </div>
      </div>

      {/* FORM */}

      <form className="add-homepage-section-form" onSubmit={handleSubmit}>
        <section className="homepage-section-form-card">
          <div className="homepage-section-form-title">
            <h2>Section Information</h2>
          </div>

          {/* SECTION NAME */}

          <div className="homepage-section-form-group">
            <label>Section Name *</label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Example: Trending Now"
            />
          </div>

          {/* SECTION TYPE */}

          <div className="homepage-section-form-group">
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

          {/* CATEGORY */}

          {type === "category" && (
            <>
              <div className="homepage-section-form-group">
                <label>Select Categories</label>

                <div className="homepage-section-search">
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

              <div className="homepage-section-select-grid">
                {filteredCategories.length === 0 ? (
                  <div className="homepage-section-empty">
                    No categories found
                  </div>
                ) : (
                  filteredCategories.map((category) => {
                    const selected = isCategorySelected(category._id);

                    return (
                      <button
                        type="button"
                        className={
                          selected
                            ? "homepage-select-item selected"
                            : "homepage-select-item"
                        }
                        key={category._id}
                        onClick={() => toggleCategory(category._id)}
                      >
                        <div className="homepage-select-image">
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

                        <div className="homepage-select-check">
                          {selected && <MdCheck />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {selectedCategoryData.length > 0 && (
                <div className="homepage-selected-section">
                  <div className="homepage-selected-header">
                    <h3>Selected Categories</h3>

                    <span>{selectedCategoryData.length}</span>
                  </div>

                  <div className="homepage-selected-list">
                    {selectedCategoryData.map((category, index) => (
                      <div
                        className="homepage-selected-item"
                        key={category._id}
                      >
                        <span className="homepage-selected-number">
                          {index + 1}
                        </span>

                        <div className="homepage-selected-item-image">
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

                        <div className="homepage-selected-actions">
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
                            onClick={() => removeSelectedCategory(category._id)}
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

          {/* PRODUCT */}

          {type === "product" && (
            <>
              <div className="homepage-section-form-group">
                <label>Select Products</label>

                <div className="homepage-section-search">
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

              <div className="homepage-section-products-grid">
                {filteredProducts.length === 0 ? (
                  <div className="homepage-section-empty">
                    No products found
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const selected = isProductSelected(product._id);

                    return (
                      <button
                        type="button"
                        className={
                          selected
                            ? "homepage-product-select-item selected"
                            : "homepage-product-select-item"
                        }
                        key={product._id}
                        onClick={() => toggleProduct(product._id)}
                      >
                        <div className="homepage-product-select-image">
                          {product.images?.[0] ? (
                            <img
                              src={getImageUrl(product.images[0])}
                              alt={product.name}
                            />
                          ) : (
                            <span>No Image</span>
                          )}
                        </div>

                        <div className="homepage-product-select-info">
                          <strong>{product.name}</strong>

                          <span>₹{product.discountPrice || product.price}</span>
                        </div>

                        <div className="homepage-select-check">
                          {selected && <MdCheck />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {selectedProductData.length > 0 && (
                <div className="homepage-selected-section">
                  <div className="homepage-selected-header">
                    <h3>Selected Products</h3>

                    <span>{selectedProductData.length}</span>
                  </div>

                  <div className="homepage-selected-list">
                    {selectedProductData.map((product, index) => (
                      <div className="homepage-selected-item" key={product._id}>
                        <span className="homepage-selected-number">
                          {index + 1}
                        </span>

                        <div className="homepage-selected-item-image">
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

                        <div className="homepage-selected-actions">
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
                            onClick={() => removeSelectedProduct(product._id)}
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

          {/* BANNER */}

          {type === "banner" && (
            <>
              <div className="homepage-section-form-group">
                <label>Select Banners</label>

                <div className="homepage-section-search">
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

              <div className="homepage-section-banner-list">
                {filteredBanners.length === 0 ? (
                  <div className="homepage-section-empty">No banners found</div>
                ) : (
                  filteredBanners.map((banner) => {
                    const selected = isBannerSelected(banner._id);

                    return (
                      <button
                        type="button"
                        className={
                          selected
                            ? "homepage-banner-select-item selected"
                            : "homepage-banner-select-item"
                        }
                        key={banner._id}
                        onClick={() => toggleBanner(banner._id)}
                      >
                        <div className="homepage-banner-select-image">
                          {banner.image ? (
                            <img
                              src={getImageUrl(banner.image)}
                              alt={banner.title || "Banner"}
                            />
                          ) : (
                            <span>No Image</span>
                          )}
                        </div>

                        <div className="homepage-banner-select-info">
                          <strong>{banner.title || "Untitled Banner"}</strong>

                          <span>{banner.type}</span>
                        </div>

                        <div className="homepage-select-check">
                          {selected && <MdCheck />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {selectedBannerData.length > 0 && (
                <div className="homepage-selected-banner">
                  <div className="homepage-selected-header">
                    <h3>Selected Banners</h3>

                    <span>{selectedBannerData.length}</span>
                  </div>

                  <div className="homepage-selected-list">
                    {selectedBannerData.map((banner, index) => (
                      <div className="homepage-selected-item" key={banner._id}>
                        <span className="homepage-selected-number">
                          {index + 1}
                        </span>

                        <div className="homepage-selected-item-image">
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

                        <div className="homepage-selected-actions">
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
                            onClick={() => removeSelectedBanner(banner._id)}
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

          <div className="homepage-section-active-row">
            <div>
              <strong>Active Section</strong>

              <span>Show this section on homepage</span>
            </div>

            <button
              type="button"
              className={
                isActive
                  ? "homepage-section-switch active"
                  : "homepage-section-switch"
              }
              onClick={() => setIsActive(!isActive)}
            >
              <span />
            </button>
          </div>
        </section>

        {/* ACTIONS */}

        <div className="add-homepage-section-actions">
          <button
            type="button"
            className="add-homepage-section-cancel-btn"
            onClick={() => navigate("/homepage-sections")}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="add-homepage-section-save-btn"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Section"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddHomepageSection;
