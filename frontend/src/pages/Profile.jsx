import React from "react";

import {
  FiExternalLink,
  FiPlus,
  FiUser,
  FiLock,
  FiMessageSquare,
  FiEdit3,
  FiActivity,
  FiBarChart2,
} from "react-icons/fi";

import { Link } from "react-router-dom";

import "../styles/Profile.css";

const Profile = () => {
  return (
    <div className="profile-page">
      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="profile-header">
        <div className="decathlon-logo">
          <div className="decathlon-logo-mark">
            <span></span>
          </div>

          <span className="decathlon-logo-text">DECATHLON</span>
        </div>
      </header>

      {/* ==================================================
          PAGE LAYOUT
      ================================================== */}

      <div className="profile-layout">
        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <aside className="profile-sidebar">
          {/* ==================================================
              USER BOX
          ================================================== */}

          <div className="profile-user-box">
            <h2>Welcome</h2>

            <p className="profile-email">vk7184192@gmail.com</p>

            <div className="profile-points">
              <strong>0</strong>

              <span>point</span>
            </div>

            <button className="redeem-btn">Redeem points</button>
          </div>

          {/* ==================================================
              SIDEBAR MENU
          ================================================== */}

          <div className="profile-menu">
            {/* ==================================================
                PURCHASES
            ================================================== */}

            <div className="menu-section">
              <h3>Purchases</h3>

              {/* TRACK ORDERS & RETURNS */}

              <Link
                to="/account/orders-returns?tab=order-returns"
                className="menu-item menu-link-external"
              >
                <span>Track your orders &amp; returns</span>

                <FiExternalLink />
              </Link>

              {/* GIFT CARDS */}

              <div className="menu-item">
                <span>Gift cards</span>

                <FiExternalLink />
              </div>
            </div>

            {/* ==================================================
                LOYALTY
            ================================================== */}

            <div className="menu-section">
              <h3>Loyalty</h3>

              <div className="menu-link">Loyalty card</div>

              <div className="menu-link">Rewards shop</div>

              <div className="menu-link">Unlocked rewards</div>

              <div className="menu-link">Earn more points</div>

              <div className="menu-link">Sport sessions</div>

              <div className="menu-link">My points history</div>
            </div>

            {/* ==================================================
                PROFILE
            ================================================== */}

            <div className="menu-section profile-menu-section">
              <h3 className="active-menu">Profile</h3>

              <div className="menu-link">Personal information</div>

              <div className="menu-link">Notifications preferences</div>

              <div className="menu-link menu-with-icon">
                <span>Personalization</span>

                <FiPlus />
              </div>

              <div className="menu-link menu-with-icon">
                <span>Privacy and security</span>

                <FiPlus />
              </div>
            </div>

            {/* ==================================================
                LOGOUT
            ================================================== */}

            <div className="logout">Logout</div>

            {/* ==================================================
                CARD NUMBER
            ================================================== */}

            <div className="card-number">Card number: 2094724479967</div>
          </div>
        </aside>

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <main className="profile-content">
          {/* ==================================================
              TOP SECTION
          ================================================== */}

          <section className="profile-top">
            {/* WELCOME */}

            <div className="welcome-area">
              <div className="welcome-icon">
                <FiUser />
              </div>

              <div className="welcome-text">
                <h1>Welcome</h1>

                <p>
                  Manage all your data in one place to fully enjoy all Decathlon
                  services
                </p>
              </div>
            </div>

            {/* LOYALTY CARD */}

            <div className="loyalty-card">
              <div className="loyalty-new">New</div>

              <h2>Loyalty program</h2>

              <p>
                Earn enough points and enjoy discounts on your next purchases!
              </p>

              <button className="loyalty-button">
                <span>Manage my loyalty program</span>

                <FiExternalLink />
              </button>
            </div>
          </section>

          {/* ==================================================
              SPORTS BANNER
          ================================================== */}

          <section className="sports-banner">
            {/* SPORTS IMAGE */}

            <div className="sports-illustration">
              <img
                src="https://contents.mediadecathlon.com/s1212514/k$1defdc1cd8f187e0e3f69e07e288b033/step-1.svg"
                alt="Synchronize sports activities"
                className="sports-svg"
              />
            </div>

            {/* SPORTS CONTENT */}

            <div className="sports-content">
              <h2>
                Synchronize all your favorite sports trackers and activities!
              </h2>

              <p>
                If you use several sports trackers to register your activities,
                this new feature is for you! Activate the synchronization and
                gather all your activities in one place.
              </p>

              <button className="synchronize-btn">Synchronize</button>
            </div>
          </section>

          {/* ==================================================
              SHORTCUTS
          ================================================== */}

          <section className="shortcuts-section">
            <h2 className="shortcuts-title">Your shortcuts</h2>

            <div className="shortcut-grid">
              {/* PASSWORD */}

              <ShortcutCard
                icon={<FiLock />}
                title="Change my password"
                description="A strong password will increase the security of your account"
              />

              {/* COMMUNICATION */}

              <ShortcutCard
                icon={<FiMessageSquare />}
                title="Communication preferences"
                description="Choose your communication preferences, and the way you want to be contacted."
              />

              {/* PERSONAL PROFILE */}

              <ShortcutCard
                icon={<FiEdit3 />}
                title="Edit my personal profile"
                description="To keep it updated!"
              />

              {/* FAVORITE SPORTS */}

              <ShortcutCard
                icon={<FiActivity />}
                title="Manage my favorite sports"
                description="Tell us more about your sports profile"
              />

              {/* SPORTS ACTIVITIES */}

              <ShortcutCard
                icon={<FiBarChart2 />}
                title="Sync all my sports activities"
                description="To gather all your registered sport activities"
                full
              />
            </div>
          </section>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <footer className="profile-footer">
            <p>
              Website protected by reCAPTCHA: the <span>privacy policy</span>{" "}
              and the <span>terms of use</span> of Google apply.
            </p>

            <div className="footer-links">
              <span>Cookie Management</span>

              <span>Accessibility: partially compliant</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

/* ==========================================================
   SHORTCUT CARD
========================================================== */

const ShortcutCard = ({ icon, title, description, full = false }) => {
  return (
    <div className={`shortcut-card ${full ? "shortcut-card-full" : ""}`}>
      <div className="shortcut-icon">{icon}</div>

      <div className="shortcut-content">
        <h3>{title}</h3>

        <p>{description}</p>
      </div>
    </div>
  );
};

export default Profile;
