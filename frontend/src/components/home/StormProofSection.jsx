import React, { useCallback, useEffect, useState } from "react";

import "../../styles/home/StormProofSection.css";

import api from "../../api/axios";
import socket from "../../socket/socket";

const StormProofSection = () => {
  const [products, setProducts] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [visibleProducts, setVisibleProducts] = useState(5);

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
        Storm Proof Section
        */

      const section = sections.find(
        (item) => item.name === "Storm Proof Section",
      );

      /*
        Section not found
        */

      if (!section) {
        setProducts([]);
        setCurrentIndex(0);

        return;
      }

      /*
        Selected products
        */

      setProducts(section.products || []);

      /*
        Reset slider
        */

      setCurrentIndex(0);
    } catch (error) {
      console.error("Storm Proof Section Error:", error);

      setProducts([]);

      setCurrentIndex(0);
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
  RESPONSIVE VISIBLE PRODUCTS
  ========================================
  */

  useEffect(() => {
    const updateVisibleProducts = () => {
      const width = window.innerWidth;

      if (width <= 600) {
        setVisibleProducts(2);
      } else if (width <= 900) {
        setVisibleProducts(3);
      } else if (width <= 1100) {
        setVisibleProducts(4);
      } else {
        setVisibleProducts(5);
      }
    };

    updateVisibleProducts();

    window.addEventListener("resize", updateVisibleProducts);

    return () => {
      window.removeEventListener("resize", updateVisibleProducts);
    };
  }, []);

  /*
  ========================================
  MAX SLIDER INDEX
  ========================================
  */

  const maxIndex = Math.max(products.length - visibleProducts, 0);

  /*
  ========================================
  KEEP INDEX VALID
  ========================================
  */

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex]);

  /*
  ========================================
  PREVIOUS
  ========================================
  */

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  /*
  ========================================
  NEXT
  ========================================
  */

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
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
  TRACK WIDTH
  ========================================
  */

  const trackWidth = (products.length / visibleProducts) * 100;

  /*
  ========================================
  CARD WIDTH
  ========================================
  */

  const cardWidth = 100 / products.length;

  /*
  ========================================
  TRANSLATE
  ========================================
  */

  const translateAmount = currentIndex * cardWidth;

  /*
  ========================================
  UI
  ========================================
  */

  return (
    <section className="storm-proof-section">
      {/* ========================================
          LEFT CONTENT
      ======================================== */}

      <div className="storm-proof-left">
        <p>Storm Proof.</p>

        <h2>
          Style
          <br />
          Approved.
        </h2>

        <div className="storm-proof-arrows">
          <button
            type="button"
            className="storm-arrow"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="Previous product"
          >
            ‹
          </button>

          <button
            type="button"
            className="storm-arrow"
            onClick={handleNext}
            disabled={currentIndex === maxIndex}
            aria-label="Next product"
          >
            ›
          </button>
        </div>
      </div>

      {/* ========================================
          PRODUCT VIEWPORT
      ======================================== */}

      <div className="storm-proof-viewport">
        <div
          className="storm-proof-list"
          style={{
            width: `${trackWidth}%`,
            transform: `translateX(-${translateAmount}%)`,
          }}
        >
          {products.map((product) => (
            <div
              className="storm-product-card"
              key={product._id}
              style={{
                flex: `0 0 ${cardWidth}%`,
              }}
            >
              {/* IMAGE */}

              <div className="storm-product-image">
                <img
                  src={
                    product.images?.[0] ? getImageUrl(product.images[0]) : ""
                  }
                  alt={product.name}
                />

                {!product.images?.[0] && (
                  <div className="storm-product-no-image">No Image</div>
                )}
              </div>

              {/* INFO */}

              <div className="storm-product-info">
                <div className="storm-product-name">
                  <strong>{product.brand || ""}</strong> {product.name}
                </div>

                {/* RATING */}

                <div className="storm-product-rating">
                  <span className="storm-stars">★★★★★</span>

                  <span className="storm-reviews">{product.reviews || ""}</span>
                </div>

                {/* PRICE */}

                <div className="storm-product-price">
                  <span className="storm-current-price">
                    ₹{product.discountPrice || product.price}
                  </span>

                  <span className="storm-mrp">MRP ₹{product.price}</span>
                </div>

                {/* DISCOUNT */}

                <div className="storm-discount-wrapper">
                  {product.discount && (
                    <span className="storm-discount">{product.discount}</span>
                  )}
                </div>

                {/* ACTIONS */}

                <div className="storm-product-actions">
                  <button
                    type="button"
                    className="storm-wishlist"
                    aria-label="Add to wishlist"
                  >
                    ♡
                  </button>

                  <button type="button" className="storm-cart">
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

export default StormProofSection;
