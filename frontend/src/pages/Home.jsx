import "../styles/home/Home.css";

import CouponBanner from "../components/home/CouponBanner";
import PopularCategories from "../components/home/PopularCategories";
import PromoBanner from "../components/home/PromoBanner";
import CategoryShowcase from "../components/home/CategoryShowcase";
import ProductSection from "../components/home/ProductSection";
import SportsCategories from "../components/home/SportsCategories";
import PromoBanner2 from "../components/home/PromoBanner2";
import StormProofSection from "../components/home/StormProofSection";
import RainyDayCollection from "../components/home/RainyDayCollection";
import LovedCategories from "../components/home/LovedCategories";
import OutdoorProducts from "../components/home/OutdoorProducts";
import EquippingChampions from "../components/home/EquippingChampions";
import Footer from "../components/home/Footer";

const Home = () => {
  return (
    <main className="home-page">
      <div className="home-container">
        <CouponBanner />

        <PopularCategories />

        <PromoBanner />

        <CategoryShowcase />

        <ProductSection />

        <SportsCategories />

        <PromoBanner2 />

        <StormProofSection />

        <RainyDayCollection />

        <LovedCategories />

        <OutdoorProducts />

        <EquippingChampions />
      </div>

      <Footer />
    </main>
  );
};

export default Home;
