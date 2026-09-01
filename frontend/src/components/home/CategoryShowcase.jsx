import React, { useCallback, useEffect, useState } from "react";

import "../../styles/home/CategoryShowcase.css";

import api from "../../api/axios";
import socket from "../../socket/socket";

const CategoryShowcase = () => {
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
        Admin Section Name:
        CategoryShowcase
        */

      const section = sections.find((item) => item.name === "CategoryShowcase");

      /*
        Section not found
        */

      if (!section) {
        setCategories([]);

        return;
      }

      /*
        Selected categories
        */

      setCategories(section.categories || []);
    } catch (error) {
      console.error("Category Showcase Error:", error);

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
      const sectionEvents = [
        "section_created",
        "section_updated",
        "section_deleted",
        "section_reordered",
      ];

      const categoryEvents = [
        "category_created",
        "category_updated",
        "category_deleted",
        "category_reordered",
      ];

      if (sectionEvents.includes(data?.type)) {
        fetchSection();

        return;
      }

      if (categoryEvents.includes(data?.type)) {
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
    <section className="category-showcase">
      <div className="category-showcase-list">
        {categories.map((category) => (
          <div className="category-showcase-card" key={category._id}>
            {category.image ? (
              <img src={getImageUrl(category.image)} alt={category.name} />
            ) : (
              <div className="category-showcase-no-image">No Image</div>
            )}

            <div className="category-showcase-title">{category.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryShowcase;
