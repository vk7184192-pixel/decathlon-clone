import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import toast from "react-hot-toast";

import Navbar from "../components/Navbar";
import CategoryNav from "../components/home/CategoryNav";
import Footer from "../components/home/Footer";
import ProductSizeModal from "../components/ProductSizeModal";
import { useWishlist } from "../utils/useWishlist";
import api from "../api/axios";

import "../styles/CategoryPage.css";
import "../styles/ProductSizeModal.css";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const { isWishlisted, handleToggle: toggleWishlistIcon } = useWishlist();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // PRODUCT SIZE MODAL STATES
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // CAROUSEL STATES
  const [prodSlideIndex, setProdSlideIndex] = useState(0);

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

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. FETCH ALL CATEGORIES FOR SUB-NAV / QUICK LIST
      const catRes = await api.get("/categories");
      const allCats = catRes.data?.categories || [];

      // 2. FIND ACTIVE CATEGORY
      const currentCat = allCats.find((c) => String(c._id) === String(categoryId)) || allCats[0];
      setCategory(currentCat);

      // 3. FETCH PRODUCTS FOR CATEGORY
      const targetId = categoryId || currentCat?._id;
      if (targetId) {
        const prodRes = await api.get(`/products?category=${targetId}&limit=20`);
        setProducts(prodRes.data?.products || []);
      }
    } catch (error) {
      console.error("Fetch Category Page Error:", error);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [fetchData]);

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
  };

  const handleCloseModal = () => {
    if (adding) return;
    setSelectedProduct(null);
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    const sizes = Array.isArray(selectedProduct.size) ? selectedProduct.size : [];
    if (sizes.length > 0 && !selectedSize) {
      toast.warning("Please select a size");
      return;
    }

    if (!quantity || Number(quantity) < 1) {
      toast.warning("Quantity must be at least 1");
      return;
    }

    try {
      setAdding(true);
      const response = await api.post(
        "/cart",
        {
          productId: selectedProduct._id,
          quantity: Number(quantity),
          size: selectedSize || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response?.data?.message || "Product added to cart");
      window.dispatchEvent(new Event("cartUpdated"));

      setSelectedProduct(null);
      setSelectedSize("");
      setSelectedColor("");
      setQuantity(1);
    } catch (error) {
      console.error("ADD TO CART ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to add product to cart");
    } finally {
      setAdding(false);
    }
  };

  // MEN'S COLLECTION CIRCULAR TILES (ACTIVEWEAR STORE PDF PAGE 1)
  const mensCollection = [
    { title: "Jackets", img: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=400&q=80" },
    { title: "Trackpants", img: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&q=80" },
    { title: "Trousers", img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80" },
    { title: "T-shirt", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80" },
    { title: "Caps", img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80" },
    { title: "Polo Shirt", img: "https://images.unsplash.com/photo-1625910513413-7fc21e344675?w=400&q=80" },
    { title: "Shoes", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
    { title: "Sunglasses", img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80" },
  ];

  // WOMEN'S COLLECTION CIRCULAR TILES (ACTIVEWEAR STORE PDF PAGE 1)
  const womensCollection = [
    { title: "T-shirt", img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&q=80" },
    { title: "Leggings", img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80" },
    { title: "Trackpants", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80" },
    { title: "Jackets", img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=400&q=80" },
    { title: "Shoes", img: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&q=80" },
    { title: "Sunglasses", img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80" },
    { title: "Bags", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80" },
    { title: "Shorts", img: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80" },
  ];

  // STYLE THAT WORKS HARD GRID (ACTIVEWEAR STORE PDF PAGE 2)
  const styleGrid = [
    { title: "Shirts", img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80" },
    { title: "Chinos", img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80" },
    { title: "Shoes", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80" },
    { title: "Hoodies", img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80" },
  ];

  const maxProdSlide = Math.max(products.length - 4, 0);

  return (
    <div className="category-shop-page">
      <Navbar />
      <CategoryNav />

      {/* BREADCRUMB HEADER */}
      <div className="category-page-header">
        <div className="category-breadcrumbs">
          <Link to="/">Home</Link> / <span>{category?.name || "Activewear Store"}</span>
        </div>
        <h1 className="category-page-title">{category?.name || "Apparels & Activewear Store"}</h1>
      </div>

      <div className="category-shop-container">
        {/* 1. MEN'S COLLECTION ROUND TILES (PDF PAGE 1) */}
        <section className="cat-round-collection-section">
          <h2 className="cat-section-heading">Men's Collection</h2>
          <div className="cat-round-icon-row">
            {mensCollection.map((tile, idx) => (
              <div className="cat-round-card" key={idx}>
                <div className="cat-round-circle">
                  <img src={tile.img} alt={tile.title} />
                </div>
                <span>{tile.title}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. HERO FEATURED APPAREL BANNER (PDF PAGE 1) */}
        <section className="category-hero-banner apparel-banner">
          <div className="cat-banner-bg">
            <img
              src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1400&q=80"
              alt="Comfort That Lasts Banner"
            />
          </div>
          <div className="cat-banner-overlay apparel-overlay">
            <h2>Comfort That Lasts</h2>
            <p>Lightweight fabrics. Effortless movement. All-day ease.</p>
            <button type="button" className="cat-shop-now-btn">
              Shop Now
            </button>
          </div>
        </section>

        {/* 3. WOMEN'S COLLECTION ROUND TILES (PDF PAGE 1) */}
        <section className="cat-round-collection-section">
          <h2 className="cat-section-heading">Women's Collection</h2>
          <div className="cat-round-icon-row">
            {womensCollection.map((tile, idx) => (
              <div className="cat-round-card" key={idx}>
                <div className="cat-round-circle">
                  <img src={tile.img} alt={tile.title} />
                </div>
                <span>{tile.title}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. PROMO OFFER DEALS CAROUSEL (PDF PAGE 2) */}
        <section className="cat-offer-carousel-section">
          <div className="cat-offer-promo-box">
            <span className="promo-tag">Buy any 2 products</span>
            <h3>Get ₹200/- off</h3>
          </div>

          <div className="cat-offer-products-wrapper">
            <div className="cat-products-viewport">
              <div className="cat-products-track">
                {products.slice(0, 5).map((prod) => (
                  <div className="cat-product-card" key={prod._id}>
                    <div className="cat-prod-img-wrapper">
                      <span className="cat-prod-badge">New arrival</span>
                      {prod.images?.[0] ? (
                        <img src={getImageUrl(prod.images[0])} alt={prod.name} />
                      ) : (
                        <div className="cat-prod-no-img">No Image</div>
                      )}
                    </div>

                    <div className="cat-prod-info">
                      <div className="cat-prod-title">
                        <strong>{prod.brand || "KIPRUN"}</strong> {prod.name}
                      </div>

                      <div className="cat-prod-rating">
                        <span className="stars">★★★★★</span>
                        <span className="count">{prod.reviews || "7.6k"}</span>
                      </div>

                      <div className="cat-prod-price-row">
                        <strong className="current-price">
                          {formatPrice(prod.discountPrice || prod.price)}
                        </strong>
                      </div>

                      <div className="offer-subtext-pill">
                        Buy 1 @ {prod.price || 799} Buy 2 @ {(prod.price || 799) * 2 - 200}
                      </div>

                      <div className="cat-prod-actions">
                        <button
                          type="button"
                          className={`cat-wishlist-btn ${isWishlisted(prod._id) ? "active" : ""}`}
                          onClick={() => toggleWishlistIcon(prod._id)}
                        >
                          {isWishlisted(prod._id) ? "♥" : "♡"}
                        </button>
                        <button
                          type="button"
                          className="cat-add-btn"
                          onClick={() => handleOpenModal(prod)}
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. STYLE THAT WORKS HARD GRID (PDF PAGE 2) */}
        <section className="cat-showcase-section">
          <h2 className="cat-section-heading">Style That Works Hard</h2>
          <div className="cat-style-grid">
            {styleGrid.map((item, idx) => (
              <div className="cat-style-card" key={idx}>
                <img src={item.img} alt={item.title} />
                <div className="cat-style-title-overlay">
                  <span>{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. PRODUCTS CAROUSEL / COLLECTION (PDF PAGE 2 & 5) */}
        <section className="cat-products-section">
          <div className="cat-products-header">
            <h2>{category?.name || "Activewear"} Collection</h2>
            {products.length > 4 && (
              <div className="cat-slider-arrows">
                <button
                  type="button"
                  onClick={() => setProdSlideIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={prodSlideIndex === 0}
                >
                  <FiChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={() => setProdSlideIndex((prev) => Math.min(prev + 1, maxProdSlide))}
                  disabled={prodSlideIndex === maxProdSlide}
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="cat-products-loading">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="cat-products-empty">No products available in this category.</div>
          ) : (
            <div className="cat-products-viewport">
              <div
                className="cat-products-track"
                style={{
                  transform: `translateX(-${prodSlideIndex * 25}%)`,
                }}
              >
                {products.map((prod) => (
                  <div className="cat-product-card" key={prod._id}>
                    <div className="cat-prod-img-wrapper">
                      {prod.discountPrice > 0 && <span className="cat-prod-badge">Sale</span>}
                      {prod.images?.[0] ? (
                        <img src={getImageUrl(prod.images[0])} alt={prod.name} />
                      ) : (
                        <div className="cat-prod-no-img">No Image</div>
                      )}
                    </div>

                    <div className="cat-prod-info">
                      <div className="cat-prod-title">
                        <strong>{prod.brand || "QUECHUA"}</strong> {prod.name}
                      </div>

                      <div className="cat-prod-rating">
                        <span className="stars">★★★★★</span>
                        <span className="count">{prod.reviews || "1.6k"}</span>
                      </div>

                      <div className="cat-prod-price-row">
                        <strong className="current-price">
                          {formatPrice(prod.discountPrice || prod.price)}
                        </strong>
                        {prod.discountPrice > 0 && prod.price > prod.discountPrice && (
                          <span className="discount-badge">
                            {Math.round(((prod.price - prod.discountPrice) / prod.price) * 100)}% off
                          </span>
                        )}
                      </div>

                      {prod.price > (prod.discountPrice || 0) && prod.discountPrice > 0 && (
                        <div className="mrp-text">MRP {formatPrice(prod.price)}</div>
                      )}

                      <div className="cat-prod-actions">
                        <button
                          type="button"
                          className={`cat-wishlist-btn ${isWishlisted(prod._id) ? "active" : ""}`}
                          onClick={() => toggleWishlistIcon(prod._id)}
                        >
                          {isWishlisted(prod._id) ? "♥" : "♡"}
                        </button>
                        <button
                          type="button"
                          className="cat-add-btn"
                          onClick={() => handleOpenModal(prod)}
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <Footer />

      {/* PRODUCT SIZE MODAL */}
      {selectedProduct && (
        <ProductSizeModal
          product={selectedProduct}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          quantity={quantity}
          setQuantity={setQuantity}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCart}
          adding={adding}
          getImageUrl={getImageUrl}
          formatPrice={formatPrice}
        />
      )}
    </div>
  );
};

export default CategoryPage;
