"use client";
import RecruiterSidebar from "@/components/RecruiterSidebar";
import AdvertisingDashboard from "@/components/AdvertisingDashboard";

export default function RecruiterAdvertisingPage() {
  return <AdvertisingDashboard Sidebar={RecruiterSidebar} activePage="advertising" role="recruiter" />;
}
