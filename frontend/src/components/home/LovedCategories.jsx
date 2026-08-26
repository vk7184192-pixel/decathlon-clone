import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import "../../styles/home/LovedCategories.css";

import api from "../../api/axios";
import socket from "../../socket/socket";

const LovedCategories = () => {
  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /*IMAGE URL*/

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

  const fetchSection =
    useCallback(async () => {
      try {
        setLoading(true);

        const response =
          await api.get(
            "/homepage-sections/active"
          );

        const sections =
          response.data.sections || [];

        /*
        Admin Section Name:
        Loved Categories
        */

        const section =
          sections.find(
            (item) =>
              item.name ===
              "Loved Categories"
          );

        if (!section) {
          setCategories([]);
          return;
        }

        /*Selected category images*/

        setCategories(
          section.categories || []
        );
      } catch (error) {
        console.error(
          "Loved Categories Error:",
          error
        );

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
    const handleHomepageUpdate =
      (data) => {
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

        if (
          sectionEvents.includes(
            data?.type
          )
        ) {
          fetchSection();
          return;
        }

        if (
          categoryEvents.includes(
            data?.type
          )
        ) {
          fetchSection();
        }
      };

    socket.on(
      "homepage_updated",
      handleHomepageUpdate
    );

    return () => {
      socket.off(
        "homepage_updated",
        handleHomepageUpdate
      );
    };
  }, [fetchSection]);

  /*LOADING*/

  if (loading) {
    return null;
  }

  /*EMPTY*/

  if (!categories.length) {
    return null;
  }

  /*UI*/

  return (
    <section className="loved-categories">

      <div className="loved-categories-container">

        <h2 className="loved-categories-title">
          Keep shopping your loved categories
        </h2>

        <div className="loved-categories-grid">

          {categories.map(
            (category) => (

              <div
                className="loved-category-card"
                key={category._id}
              >

                {category.image ? (

                  <img
                    src={getImageUrl(
                      category.image
                    )}
                    alt={
                      category.name ||
                      "Category"
                    }
                    className="loved-category-image"
                  />

                ) : (

                  <div className="loved-category-no-image">
                    No Image
                  </div>

                )}

              </div>

            )
          )}

        </div>

      </div>

    </section>
  );
};

export default LovedCategories;