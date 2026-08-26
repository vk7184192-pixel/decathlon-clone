import React, { useCallback, useEffect, useState } from "react";

import "../../styles/home/RainyDayCollection.css";

import api from "../../api/axios";
import socket from "../../socket/socket";

const RainyDayCollection = () => {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  /* Image URL */
  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (image.startsWith("http")) {
      return image;
    }

    return `http://localhost:5000${image}`;
  };

  /*FETCH HOMEPAGE SECTION*/

  const fetchSection = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/homepage-sections/active");

      const sections = response.data.sections || [];

      /*
        IMPORTANT:
        Admin Section Name:
        Rainy Day Collection
        */

      const section = sections.find(
        (item) => item.name === "Rainy Day Collection",
      );

      /* SECTION NOT FOUND*/

      if (!section) {
        setCategories([]);

        return;
      }

      /* SELECTED CATEGORIES */

      setCategories(section.categories || []);
    } catch (error) {
      console.error("Rainy Day Collection Error:", error);

      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* INITIAL LOAD */

  useEffect(() => {
    fetchSection();
  }, [fetchSection]);

  /* REALTIME UPDATE */

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

  /* LOADING */

  if (loading) {
    return null;
  }

  /* EMPTY */

  if (!categories.length) {
    return null;
  }

  /* UI */

  return (
    <section className="rainy-day-section">
      <div className="rainy-day-container">
        <h2 className="rainy-day-title">
          Rainy Day Essentials, Head to toe Collection.
        </h2>

        <div className="rainy-day-grid">
          {categories.map((category) => (
            <div className="rainy-day-card" key={category._id}>
              {category.image ? (
                <img
                  src={getImageUrl(category.image)}
                  alt={category.name}
                  className="rainy-day-image"
                />
              ) : (
                <div className="rainy-day-no-image">No Image</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RainyDayCollection;
