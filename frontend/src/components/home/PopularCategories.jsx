import React, { useCallback, useEffect, useState } from "react";

import "../../styles/home/PopularCategories.css";

import api from "../../api/axios";
import socket from "../../socket/socket";

const PopularCategories = () => {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  /*
  ========================================
  IMAGE URL
  ========================================
  */

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    const apiBaseUrl = api.defaults.baseURL || "";
    const backendUrl = apiBaseUrl.replace(/\/api\/?$/, "");
    if (image.startsWith("/uploads/")) return `${backendUrl}${image}`;
    if (image.startsWith("uploads/")) return `${backendUrl}/${image}`;
    return `${backendUrl}${image.startsWith("/") ? "" : "/"}${image}`;
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
        Admin section name must be
        "PopularCategories"
        */

      const section = sections.find(
        (item) => item.name === "PopularCategories",
      );

      if (!section) {
        setCategories([]);
        return;
      }

      /*
        Selected categories from
        Homepage Section
        */

      setCategories(section.categories || []);
    } catch (error) {
      console.error("Popular Categories Error:", error);

      setCategories([]);
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
      const events = [
        "section_created",
        "section_updated",
        "section_deleted",
        "section_reordered",

        "category_created",
        "category_updated",
        "category_deleted",
        "category_reordered",
      ];

      if (events.includes(data?.type)) {
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

  if (!categories.length) {
    return null;
  }

  /*
  ========================================
  UI
  ========================================
  */

  return (
    <section className="popular-categories">
      {categories.map((category) => (
        <div className="category-card" key={category._id}>
          {category.image ? (
            <img src={getImageUrl(category.image)} alt={category.name} />
          ) : (
            <div className="category-no-image">No Image</div>
          )}

          <div className="category-overlay">
            <h3>{category.name}</h3>
          </div>
        </div>
      ))}
    </section>
  );
};

export default PopularCategories;
