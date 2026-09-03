import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  MdFavorite,
  MdFavoriteBorder,
  MdAddShoppingCart,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";

import toast from "react-hot-toast";

import Navbar from "../../components/Navbar";
import CategoryNav from "../../components/home/CategoryNav";
import Footer from "../../components/home/Footer";
import ProductSizeModal from "../../components/ProductSizeModal";

import { useWishlist } from "../../utils/useWishlist";
import api from "../../api/axios";
import socket from "../../socket/socket";

import "../../styles/category/MonsoonEssentials.css";

const MonsoonEssentials = () => {
  const navigate = useNavigate();

  const { isWishlisted, handleToggle } = useWishlist();

  /* =========================
     STATE
  ========================= */

  const [pageSections, setPageSections] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [selectedSize, setSelectedSize] = useState("");

  const [selectedColor, setSelectedColor] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [adding, setAdding] = useState(false);

  const [bannerSlides, setBannerSlides] = useState({});

  /* =========================
     IMAGE URL
  ========================= */

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

    if (image.startsWith("/uploads/")) {
      return `${backendUrl}${image}`;
    }

    if (image.startsWith("uploads/")) {
      return `${backendUrl}/${image}`;
    }

    return `${backendUrl}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  /* =========================
     FETCH PAGE
  ========================= */

  const fetchPage = useCallback(async () => {
    try {
      const response = await api.get("/pages/slug/monsoon-essentials");

      const page = response.data?.page;

      if (!page?.sections) {
        setPageSections([]);
        return;
      }

      setPageSections(page.sections);

      /* Keep banner slide index valid */

      const banners = {};

      page.sections.forEach((section, index) => {
        if (
          section.type === "banner" &&
          Array.isArray(section.banners) &&
          section.banners.length
        ) {
          banners[index] = 0;
        }
      });

      setBannerSlides((previous) => ({
        ...banners,
        ...previous,
      }));
    } catch (error) {
      console.error("Page fetch error:", error);

      setPageSections([]);
    }
  }, []);

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    fetchPage();

    const handleUpdate = (data) => {
      if (data?.slug === "monsoon-essentials" || !data?.slug) {
        fetchPage();
      }
    };

    socket.on("homepage_updated", handleUpdate);

    return () => {
      socket.off("homepage_updated", handleUpdate);
    };
  }, [fetchPage]);

  /* =========================
     PRICE
  ========================= */

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
  };

  /* =========================
     CART MODAL
  ========================= */

  const openCartModal = (product) => {
    setSelectedProduct(product);

    setSelectedSize(product.sizes?.[0] || "");

    setSelectedColor(product.colors?.[0] || "");

    setQuantity(1);
  };

  /* =========================
     ADD TO CART
  ========================= */

  const handleAddToCart = async () => {
    if (!selectedProduct) {
      return;
    }

    try {
      setAdding(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login to add items to cart");

        navigate("/login");

        return;
      }

      await api.post(
        "/cart/add",
        {
          productId: selectedProduct._id,
          size: selectedSize,
          color: selectedColor,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Added to cart!");

      setSelectedProduct(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  /* =========================
     CHANGE BANNER
  ========================= */

  const changeBanner = (sectionIndex, direction, total) => {
    setBannerSlides((previous) => {
      const current = previous[sectionIndex] || 0;

      let next;

      if (direction === "next") {
        next = current >= total - 1 ? 0 : current + 1;
      } else {
        next = current <= 0 ? total - 1 : current - 1;
      }

      return {
        ...previous,
        [sectionIndex]: next,
      };
    });
  };

  /* =========================
     PRODUCT CARD
  ========================= */

  const ProductCard = ({ product }) => {
    return (
      <div className="monsoon-product-card">
        {/* IMAGE */}

        <div className="monsoon-product-image">
          {product.stock <= 5 && product.stock > 0 && (
            <span className="limited-stock-badge">Limited stock</span>
          )}

          <img
            src={getImageUrl(product.images?.[0])}
            alt={product.name || "Product"}
          />
        </div>

        {/* DETAILS */}

        <div className="monsoon-product-info">
          <h3>{product.name}</h3>

          <div className="product-rating">
            <span>★★★★★</span>
            <small>1.6k</small>
          </div>

          <div className="product-price">
            <strong>{formatPrice(product.price)}</strong>

            {product.mrp && (
              <span>MRP ₹{Number(product.mrp).toLocaleString("en-IN")}</span>
            )}
          </div>

          <div className="product-actions">
            <button
              type="button"
              className="product-heart"
              onClick={() => handleToggle(product._id)}
            >
              {isWishlisted(product._id) ? (
                <MdFavorite />
              ) : (
                <MdFavoriteBorder />
              )}
            </button>

            <button
              type="button"
              className="add-cart-button"
              onClick={() => openCartModal(product)}
            >
              <MdAddShoppingCart />

              <span>Add to cart</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* =========================
     CATEGORY SECTION
  ========================= */

  const CategorySection = ({ section, sectionIndex, isFirstCategory }) => {
    const categories = Array.isArray(section.categories)
      ? section.categories.filter(
          (category) => category && typeof category === "object",
        )
      : [];

    if (!categories.length) {
      return null;
    }

    /* First category section
       = small navigation cards */

    if (isFirstCategory) {
      return (
        <section className="monsoon-category-section monsoon-top-categories">
          <div className="top-category-grid">
            {categories.map((category, index) => (
              <Link
                key={category._id || index}
                to={`/category/${category.slug || category._id || ""}`}
                className="top-category-card"
              >
                <div className="top-category-image">
                  {category.image ? (
                    <img
                      src={getImageUrl(category.image)}
                      alt={category.name || "Category"}
                    />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>

                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </section>
      );
    }

    /* Other category sections
       = large image cards */

    return (
      <section className="monsoon-category-section">
        {section.name && (
          <h2 className="monsoon-section-title">{section.name}</h2>
        )}

        <div className="category-card-grid">
          {categories.map((category, index) => (
            <Link
              key={category._id || index}
              to={`/category/${category.slug || category._id || ""}`}
              className="large-category-card"
            >
              {category.image ? (
                <img
                  src={getImageUrl(category.image)}
                  alt={category.name || "Category"}
                />
              ) : (
                <div className="no-image">No Image</div>
              )}
            </Link>
          ))}
        </div>
      </section>
    );
  };

  /* =========================
     BANNER SECTION
  ========================= */

  const BannerSection = ({ section, sectionIndex }) => {
    const banners = Array.isArray(section.banners)
      ? section.banners.filter(
          (banner) => banner && typeof banner === "object" && banner.image,
        )
      : [];

    if (!banners.length) {
      return null;
    }

    const currentSlide = bannerSlides[sectionIndex] || 0;

    const activeBanner = banners[currentSlide] || banners[0];

    return (
      <section className="monsoon-banner-section">
        <div className="monsoon-banner-wrapper">
          <img
            src={getImageUrl(activeBanner.image)}
            alt={activeBanner.title || "Monsoon Banner"}
            className="monsoon-banner-image"
          />

          {banners.length > 1 && (
            <>
              <button
                type="button"
                className="banner-arrow banner-arrow-left"
                onClick={() =>
                  changeBanner(sectionIndex, "prev", banners.length)
                }
              >
                <MdChevronLeft />
              </button>

              <button
                type="button"
                className="banner-arrow banner-arrow-right"
                onClick={() =>
                  changeBanner(sectionIndex, "next", banners.length)
                }
              >
                <MdChevronRight />
              </button>

              <div className="banner-dots">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`banner-dot ${
                      index === currentSlide ? "active" : ""
                    }`}
                    onClick={() =>
                      setBannerSlides((previous) => ({
                        ...previous,
                        [sectionIndex]: index,
                      }))
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    );
  };

  /* =========================
     PRODUCT SECTION
  ========================= */

  const ProductSection = ({ section }) => {
    // Only use products selected by admin.
    const sliderRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const adminProducts = useMemo(() => {
      return Array.isArray(section.products)
        ? section.products.filter(
            (product) => product && typeof product === "object" && product.name,
          )
        : [];
    }, [section.products]);

    const updateScrollButtons = useCallback(() => {
      const el = sliderRef.current;
      if (!el) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }, []);

    useEffect(() => {
      const el = sliderRef.current;
      if (!el) return;

      updateScrollButtons();
      const timeoutId = setTimeout(updateScrollButtons, 120);

      el.addEventListener("scroll", updateScrollButtons, { passive: true });
      window.addEventListener("resize", updateScrollButtons);

      return () => {
        clearTimeout(timeoutId);
        el.removeEventListener("scroll", updateScrollButtons);
        window.removeEventListener("resize", updateScrollButtons);
      };
    }, [adminProducts, updateScrollButtons]);

    const handleScroll = (direction) => {
      const el = sliderRef.current;
      if (!el) return;
      const card = el.querySelector(".monsoon-product-card");
      const cardWidth = card ? card.offsetWidth : 220;
      const gap = 20;
      const scrollDistance = (cardWidth + gap) * 2;

      el.scrollBy({
        left: direction === "next" ? scrollDistance : -scrollDistance,
        behavior: "smooth",
      });
    };

    if (!adminProducts.length) {
      return null;
    }

    return (
      <section className="monsoon-product-section">
        <div className="product-section-header">
          <h2 className="monsoon-section-title">
            {section.name || "Products"}
          </h2>

          <div className="product-section-arrows">
            <button
              type="button"
              className="section-arrow"
              onClick={() => handleScroll("prev")}
              disabled={!canScrollLeft}
              aria-label="Previous products"
            >
              <MdChevronLeft />
            </button>

            <button
              type="button"
              className="section-arrow"
              onClick={() => handleScroll("next")}
              disabled={!canScrollRight}
              aria-label="Next products"
            >
              <MdChevronRight />
            </button>
          </div>
        </div>

        <div className="monsoon-products-slider" ref={sliderRef}>
          {adminProducts.map((product, index) => (
            <ProductCard key={product._id || index} product={product} />
          ))}
        </div>
      </section>
    );
  };

  /* =========================
     RENDER ADMIN SECTIONS
  ========================= */

  const renderSection = (section, index) => {
    if (!section) {
      return null;
    }

    if (section.type === "category") {
      const firstCategoryIndex = pageSections.findIndex(
        (item) => item.type === "category",
      );

      return (
        <CategorySection
          key={section._id || index}
          section={section}
          sectionIndex={index}
          isFirstCategory={index === firstCategoryIndex}
        />
      );
    }

    if (section.type === "banner") {
      return (
        <BannerSection
          key={section._id || index}
          section={section}
          sectionIndex={index}
        />
      );
    }

    if (section.type === "product") {
      return <ProductSection key={section._id || index} section={section} />;
    }

    return null;
  };

  /* =========================
     MAIN
  ========================= */

  return (
    <div className="monsoon-essentials-page">
      <Navbar />

      <CategoryNav />

      <main className="monsoon-content-container">
        {pageSections.length > 0 ? (
          pageSections.map((section, index) => renderSection(section, index))
        ) : (
          <div className="empty-page">No sections available.</div>
        )}
      </main>

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
          onAddToCart={handleAddToCart}
          onClose={() => setSelectedProduct(null)}
          loading={adding}
        />
      )}

      <Footer />
    </div>
  );
};

export default MonsoonEssentials;
