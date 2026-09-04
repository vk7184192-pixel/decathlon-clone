import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

import Navbar from "../../components/Navbar";
import Footer from "../../components/home/Footer";
import api from "../../api/axios";

import "../../styles/category/Activewear.css";

const Activewear = () => {
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  /* =========================================================
     IMAGE URL HELPER
  ========================================================= */

  const getImageUrl = (image) => {
    if (!image) return "";

    if (
      typeof image === "string" &&
      (
        image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("data:")
      )
    ) {
      return image;
    }

    const apiBaseUrl = api.defaults.baseURL || "";

    const backendUrl = apiBaseUrl.replace(/\/api\/?$/, "");

    if (typeof image === "string") {
      if (image.startsWith("/uploads/")) {
        return `${backendUrl}${image}`;
      }

      if (image.startsWith("uploads/")) {
        return `${backendUrl}/${image}`;
      }

      return `${backendUrl}${image.startsWith("/") ? "" : "/"}${image}`;
    }

    return "";
  };

  /* =========================================================
     DEFAULT BANNER
  ========================================================= */

  const defaultBanner = {
    image: "",
    link: "#",
  };

  /* =========================================================
     FETCH ACTIVEWEAR PAGE
  ========================================================= */

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);

        let response;

        try {
          response = await api.get("/pages/slug/activewear");
        } catch (error) {
          response = await api.get("/pages/activewear");
        }

        const data = response.data;

        const pageSections =
          data?.page?.sections ||
          data?.sections ||
          data?.data?.sections ||
          [];

        setSections(Array.isArray(pageSections) ? pageSections : []);

      } catch (error) {
        console.error(
          "Failed to load Activewear page:",
          error
        );

        setSections([]);

      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  /* =========================================================
     MEN'S COLLECTION SECTION
  ========================================================= */

  const menCollectionSection = sections.find((section) => {
    const name = (
      section.name ||
      section.title ||
      ""
    ).toLowerCase();

    return (
      name === "men's collection" ||
      name.includes("men's collection")
    );
  });

  /* =========================================================
     GET CUSTOM CATEGORY ITEMS
  ========================================================= */

  const customCategories =
    menCollectionSection?.items ||
    menCollectionSection?.content ||
    menCollectionSection?.data ||
    [];

  /* =========================================================
     CATEGORY DATA
  ========================================================= */

  const categories =
    Array.isArray(customCategories) &&
    customCategories.length > 0
      ? customCategories.map((item) => ({
          name:
            item.name ||
            item.title ||
            item.itemName ||
            "Category",

          image: getImageUrl(
            item.image?.url ||
            item.image ||
            item.imageUrl ||
            ""
          ),

          link:
            item.link ||
            item.route ||
            item.categoryRoute ||
            "#",
        }))
      : [];

  /* =========================================================
     FIND BANNER SECTION
  ========================================================= */

  const bannerSection = sections.find((section) => {
    const type = (
      section.type ||
      section.sectionType ||
      ""
    ).toLowerCase();

    const name = (
      section.name ||
      section.title ||
      ""
    ).toLowerCase();

    return (
      type === "banner" ||
      name.includes("banner")
    );
  });

  /* =========================================================
     GET BANNERS
  ========================================================= */

  const rawBanners =
    bannerSection?.banners ||
    bannerSection?.items ||
    bannerSection?.content ||
    [];

  /* =========================================================
     BANNER LIST
  ========================================================= */

  const bannersList =
    Array.isArray(rawBanners) &&
    rawBanners.length > 0
      ? rawBanners.map((banner) => ({
          image: getImageUrl(
            banner.image?.url ||
            banner.image ||
            banner.imageUrl ||
            ""
          ),

          link:
            banner.link ||
            banner.route ||
            "#",
        }))
      : [defaultBanner];

  /* =========================================================
     CURRENT BANNER
  ========================================================= */

  const currentBanner =
    bannersList[currentBannerIndex] ||
    bannersList[0] ||
    defaultBanner;

  /* =========================================================
     AUTO SLIDER
  ========================================================= */

  useEffect(() => {
    if (bannersList.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => {
        return (prev + 1) % bannersList.length;
      });
    }, 5000);

    return () => clearInterval(interval);

  }, [bannersList.length]);

  /* =========================================================
     PREVIOUS BANNER
  ========================================================= */

  const handlePrevBanner = () => {
    setCurrentBannerIndex((prev) => {
      if (prev === 0) {
        return bannersList.length - 1;
      }

      return prev - 1;
    });
  };

  /* =========================================================
     NEXT BANNER
  ========================================================= */

  const handleNextBanner = () => {
    setCurrentBannerIndex((prev) => {
      return (prev + 1) % bannersList.length;
    });
  };

  /* =========================================================
     CATEGORY CLICK
  ========================================================= */

  const handleCategoryClick = (category) => {
    if (!category.link || category.link === "#") {
      return;
    }

    navigate(category.link);
  };

  /* =========================================================
     BANNER CLICK
  ========================================================= */

  const handleBannerClick = () => {
    if (
      currentBanner.link &&
      currentBanner.link !== "#"
    ) {
      navigate(currentBanner.link);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="activewear-page">
        <Navbar />

        <div className="activewear-loading">
          Loading...
        </div>

        <Footer />
      </div>
    );
  }

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="activewear-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar />

      {/* =====================================================
          TOP CATEGORY NAVIGATION
      ===================================================== */}

      <div className="activewear-top-nav">

        <button
          type="button"
          className="activewear-nav-link"
          onClick={() => navigate("/")}
        >
          All Sports
        </button>

        <button
          type="button"
          className="activewear-nav-link active"
        >
          Men
        </button>

        <button
          type="button"
          className="activewear-nav-link"
          onClick={() => navigate("/women")}
        >
          Women
        </button>

        <button
          type="button"
          className="activewear-nav-link"
          onClick={() => navigate("/kids")}
        >
          Kids
        </button>

      </div>

      {/* =====================================================
          DELIVERY
      ===================================================== */}

      <div className="activewear-delivery">

        Delivery to{" "}

        <span>
          Bangalore Central, Bangalore, 560001, Karnataka
        </span>

      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="activewear-container">

        {/* ===================================================
            MEN'S COLLECTION
        =================================================== */}

        <section className="men-collection-section">

          <h2>
            {menCollectionSection?.name || menCollectionSection?.title || "Men's Collection"}
          </h2>

          <div className="category-scroll">

            {categories.map((category, index) => (

              <div
                className="collection-item"
                key={`${category.name}-${index}`}
                onClick={() =>
                  handleCategoryClick(category)
                }
              >

                <div className="collection-image">

                  {category.image ? (

                    <img
                      src={category.image}
                      alt={category.name}
                    />

                  ) : (

                    <div className="image-placeholder">
                      {category.name}
                    </div>

                  )}

                </div>

                <p>
                  {category.name}
                </p>

              </div>

            ))}

          </div>

        </section>

        {/* ===================================================
            BANNER
        =================================================== */}

        <section className="activewear-banner-section">

          <div
            className={`activewear-banner ${
              currentBanner.link &&
              currentBanner.link !== "#"
                ? "clickable-banner"
                : ""
            }`}
            onClick={handleBannerClick}
          >

            {/* BANNER IMAGE */}

            {currentBanner.image ? (

              <img
                src={currentBanner.image}
                alt="Activewear Banner"
                className="banner-background"
              />

            ) : (

              <div className="banner-placeholder">
                No banner image available
              </div>

            )}

            {/* =================================================
                PREVIOUS BUTTON
            ================================================= */}

            {bannersList.length > 1 && (

              <button
                type="button"
                className="banner-arrow prev"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevBanner();
                }}
                aria-label="Previous Banner"
              >
                <MdChevronLeft />
              </button>

            )}

            {/* =================================================
                NEXT BUTTON
            ================================================= */}

            {bannersList.length > 1 && (

              <button
                type="button"
                className="banner-arrow next"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextBanner();
                }}
                aria-label="Next Banner"
              >
                <MdChevronRight />
              </button>

            )}

            {/* =================================================
                DOTS
            ================================================= */}

            {bannersList.length > 1 && (
              <div className="banner-dots">
                {bannersList.map((_, index) => (
                  <span
                    key={index}
                    className={
                      index === currentBannerIndex
                        ? "active"
                        : ""
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentBannerIndex(index);
                    }}
                  />
                ))}
              </div>
            )}

          </div>

        </section>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Footer />

    </div>
  );
};

export default Activewear;
