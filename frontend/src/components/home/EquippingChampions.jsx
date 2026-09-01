import React, { useCallback, useEffect, useState } from "react";

import "../../styles/home/EquippingChampions.css";

import api from "../../api/axios";
import socket from "../../socket/socket";

const EquippingChampions = () => {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

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

  const fetchSection = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/homepage-sections/active");

      const sections = response.data.sections || [];

      const section = sections.find(
        (item) => item.name === "Equipping Champions",
      );

      if (!section) {
        setCategories([]);
        return;
      }

      setCategories(section.categories || []);
    } catch (error) {
      console.error("Equipping Champions Error:", error);

      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSection();
  }, [fetchSection]);

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

  if (loading) {
    return null;
  }

  if (!categories.length) {
    return null;
  }

  return (
    <section className="equipping-champions-section">
      <div className="equipping-champions-container">
        <h2 className="equipping-champions-title">Equipping champions</h2>

        <div className="equipping-champions-grid">
          {categories.map((category) => (
            <div className="equipping-champion-card" key={category._id}>
              {category.image ? (
                <img
                  src={getImageUrl(category.image)}
                  alt={category.name || "Equipping champion"}
                  className="equipping-champion-image"
                />
              ) : (
                <div className="equipping-champion-no-image">No Image</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EquippingChampions;
