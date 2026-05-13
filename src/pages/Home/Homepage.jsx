import React, { useState } from "react";
import MainLayout from "../../components/MainLayout/MainLayout";
import HeroSection from "../../components/Hero/HeroSection";
import FeaturesSection from "../../components/Features/FeaturesSection";
import Testimonial from "../../components/Testmonial/Testimonial";
import Loading from "../../components/Loading/Loading";

function Homepage() {
  const [loading, setLoading] = useState(true);

  setTimeout(() => {
    setLoading(false);
  }, 1000);

  if (loading) {
    return <Loading />;
  }

  return (
    <MainLayout >
      <HeroSection />
      <FeaturesSection />
      <Testimonial />
    </MainLayout>
  );
}

export default Homepage;
