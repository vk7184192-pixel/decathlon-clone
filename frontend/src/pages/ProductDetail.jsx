import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiStar,
  FiCheck,
  FiTruck,
  FiShoppingBag,
  FiShield,
  FiRotateCcw,
  FiWind,
  FiDroplet,
  FiLayers,
  FiX,
  FiChevronRight,
  FiChevronLeft,
  FiPlus,
  FiMinus,
  FiMapPin,
} from "react-icons/fi";
import { MdFavorite, MdFavoriteBorder, MdStraighten } from "react-icons/md";
import toast from "react-hot-toast";

import api, { useWishlist } from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/home/Footer";
import "../styles/ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isWishlisted, handleToggle } = useWishlist();

  // Component states
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Delivery / Pincode
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState(null); // 'valid' | 'invalid'

  // Size chart modal
  const [showSizeModal, setShowSizeModal] = useState(false);

  // Similar Products & Frequently Bought
  const [categoryProducts, setCategoryProducts] = useState([]);

  const similarSliderRef = useRef(null);

  // Format price
  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
  };

  // Helper for image URLs
  const getImageUrl = (image) => {
    if (!image) return "";
    if (
      typeof image === "string" &&
      (image.startsWith("http://") || image.startsWith("https://"))
    ) {
      return image;
    }
    const apiBaseUrl = api.defaults.baseURL || "";
    const backendUrl = apiBaseUrl.replace(/\/api\/?$/, "");
    if (image.startsWith("/uploads/")) return `${backendUrl}${image}`;
    if (image.startsWith("uploads/")) return `${backendUrl}/${image}`;
    return `${backendUrl}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  // Scroll to top on id change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/products/${id}`);
        const prod = response.data?.product;

        if (!prod) {
          setError("Product not found");
          return;
        }

        setProduct(prod);
        setActiveImageIndex(0);

        // Pre-select first color & size if available
        if (Array.isArray(prod.color) && prod.color.length > 0) {
          setSelectedColor(prod.color[0]);
        } else {
          setSelectedColor("");
        }

        if (Array.isArray(prod.size) && prod.size.length > 0) {
          setSelectedSize(prod.size[0]);
        } else {
          setSelectedSize("");
        }
        setQuantity(1);
      } catch (err) {
        console.error("Fetch Product Detail Error:", err);
        setError(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Fetch Category-based Similar Products
  useEffect(() => {
    const fetchRelated = async () => {
      if (!product) return;

      const categoryId =
        product.category?._id ||
        (Array.isArray(product.categories) && product.categories[0]?._id) ||
        product.category;

      if (!categoryId) return;

      try {
        const res = await api.get(`/products?category=${categoryId}&limit=10`);
        const prods = (res.data?.products || []).filter(
          (p) => String(p._id) !== String(product._id)
        );
        setCategoryProducts(prods);
      } catch (err) {
        console.error("Fetch Related Products Error:", err);
      }
    };

    fetchRelated();
  }, [product]);

  // Pricing calculations
  const currentPrice = useMemo(() => {
    if (!product) return 0;
    return product.discountPrice && product.discountPrice < product.price
      ? product.discountPrice
      : product.price;
  }, [product]);

  const originalPrice = useMemo(() => {
    if (!product) return 0;
    return product.price || 0;
  }, [product]);

  const discountPercent = useMemo(() => {
    if (!originalPrice || currentPrice >= originalPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }, [currentPrice, originalPrice]);

  // Pincode validation & delivery date calculation
  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length !== 6 || isNaN(pincode)) {
      toast.error("Please enter a valid 6-digit Pincode");
      setPincodeStatus("invalid");
      return;
    }
    setPincodeStatus("valid");
    toast.success("Delivery is available for this pincode!");
  };

  const deliveryDateString = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Add to Cart
  const handleAddToCart = async () => {
    if (!product) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    const sizes = Array.isArray(product.size) ? product.size : [];
    if (sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    try {
      setAddingToCart(true);

      const response = await api.post(
        "/cart",
        {
          productId: product._id,
          quantity: Number(quantity),
          size: selectedSize || "",
          color: selectedColor || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data?.message || "Added to cart successfully!");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Add to cart error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired, please login again");
        navigate("/login");
        return;
      }
      toast.error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  // Scroll Similar Products
  const scrollSimilar = (direction) => {
    if (!similarSliderRef.current) return;
    const container = similarSliderRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  // Frequently Bought Together combo items
  const bundleItems = useMemo(() => {
    if (!product || !categoryProducts.length) return [];
    return categoryProducts.slice(0, 2);
  }, [product, categoryProducts]);

  const bundleTotalPrice = useMemo(() => {
    if (!product) return 0;
    const itemsTotal = bundleItems.reduce(
      (sum, item) => sum + (item.discountPrice || item.price || 0),
      0
    );
    return currentPrice + itemsTotal;
  }, [product, currentPrice, bundleItems]);

  const handleAddBundle = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      setAddingToCart(true);
      // Add main product
      await api.post("/cart", {
        productId: product._id,
        quantity: 1,
        size: selectedSize || (product.size?.[0] || ""),
        color: selectedColor || (product.color?.[0] || ""),
      });

      // Add bundle products
      for (const item of bundleItems) {
        await api.post("/cart", {
          productId: item._id,
          quantity: 1,
          size: item.size?.[0] || "",
          color: item.color?.[0] || "",
        });
      }

      toast.success("Bundle added to cart successfully!");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      toast.error("Failed to add bundle to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <div className="product-detail-container">
          <div
            style={{
              minHeight: "450px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              color: "#666",
            }}
          >
            Loading product details...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <div className="product-detail-container">
          <div
            style={{
              minHeight: "450px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
            }}
          >
            <h2>{error || "Product Not Found"}</h2>
            <Link
              to="/"
              style={{
                color: "#0082c3",
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              Return to Homepage
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [""];

  return (
    <div className="product-detail-page">
      <Navbar />

      <main className="product-detail-container">
        {/* =====================================================
            BREADCRUMBS
        ===================================================== */}
        <nav className="pdp-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="separator">/</span>
          {product.category?.name ? (
            <>
              <Link to={`/monsoon-essentials`}>{product.category.name}</Link>
              <span className="separator">/</span>
            </>
          ) : (
            <>
              <Link to="/monsoon-essentials">Category</Link>
              <span className="separator">/</span>
            </>
          )}
          <span className="current">{product.name}</span>
        </nav>

        {/* =====================================================
            MAIN PRODUCT SECTION (LEFT GALLERY + RIGHT ACTIONS)
        ===================================================== */}
        <div className="pdp-main-grid">
          {/* LEFT: IMAGE GALLERY */}
          <div className="pdp-gallery-wrapper">
            {images.length > 1 && (
              <div className="pdp-thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`pdp-thumb-btn ${
                      activeImageIndex === idx ? "active" : ""
                    }`}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="pdp-main-image-frame">
              {product.stock <= 5 && product.stock > 0 && (
                <span className="pdp-badge-stock">
                  Limited stock ({product.stock} left)
                </span>
              )}
              {discountPercent > 0 && (
                <span className="pdp-badge-offer">{discountPercent}% OFF</span>
              )}

              <img
                src={getImageUrl(images[activeImageIndex])}
                alt={product.name}
              />
            </div>
          </div>

          {/* RIGHT: DETAILS, OPTIONS, CTA */}
          <div className="pdp-info-wrapper">
            <span className="pdp-brand-tag">
              {product.brand || "Decathlon"}
            </span>

            <h1 className="pdp-title">{product.name}</h1>

            {/* Rating Summary */}
            <div className="pdp-rating-row">
              <div className="pdp-rating-badge">
                <FiStar />
                <span>4.6</span>
              </div>
              <a href="#customer-reviews" className="pdp-rating-reviews">
                1,624 reviews & ratings
              </a>
            </div>

            {/* Price Section */}
            <div className="pdp-price-section">
              <span className="pdp-current-price">
                {formatPrice(currentPrice)}
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="pdp-mrp">MRP {formatPrice(originalPrice)}</span>
                  <span className="pdp-savings-badge">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>
            <span className="pdp-tax-note">Inclusive of all taxes</span>

            {/* Colour selection */}
            {Array.isArray(product.color) && product.color.length > 0 && (
              <div className="pdp-option-section">
                <div className="pdp-option-header">
                  <span className="pdp-option-label">
                    Colour:
                    <span className="pdp-option-value">
                      {selectedColor || "Select color"}
                    </span>
                  </span>
                </div>

                <div className="pdp-colors-list">
                  {product.color.map((color, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`pdp-color-chip ${
                        selectedColor === color ? "active" : ""
                      }`}
                      onClick={() => setSelectedColor(color)}
                    >
                      <span
                        className="pdp-color-dot"
                        style={{
                          backgroundColor:
                            color.toLowerCase() === "white"
                              ? "#ffffff"
                              : color.toLowerCase(),
                        }}
                      />
                      <span>{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {Array.isArray(product.size) && product.size.length > 0 && (
              <div className="pdp-option-section">
                <div className="pdp-option-header">
                  <span className="pdp-option-label">
                    Select Size:
                    <span className="pdp-option-value">
                      {selectedSize || "Please select"}
                    </span>
                  </span>

                  <button
                    type="button"
                    className="pdp-size-guide-btn"
                    onClick={() => setShowSizeModal(true)}
                  >
                    <MdStraighten />
                    <span>Size guide</span>
                  </button>
                </div>

                <div className="pdp-sizes-list">
                  {product.size.map((sz, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`pdp-size-pill ${
                        selectedSize === sz ? "active" : ""
                      }`}
                      onClick={() => setSelectedSize(sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="pdp-actions-row">
              <div className="pdp-quantity-selector">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <FiMinus />
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={product.stock > 0 && quantity >= product.stock}
                  aria-label="Increase quantity"
                >
                  <FiPlus />
                </button>
              </div>

              <button
                type="button"
                className="pdp-add-cart-btn"
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
              >
                <FiShoppingBag />
                <span>
                  {product.stock === 0
                    ? "Out of Stock"
                    : addingToCart
                    ? "Adding..."
                    : "Add to Cart"}
                </span>
              </button>

              <button
                type="button"
                className={`pdp-wishlist-btn ${
                  isWishlisted(product._id) ? "active" : ""
                }`}
                onClick={() => handleToggle(product._id)}
                aria-label="Save to Wishlist"
              >
                {isWishlisted(product._id) ? (
                  <MdFavorite />
                ) : (
                  <MdFavoriteBorder />
                )}
              </button>
            </div>

            {/* Decathlon Guarantees */}
            <div className="pdp-guarantee-row">
              <div className="pdp-guarantee-item">
                <FiShield />
                <div>
                  <strong>2 Years Warranty</strong>
                  <span>On all technical defects</span>
                </div>
              </div>

              <div className="pdp-guarantee-item">
                <FiRotateCcw />
                <div>
                  <strong>30 Days Easy Return</strong>
                  <span>Free doorstep returns</span>
                </div>
              </div>
            </div>

            {/* Delivery & Services Pincode Checker */}
            <div className="pdp-delivery-box">
              <div className="pdp-delivery-title">
                <FiMapPin />
                <span>Check Delivery & Store Pickup</span>
              </div>

              <form
                className="pdp-pincode-input-row"
                onSubmit={handleCheckPincode}
              >
                <input
                  type="text"
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, ""));
                    setPincodeStatus(null);
                  }}
                />
                <button type="submit">Check</button>
              </form>

              <div className="pdp-service-perks">
                <div className="pdp-service-perk-item">
                  <FiTruck />
                  <span>
                    {pincodeStatus === "valid"
                      ? `Standard Delivery by ${deliveryDateString}`
                      : "Delivery available across India in 3-5 days"}
                  </span>
                </div>

                <div className="pdp-service-perk-item">
                  <FiCheck />
                  <span>Free Store Pickup available in 2 hours</span>
                </div>

                <div className="pdp-service-perk-item">
                  <FiCheck />
                  <span>Pay on Delivery (Cash / UPI) accepted</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            PRODUCT BENEFITS (Pockets, Ventilation, Moisture, etc.)
        ===================================================== */}
        <section className="pdp-section-block">
          <h3 className="pdp-section-heading">Product Benefits</h3>

          <div className="pdp-benefits-grid">
            <div className="pdp-benefit-card">
              <div className="pdp-benefit-icon">
                <FiLayers />
              </div>
              <h4>Ergonomic Pockets</h4>
              <p>
                Equipped with deep, weather-resistant zipped pockets to keep your
                smartphone, keys, and gear completely secure while moving.
              </p>
            </div>

            <div className="pdp-benefit-card">
              <div className="pdp-benefit-icon">
                <FiWind />
              </div>
              <h4>Ventilation & Airflow</h4>
              <p>
                Integrated laser-cut ventilation zones promote constant air
                circulation, preventing overheating during intense physical
                activity.
              </p>
            </div>

            <div className="pdp-benefit-card">
              <div className="pdp-benefit-icon">
                <FiDroplet />
              </div>
              <h4>Moisture Management</h4>
              <p>
                Hydrophobic technical weave wicks sweat away from the skin,
                drying 2x faster than regular cotton fabrics.
              </p>
            </div>

            <div className="pdp-benefit-card">
              <div className="pdp-benefit-icon">
                <FiShield />
              </div>
              <h4>Abrasion Resistance</h4>
              <p>
                Ripstop fabric structure tested through 20,000 friction cycles
                to guarantee long-lasting durability on trails.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            PRODUCT DETAILS / SPECIFICATIONS / TECHNICAL INFO
        ===================================================== */}
        <section className="pdp-section-block">
          <h3 className="pdp-section-heading">
            Product Details & Specifications
          </h3>

          <div className="pdp-specs-grid">
            <div className="pdp-spec-box">
              <h4>Product Description</h4>
              <p className="pdp-description-text">
                {product.description ||
                  "Engineered and rigorously tested by Decathlon sports experts for maximum comfort, durability, and performance under diverse environmental conditions."}
              </p>

              <table className="pdp-spec-table">
                <tbody>
                  <tr>
                    <td className="label">Brand</td>
                    <td className="val">{product.brand || "Decathlon"}</td>
                  </tr>
                  <tr>
                    <td className="label">Category</td>
                    <td className="val">
                      {product.category?.name || "Outdoor & Sports"}
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Stock Status</td>
                    <td className="val">
                      {product.stock > 0
                        ? `In Stock (${product.stock} units)`
                        : "Out of Stock"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pdp-spec-box">
              <h4>Technical Specifications</h4>
              <table className="pdp-spec-table">
                <tbody>
                  <tr>
                    <td className="label">Main Fabric</td>
                    <td className="val">100% Recycled Polyester / Polyamide</td>
                  </tr>
                  <tr>
                    <td className="label">Waterproof Rating</td>
                    <td className="val">5,000 mm Schmerber rating</td>
                  </tr>
                  <tr>
                    <td className="label">Breathability</td>
                    <td className="val">RET = 12 (Very breathable)</td>
                  </tr>
                  <tr>
                    <td className="label">Care Instructions</td>
                    <td className="val">
                      Machine wash at 30°C. Do not dry clean or tumble dry.
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Warranty</td>
                    <td className="val">2 Years Decathlon Guarantee</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* =====================================================
            FREQUENTLY BOUGHT TOGETHER (BUNDLE)
        ===================================================== */}
        {bundleItems.length > 0 && (
          <section className="pdp-section-block">
            <h3 className="pdp-section-heading">Frequently Bought Together</h3>

            <div className="pdp-bundle-card">
              <div className="pdp-bundle-items">
                {/* Current Product */}
                <div className="pdp-bundle-item">
                  <img
                    src={getImageUrl(images[0])}
                    alt={product.name}
                  />
                  <span>This item</span>
                  <strong>{formatPrice(currentPrice)}</strong>
                </div>

                {bundleItems.map((item, idx) => (
                  <React.Fragment key={item._id || idx}>
                    <span className="pdp-bundle-plus">+</span>
                    <div className="pdp-bundle-item">
                      <Link to={`/product/${item._id}`}>
                        <img
                          src={getImageUrl(item.images?.[0])}
                          alt={item.name}
                        />
                        <span>{item.name}</span>
                        <strong>
                          {formatPrice(item.discountPrice || item.price)}
                        </strong>
                      </Link>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              <div className="pdp-bundle-action">
                <div className="pdp-bundle-total">
                  Total bundle price:
                  <strong>{formatPrice(bundleTotalPrice)}</strong>
                </div>
                <button
                  type="button"
                  className="pdp-bundle-btn"
                  onClick={handleAddBundle}
                  disabled={addingToCart}
                >
                  Add all to Cart
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            SIMILAR PRODUCTS (CATEGORY-BASED API SLIDER)
        ===================================================== */}
        {categoryProducts.length > 0 && (
          <section className="pdp-section-block">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 className="pdp-section-heading" style={{ margin: 0 }}>
                Similar Products in {product.category?.name || "Category"}
              </h3>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="section-arrow"
                  onClick={() => scrollSimilar("prev")}
                  aria-label="Scroll left"
                >
                  <FiChevronLeft />
                </button>
                <button
                  type="button"
                  className="section-arrow"
                  onClick={() => scrollSimilar("next")}
                  aria-label="Scroll right"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>

            <div className="pdp-similar-slider-container">
              <div className="pdp-similar-slider" ref={similarSliderRef}>
                {categoryProducts.map((simProd) => (
                  <Link
                    key={simProd._id}
                    to={`/product/${simProd._id}`}
                    className="pdp-similar-card"
                  >
                    <div className="pdp-similar-img">
                      <img
                        src={getImageUrl(simProd.images?.[0])}
                        alt={simProd.name}
                      />
                    </div>
                    <div className="pdp-similar-info">
                      <h5>{simProd.name}</h5>
                      <div className="pdp-similar-price">
                        {formatPrice(simProd.discountPrice || simProd.price)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            CUSTOMER REVIEWS
        ===================================================== */}
        <section className="pdp-section-block" id="customer-reviews">
          <h3 className="pdp-section-heading">Customer Reviews</h3>

          <div className="pdp-reviews-overview">
            <div className="pdp-rating-big-score">
              <h2>4.6</h2>
              <div className="pdp-rating-stars-gold">★★★★★</div>
              <p>Based on 1,624 customer ratings</p>
            </div>

            <div className="pdp-rating-bars">
              <div className="pdp-bar-row">
                <span>5★</span>
                <div className="pdp-bar-bg">
                  <div className="pdp-bar-fill" style={{ width: "78%" }} />
                </div>
                <span>78%</span>
              </div>

              <div className="pdp-bar-row">
                <span>4★</span>
                <div className="pdp-bar-bg">
                  <div className="pdp-bar-fill" style={{ width: "15%" }} />
                </div>
                <span>15%</span>
              </div>

              <div className="pdp-bar-row">
                <span>3★</span>
                <div className="pdp-bar-bg">
                  <div className="pdp-bar-fill" style={{ width: "4%" }} />
                </div>
                <span>4%</span>
              </div>

              <div className="pdp-bar-row">
                <span>2★</span>
                <div className="pdp-bar-bg">
                  <div className="pdp-bar-fill" style={{ width: "2%" }} />
                </div>
                <span>2%</span>
              </div>

              <div className="pdp-bar-row">
                <span>1★</span>
                <div className="pdp-bar-bg">
                  <div className="pdp-bar-fill" style={{ width: "1%" }} />
                </div>
                <span>1%</span>
              </div>
            </div>

            <div className="pdp-fit-gauge">
              <strong>Fit Feedback</strong>
              <span>True to Size (89%)</span>
              <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#666" }}>
                Customers report standard regular fit.
              </p>
            </div>
          </div>

          {/* Sample Verified Reviews */}
          <div className="pdp-review-list">
            <div className="pdp-review-card">
              <div className="pdp-review-header">
                <div className="pdp-reviewer-name">
                  <span>Rohit M.</span>
                  <span className="pdp-verified-tag">Verified Buyer</span>
                </div>
                <span className="pdp-review-date">Reviewed 2 weeks ago</span>
              </div>
              <div style={{ color: "#ff7900", fontSize: "14px" }}>★★★★★</div>
              <p>
                Outstanding quality for the price! Tested during heavy monsoon
                downpours in Western Ghats and stayed completely dry. The pockets
                are deep and the hood stays firmly on in windy conditions.
              </p>
            </div>

            <div className="pdp-review-card">
              <div className="pdp-review-header">
                <div className="pdp-reviewer-name">
                  <span>Sneha K.</span>
                  <span className="pdp-verified-tag">Verified Buyer</span>
                </div>
                <span className="pdp-review-date">Reviewed 1 month ago</span>
              </div>
              <div style={{ color: "#ff7900", fontSize: "14px" }}>★★★★★</div>
              <p>
                Lightweight and packs down very small in my backpack. Color matches
                the pictures perfectly. Size M was true to size with room for a
                fleece inside.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          SIZE CHART MODAL
      ===================================================== */}
      {showSizeModal && (
        <div
          className="pdp-modal-overlay"
          onClick={() => setShowSizeModal(false)}
        >
          <div
            className="pdp-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="pdp-modal-close-btn"
              onClick={() => setShowSizeModal(false)}
              aria-label="Close modal"
            >
              <FiX />
            </button>

            <h3 style={{ margin: "0 0 8px", fontSize: "20px" }}>
              Decathlon Standard Size Guide
            </h3>
            <p style={{ color: "#666", fontSize: "13px", margin: "0 0 16px" }}>
              All measurements are indicated in centimeters (cm).
            </p>

            <table className="pdp-size-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest (cm)</th>
                  <th>Waist (cm)</th>
                  <th>Hips (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>S</strong></td>
                  <td>88 - 91</td>
                  <td>74 - 77</td>
                  <td>88 - 91</td>
                </tr>
                <tr>
                  <td><strong>M</strong></td>
                  <td>92 - 95</td>
                  <td>78 - 81</td>
                  <td>92 - 95</td>
                </tr>
                <tr>
                  <td><strong>L</strong></td>
                  <td>100 - 103</td>
                  <td>86 - 89</td>
                  <td>100 - 103</td>
                </tr>
                <tr>
                  <td><strong>XL</strong></td>
                  <td>108 - 113</td>
                  <td>96 - 100</td>
                  <td>108 - 113</td>
                </tr>
                <tr>
                  <td><strong>2XL</strong></td>
                  <td>116 - 121</td>
                  <td>104 - 109</td>
                  <td>116 - 121</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetail;
