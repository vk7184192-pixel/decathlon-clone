import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  MdArrowBack,
  MdCloudUpload,
  MdDelete,
} from "react-icons/md";

import toast from "react-hot-toast";

import api from "../../api/axios";
import "../../styles/AddProduct.css";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    stock: "",
    brand: "",
    size: "",
    color: "",
    isActive: true,
  });

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // LOAD PRODUCT + CATEGORIES

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [productResponse, categoryResponse] =
          await Promise.all([
            api.get(`/products/${id}`),
            api.get("/categories"),
          ]);

        const product = productResponse.data.product;

        setCategories(
          categoryResponse.data.categories || []
        );

        // Multi-category extract
        let catIds = [];
        if (Array.isArray(product.categories) && product.categories.length > 0) {
          catIds = product.categories.map((c) => (c._id || c));
        } else if (product.category) {
          catIds = [product.category._id || product.category];
        }
        setSelectedCategories(catIds);

        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price ?? "",
          discountPrice: product.discountPrice ?? "",
          stock: product.stock ?? "",
          brand: product.brand || "",
          size: Array.isArray(product.size)
            ? product.size.join(", ")
            : product.size || "",
          color: Array.isArray(product.color)
            ? product.color.join(", ")
            : product.color || "",
          isActive: product.isActive ?? true,
        });

        setExistingImages(product.images || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleCategoryToggle = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId)
        ? prev.filter((item) => item !== catId)
        : [...prev, catId]
    );
  };

  // INPUT CHANGE

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // NEW IMAGE SELECT

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(
      e.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    if (selectedFiles.length > 5) {
      toast.error(
        "You can select maximum 5 new images"
      );
      e.target.value = "";
      return;
    }

    setNewImages(selectedFiles);

    // Allows selecting same file again later
    e.target.value = "";
  };

  // REMOVE EXISTING IMAGE

  const removeExistingImage = (index) => {
    setExistingImages((prev) =>
      prev.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );

    toast.success("Image removed");
  };

  // REMOVE NEW IMAGE

  const removeNewImage = (index) => {
    setNewImages((prev) =>
      prev.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );
  };

  // SUBMIT

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.price ||
      selectedCategories.length === 0
    ) {
      toast.error(
        "Please fill all required fields and select at least 1 category"
      );
      return;
    }

    if (Number(formData.price) < 0) {
      toast.error("Price cannot be negative");
      return;
    }

    if (
      formData.discountPrice &&
      Number(formData.discountPrice) < 0
    ) {
      toast.error(
        "Discount price cannot be negative"
      );
      return;
    }

    if (Number(formData.stock) < 0) {
      toast.error("Stock cannot be negative");
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();

      data.append(
        "name",
        formData.name.trim()
      );

      data.append(
        "description",
        formData.description.trim()
      );

      data.append(
        "price",
        formData.price
      );

      data.append(
        "discountPrice",
        formData.discountPrice || 0
      );

      selectedCategories.forEach((catId) => {
        data.append("categories", catId);
      });
      data.append("category", selectedCategories[0]);

      data.append(
        "stock",
        formData.stock || 0
      );

      data.append(
        "brand",
        formData.brand.trim()
      );

      data.append(
        "isActive",
        String(formData.isActive)
      );

      data.append(
        "stock",
        formData.stock || 0
      );

      data.append(
        "brand",
        formData.brand.trim()
      );

      data.append(
        "isActive",
        String(formData.isActive)
      );

      // SIZE

      if (formData.size.trim()) {
        formData.size
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .forEach((item) => {
            data.append("size", item);
          });
      }

      // COLOR

      if (formData.color.trim()) {
        formData.color
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .forEach((item) => {
            data.append("color", item);
          });
      }

      // EXISTING IMAGES

      data.append(
        "existingImages",
        JSON.stringify(existingImages)
      );

      // NEW IMAGES

      newImages.forEach((image) => {
        data.append(
          "images",
          image
        );
      });

      // API

      await api.put(
        `/products/${id}`,
        data
      );

      toast.success(
        "Product updated successfully"
      );

      setTimeout(() => {
        navigate("/products");
      }, 1000);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update product"
      );
    } finally {
      setSaving(false);
    }
  };

  // LOADING

  if (loading) {
    return (
      <div className="products-loading">
        Loading product...
      </div>
    );
  }

  // UI

  return (
    <div className="add-product-page">

      {/* HEADER */}
      <div className="add-product-header">

        <button
          type="button"
          className="back-btn"
          onClick={() =>
            navigate("/products")
          }
        >
          <MdArrowBack />
          Back
        </button>

        <div>
          <h1>Edit Product</h1>

          <p>
            Update product details
          </p>
        </div>

      </div>

      {/* FORM */}
      <form
        className="add-product-form"
        onSubmit={handleSubmit}
      >

        {/* BASIC INFORMATION */}

        <section className="form-section">

          <div className="section-title">
            <h2>
              Basic Information
            </h2>
          </div>

          <div className="form-grid">

            {/* NAME */}
            <div className="form-group full-width">

              <label>
                Product Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
              />

            </div>

            {/* DESCRIPTION */}
            <div className="form-group full-width">

              <label>
                Description *
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows="5"
              />

            </div>

            {/* PRICE */}
            <div className="form-group">

              <label>
                Price *
              </label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                placeholder="1999"
              />

            </div>

            {/* DISCOUNT PRICE */}
            <div className="form-group">

              <label>
                Discount Price
              </label>

              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                min="0"
                placeholder="1499"
              />

            </div>

            {/* CATEGORIES (MULTI-SELECT) */}

            <div className="form-group full-width">

              <label>
                Categories * (Select one or more)
              </label>

              {categories.length === 0 ? (
                <p className="no-categories-text">No categories found.</p>
              ) : (
                <div className="category-checkboxes">
                  {categories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat._id);
                    return (
                      <label
                        key={cat._id}
                        className={`category-pill ${isSelected ? "selected" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleCategoryToggle(cat._id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                        />
                        <span>{cat.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}

            </div>

            {/* STOCK */}
            <div className="form-group">

              <label>
                Stock *
              </label>

              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                placeholder="50"
              />

            </div>

            {/* BRAND */}
            <div className="form-group">

              <label>
                Brand
              </label>

              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Kalenji"
              />

            </div>

            {/* SIZE */}
            <div className="form-group">

              <label>
                Size
              </label>

              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="S, M, L, XL"
              />

              <small>
                Separate sizes with commas
              </small>

            </div>

            {/* COLOR */}
            <div className="form-group full-width">

              <label>
                Color
              </label>

              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="Black, Blue, White"
              />

              <small>
                Separate colors with commas
              </small>

            </div>

            {/* ACTIVE */}
            <div className="form-group">

              <label className="active-checkbox">

                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />

                <span>
                  Product Active
                </span>

              </label>

            </div>

          </div>

        </section>

        {/* EXISTING IMAGES */}

        <section className="form-section">

          <div className="section-title">

            <h2>
              Existing Images
            </h2>

            <span>
              {existingImages.length} image
              {existingImages.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          {existingImages.length > 0 ? (

            <div className="image-preview-grid">

              {existingImages.map(
                (image, index) => (

                  <div
                    className="image-preview"
                    key={`${image}-${index}`}
                  >

                    <img
                      src={getImageUrl(image)}
                      alt={`Product ${index + 1}`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeExistingImage(
                          index
                        )
                      }
                      title="Remove image"
                    >
                      <MdDelete />
                    </button>

                  </div>

                )
              )}

            </div>

          ) : (

            <p className="no-existing-images">
              No existing images
            </p>

          )}

        </section>

        {/* NEW IMAGES */}

        <section className="form-section">

          <div className="section-title">

            <h2>
              Add New Images
            </h2>

            <span>
              Maximum 5 images
            </span>

          </div>

          <label className="upload-box">

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={
                handleImageChange
              }
            />

            <MdCloudUpload />

            <strong>
              Upload New Images
            </strong>

            <span>
              JPG, PNG or WEBP
            </span>

          </label>

          {newImages.length > 0 && (

            <div className="image-preview-grid">

              {newImages.map(
                (image, index) => (

                  <div
                    className="image-preview"
                    key={`${image.name}-${index}`}
                  >

                    <img
                      src={URL.createObjectURL(
                        image
                      )}
                      alt={`New ${index + 1}`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeNewImage(
                          index
                        )
                      }
                      title="Remove image"
                    >
                      <MdDelete />
                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* ACTIONS */}

        <div className="form-actions">

          <button
            type="button"
            className="cancel-product-btn"
            onClick={() =>
              navigate("/products")
            }
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-product-btn"
            disabled={saving}
          >
            {saving
              ? "Updating..."
              : "Save Changes"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default EditProduct;