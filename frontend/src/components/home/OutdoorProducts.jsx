import React, { useCallback, useEffect, useRef, useState } from "react";

import "../../styles/home/OutdoorProducts.css";

import api from "../../api/axios";
import socket from "../../socket/socket";

const OutdoorProducts = () => {
  const sliderRef = useRef(null);

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

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
  FETCH HOMEPAGE SECTION
  ========================================
  */

  const fetchSection = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/homepage-sections/active");

      const sections = response.data.sections || [];

      /*
        IMPORTANT:
        Admin Section Name:
        Outdoor Products
        */

      const section = sections.find((item) => item.name === "Outdoor Products");

      /*
        SECTION NOT FOUND
        */

      if (!section) {
        setProducts([]);

        return;
      }

      /*
        SELECTED PRODUCTS
        */

      setProducts(section.products || []);

      /*
        RESET SCROLL POSITION
        */

      if (sliderRef.current) {
        sliderRef.current.scrollTo({
          left: 0,
          behavior: "instant",
        });
      }
    } catch (error) {
      console.error("Outdoor Products Error:", error);

      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  ========================================
  INITIAL LOAD
  ========================================
  */

  useEffect(() => {
    fetchSection();
  }, [fetchSection]);

  /*
  ========================================
  REALTIME UPDATE
  ========================================
  */

  useEffect(() => {
    const handleHomepageUpdate = (data) => {
      const sectionEvents = [
        "section_created",
        "section_updated",
        "section_deleted",
        "section_reordered",
      ];

      const productEvents = [
        "product_created",
        "product_updated",
        "product_deleted",
      ];

      if (sectionEvents.includes(data?.type)) {
        fetchSection();

        return;
      }

      if (productEvents.includes(data?.type)) {
        fetchSection();
      }
    };

    socket.on("homepage_updated", handleHomepageUpdate);

    return () => {
      socket.off("homepage_updated", handleHomepageUpdate);
    };
  }, [fetchSection]);

  /*
  ========================================
  SCROLL ONE PRODUCT LEFT
  ========================================
  */

  const scrollLeft = () => {
    if (!sliderRef.current) {
      return;
    }

    const card = sliderRef.current.querySelector(".outdoor-product-card");

    if (!card) {
      return;
    }

    const cardWidth = card.offsetWidth;

    const styles = window.getComputedStyle(sliderRef.current);

    const gap = parseFloat(styles.columnGap) || 0;

    sliderRef.current.scrollBy({
      left: -(cardWidth + gap),
      behavior: "smooth",
    });
  };

  /*
  ========================================
  SCROLL ONE PRODUCT RIGHT
  ========================================
  */

  const scrollRight = () => {
    if (!sliderRef.current) {
      return;
    }

    const card = sliderRef.current.querySelector(".outdoor-product-card");

    if (!card) {
      return;
    }

    const cardWidth = card.offsetWidth;

    const styles = window.getComputedStyle(sliderRef.current);

    const gap = parseFloat(styles.columnGap) || 0;

    sliderRef.current.scrollBy({
      left: cardWidth + gap,
      behavior: "smooth",
    });
  };

  /*
  ========================================
  LOADING
  ========================================
  */

  if (loading) {
    return null;
  }

  /*
  ========================================
  EMPTY
  ========================================
  */

  if (!products.length) {
    return null;
  }

  /*
  ========================================
  UI
  ========================================
  */

  return (
    <section className="outdoor-products-section">
      <div className="outdoor-products-container">
        {/* =================================
            LEFT CONTENT
        ================================= */}

        <div className="outdoor-products-intro">
          <p>Explore best of</p>

          <h2>
            Outdoor
            <br />
            Shoes &
            <br />
            Sneakers.
          </h2>

          <div className="outdoor-slider-buttons">
            <button
              type="button"
              className="outdoor-arrow"
              onClick={scrollLeft}
              aria-label="Previous product"
            >
              ‹
            </button>

            <button
              type="button"
              className="outdoor-arrow"
              onClick={scrollRight}
              aria-label="Next product"
            >
              ›
            </button>
          </div>
        </div>

        {/* =================================
            PRODUCTS SLIDER
        ================================= */}

        <div className="outdoor-products-slider" ref={sliderRef}>
          {products.map((product) => (
            <div className="outdoor-product-card" key={product._id}>
              {/* PRODUCT IMAGE */}

              <div className="outdoor-product-image-wrapper">
                {product.badge && (
                  <span className="outdoor-product-badge">{product.badge}</span>
                )}

                {product.images?.[0] ? (
                  <img
                    src={getImageUrl(product.images[0])}
                    alt={product.name}
                    className="outdoor-product-image"
                  />
                ) : (
                  <div className="outdoor-product-no-image">No Image</div>
                )}
              </div>

              {/* PRODUCT DETAILS */}

              <div className="outdoor-product-details">
                {/* PRODUCT NAME */}

                <p className="outdoor-product-name">
                  <strong>{product.brand || ""}</strong> {product.name}
                </p>

                {/* RATING */}

                <div className="outdoor-rating">
                  <span className="stars">★★★★★</span>

                  <span className="review-count">{product.reviews || ""}</span>
                </div>

                {/* PRICE */}

                <div className="outdoor-price">
                  <span>₹{product.discountPrice || product.price}</span>

                  {product.discount && (
                    <span className="outdoor-discount">{product.discount}</span>
                  )}
                </div>

                {/* MRP */}

                <div className="outdoor-mrp">
                  {product.price ? `MRP ₹${product.price}` : "MRP"}
                </div>

                {/* ACTION BUTTONS */}

                <div className="outdoor-product-actions">
                  <button
                    type="button"
                    className="outdoor-wishlist"
                    aria-label="Add to wishlist"
                  >
                    ♡
                  </button>

                  <button type="button" className="outdoor-cart">
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OutdoorProducts;
