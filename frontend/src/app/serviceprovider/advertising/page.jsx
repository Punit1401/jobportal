"use client";
import Serviceprovidersidbar from "@/components/Serviceprovidersidbar.jsx";
import AdvertisingDashboard from "@/components/AdvertisingDashboard";

export default function ServiceProviderAdvertisingPage() {
  return (
    <AdvertisingDashboard
      Sidebar={Serviceprovidersidbar}
      activePage="advertising"
      role="serviceprovider"
    />
  );
}
