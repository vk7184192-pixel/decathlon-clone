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

  // SUB-CATEGORY TILES (SCREENSHOT 1)
  const subCategoryTiles = [
    { title: "Jackets", img: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=400&q=80" },
    { title: "Ponchos", img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=400&q=80" },
    { title: "Rain Pants", img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80" },
    { title: "Umbrella", img: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&q=80" },
    { title: "Waterproof Bags", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80" },
    { title: "Rain Covers", img: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&q=80" },
    { title: "Flipflops & Sandals", img: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&q=80" },
    { title: "Waterproof Shoes", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
  ];

  // FEATURED SHOWCASE BANNERS (SCREENSHOT 2 & 3)
  const showcaseSet1 = [
    { title: "Quick Dry Towels", subtitle: "From Drenched to Dry in Seconds", img: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&q=80" },
    { title: "Waterproof Bags", subtitle: "Monsoon-Proof School Days", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80" },
    { title: "Camping Tents", subtitle: "Weatherproof Tents. Monsoon Treks.", img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80" },
    { title: "Easy Wear Ponchos", subtitle: "Grab, Throw On, Step Out", img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80" },
  ];

  const showcaseSet2 = [
    { title: "Men's Rain Essentials", subtitle: "Build for downpours. Made to keep you moving.", img: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80" },
    { title: "Women's Rain Essentials", subtitle: "Functional layers for monsoon adventures.", img: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&q=80" },
    { title: "Kids Rain Essentials", subtitle: "Splash through every monsoon moment.", img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80" },
    { title: "Explore All", subtitle: "Explore other wide range of essentials and needs.", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80" },
  ];

  // SPORTS GRID (SCREENSHOT 4)
  const sportsGrid = [
    { title: "Table Tennis", img: "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=600&q=80" },
    { title: "Carrom", img: "https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=600&q=80" },
    { title: "Dart/Archery", img: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=600&q=80" },
    { title: "Gym Equipments", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80" },
  ];

  const maxProdSlide = Math.max(products.length - 4, 0);

  return (
    <div className="category-shop-page">
      <Navbar />
      <CategoryNav />

      {/* BREADCRUMB HEADER */}
      <div className="category-page-header">
        <div className="category-breadcrumbs">
          <Link to="/">Home</Link> / <span>{category?.name || "Category"}</span>
        </div>
        <h1 className="category-page-title">{category?.name || "Collection"}</h1>
      </div>

      <div className="category-shop-container">
        {/* 1. SUB-CATEGORIES QUICK ICON ROW (SCREENSHOT 1) */}
        <section className="subcat-quick-row">
          {subCategoryTiles.map((tile, idx) => (
            <div className="subcat-quick-card" key={idx}>
              <div className="subcat-icon-wrapper">
                <img src={tile.img} alt={tile.title} />
              </div>
              <span>{tile.title}</span>
            </div>
          ))}
        </section>

        {/* 2. HERO FEATURED BANNER CAROUSEL (SCREENSHOT 1) */}
        <section className="category-hero-banner">
          <div className="cat-banner-bg">
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=80"
              alt="Category Banner"
            />
          </div>
          <div className="cat-banner-overlay">
            <h2>Your Office Lives in Your Bag. Protect It.</h2>
            <p>Protect your essentials from unexpected showers.</p>
            <button type="button" className="cat-shop-now-btn">
              Shop Now
            </button>
          </div>
        </section>

        {/* 3. SHOWCASE GRID 1 (SCREENSHOT 2) */}
        <section className="cat-showcase-section">
          <h2 className="cat-section-heading">From Rain Jackets To Weatherproof Tents</h2>
          <div className="cat-showcase-grid">
            {showcaseSet1.map((item, idx) => (
              <div className="cat-showcase-card" key={idx}>
                <img src={item.img} alt={item.title} />
                <div className="cat-card-overlay">
                  <h3>{item.subtitle}</h3>
                  <span className="cat-card-pill">{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. SHOWCASE GRID 2 (SCREENSHOT 3) */}
        <section className="cat-showcase-section">
          <h2 className="cat-section-heading">Rain Protection For The Whole Family</h2>
          <div className="cat-showcase-grid">
            {showcaseSet2.map((item, idx) => (
              <div className="cat-showcase-card" key={idx}>
                <img src={item.img} alt={item.title} />
                <div className="cat-card-overlay">
                  <h3>{item.title}</h3>
                  <p>{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. SPORTS & ACTIVITY GRID (SCREENSHOT 4) */}
        <section className="cat-showcase-section">
          <h2 className="cat-section-heading">Don't Let Rain Stop The Game</h2>
          <div className="cat-sports-grid">
            {sportsGrid.map((item, idx) => (
              <div className="cat-sport-card" key={idx}>
                <img src={item.img} alt={item.title} />
                <div className="cat-sport-title-pill">
                  <span>{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. PRODUCTS CAROUSEL / COLLECTION (SCREENSHOT 5) */}
        <section className="cat-products-section">
          <div className="cat-products-header">
            <h2>{category?.name || "Collection"} Products</h2>
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
