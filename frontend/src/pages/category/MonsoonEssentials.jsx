import React, { useCallback, useEffect, useState } from "react";
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
  const [products, setProducts] = useState([]);

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
        if (section.type === "banner" && section.banners?.length) {
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
     FETCH PRODUCTS
  ========================= */

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get("/products?limit=50");

      setProducts(response.data?.products || []);
    } catch (error) {
      console.error("Products fetch error:", error);

      setProducts([]);
    }
  }, []);

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    fetchPage();
    fetchProducts();

    const handleUpdate = (data) => {
      if (data?.slug === "monsoon-essentials" || !data?.slug) {
        fetchPage();
      }
    };

    socket.on("homepage_updated", handleUpdate);

    return () => {
      socket.off("homepage_updated", handleUpdate);
    };
  }, [fetchPage, fetchProducts]);

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

          <button
            type="button"
            className={`product-wishlist ${
              isWishlisted(product._id) ? "active" : ""
            }`}
            onClick={() => handleToggle(product._id)}
          >
            {isWishlisted(product._id) ? <MdFavorite /> : <MdFavoriteBorder />}
          </button>
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
    const adminProducts = Array.isArray(section.products)
      ? section.products.filter(
          (product) => product && typeof product === "object" && product.name,
        )
      : [];

    /*
      Admin-selected products are used first.
      If section has no products,
      nothing is shown.
    */

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
            <button type="button" className="section-arrow">
              <MdChevronLeft />
            </button>

            <button type="button" className="section-arrow">
              <MdChevronRight />
            </button>
          </div>
        </div>

        <div className="monsoon-products-grid">
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
