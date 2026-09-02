import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/home/PopularCategories.css";

import api from "../../api/axios";
import socket from "../../socket/socket";

const PopularCategories = ({ customCategories, title }) => {
  const navigate = useNavigate();
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

      const response = await api.get("/pages/slug/home");
      const pageSections = response.data?.page?.sections || [];

      const section = pageSections.find(
        (item) => item.name === "PopularCategories" || item.type === "category"
      );

      const validCategories = (section?.categories || []).filter(
        (c) => c && typeof c === "object" && c.name
      );

      if (validCategories.length > 0) {
        setCategories(validCategories);
      } else {
        const catRes = await api.get("/categories");
        setCategories(catRes.data.categories || []);
      }
    } catch (error) {
      console.error("Popular Categories Error:", error);
      try {
        const catRes = await api.get("/categories");
        setCategories(catRes.data.categories || []);
      } catch {
        setCategories([]);
      }
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
    const valid = (customCategories || []).filter(
      (c) => c && typeof c === "object" && c.name
    );
    if (valid.length > 0) {
      setCategories(valid);
      setLoading(false);
      return;
    }
    fetchSection();
  }, [customCategories, fetchSection]);

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
        <div
          className="category-card"
          key={category._id}
          onClick={() => navigate("/monsoon-essentials")}
          style={{ cursor: "pointer" }}
        >
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
