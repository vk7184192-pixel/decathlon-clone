import React from "react";
import "../../styles/home/EquippingChampions.css";

import flickPocket from "../../assets/images/home/champions/flick-pocket.png";
import rideSmart from "../../assets/images/home/champions/ride-smart.png";
import ownPavement from "../../assets/images/home/champions/own-pavement.png";
import practicePoints from "../../assets/images/home/champions/practice-points.png";

const championItems = [
  {
    title: "Flick. Pocket. Win.",
    price: "₹279",
    image: flickPocket,
  },
  {
    title: "Ride Smart. Stay Seen",
    price: "₹999",
    image: rideSmart,
  },
  {
    title: "Pick Your Color. Own the Pavement.",
    price: "₹799",
    image: ownPavement,
  },
  {
    title: "Practice Makes Points",
    price: "₹699",
    image: practicePoints,
  },
];

const EquippingChampions = () => {
  return (
    <section className="equipping-champions-section">
      <div className="equipping-champions-container">

        {/* ========================================
            HEADING
        ======================================== */}

        <h2 className="equipping-champions-title">
          Equipping champions
        </h2>


        {/* ========================================
            CARDS
        ======================================== */}

        <div className="equipping-champions-grid">

          {championItems.map((item, index) => (

            <div
              className="equipping-champion-card"
              key={index}
            >

              {/* IMAGE */}

              <img
                src={item.image}
                alt={item.title}
                className="equipping-champion-image"
              />


              {/* DARK OVERLAY */}

              <div className="equipping-champion-overlay"></div>


              {/* CONTENT */}

              <div className="equipping-champion-content">

                <h3>
                  {item.title}
                </h3>

                <p>
                  {item.price}
                  <span> onwards</span>
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
};

export default EquippingChampions;