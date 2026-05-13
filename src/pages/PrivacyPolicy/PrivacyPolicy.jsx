import React, { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import MainLayout from "../../components/MainLayout/MainLayout";
import FeaturesSection from "../../components/Features/FeaturesSection";
import Testimonial from "../../components/Testmonial/Testimonial";
import PageDetails from "../../components/PageDetails/PageDetails";
import axios from "axios";
import { links } from "../../contstants";
import Loading from "../../components/Loading/Loading";

function PrivacyPolicy() {
  const [privacyPolicyData, setPrivacyPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${links.BASE_URL}pages/get-page?pageName=Privacy-policy`
      );
      setPrivacyPolicyData(
        response?.data?.data?.description || "<p>No content available</p>"
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching privacy policy data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bg-auth">
      <MainLayout>
        <Header color="black" />
        <PageDetails title="Privacy Policy" content={privacyPolicyData} />
        <FeaturesSection />
        <Testimonial />
      </MainLayout>
    </div>
  );
}

export default PrivacyPolicy;
