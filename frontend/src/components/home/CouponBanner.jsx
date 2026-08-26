import React, { useCallback, useEffect, useState } from "react";

import "../../styles/home/CouponBanner.css";

import api from "../../api/axios";
import socket from "../../socket/socket";

const CouponBanner = () => {
  const [banner, setBanner] = useState(null);

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

  const fetchCouponSection = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/homepage-sections/active");

      const sections = response.data.sections || [];

      /*
        IMPORTANT:
        Admin Section Name:
        CouponBanner
        */

      const section = sections.find((item) => item.name === "CouponBanner");

      /*
        Section not found
        */

      if (!section) {
        setBanner(null);
        return;
      }

      /*
        Section has no banner
        */

      if (!section.banners || section.banners.length === 0) {
        setBanner(null);
        return;
      }

      /*
        Take first selected banner
        */

      setBanner(section.banners[0]);
    } catch (error) {
      console.error("Coupon Section Error:", error);

      setBanner(null);
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
    fetchCouponSection();
  }, [fetchCouponSection]);

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

      const bannerEvents = [
        "banner_created",
        "banner_updated",
        "banner_deleted",
      ];

      if (sectionEvents.includes(data?.type)) {
        fetchCouponSection();
        return;
      }

      if (bannerEvents.includes(data?.type)) {
        fetchCouponSection();
      }
    };

    socket.on("homepage_updated", handleHomepageUpdate);

    return () => {
      socket.off("homepage_updated", handleHomepageUpdate);
    };
  }, [fetchCouponSection]);

  /*
  ========================================
  LOADING / EMPTY
  ========================================
  */

  if (loading || !banner?.image) {
    return null;
  }

  /*
  ========================================
  UI
  ========================================
  */

  return (
    <section className="coupon-banner">
      {banner.link ? (
        <a href={banner.link} className="coupon-banner-link">
          <img
            src={getImageUrl(banner.image)}
            alt={banner.title || "Coupon Offers"}
            className="coupon-banner-image"
          />
        </a>
      ) : (
        <img
          src={getImageUrl(banner.image)}
          alt={banner.title || "Coupon Offers"}
          className="coupon-banner-image"
        />
      )}
    </section>
  );
};

export default CouponBanner;
