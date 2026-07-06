// src/components/admin/SidebarLayout.jsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function SidebarLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Staff & Tasks", href: "/admin/staff-task-management" },
    { name: "Users", href: "/admin/users" },
    { name: "Jobs", href: "/admin/jobs" },
    { name: "Applications", href: "/admin/applications" },
    { name: "Candidates", href: "/admin/candidates" },
    { name: "Reports & Graphs", href: "/admin/reports-graphs" },
    { name: "Notifications", href: "/admin/notifications" },
    { name: "Dropdown Manager", href: "/admin/dropdownManager" },
    { name: "Mail-manager", href: "/admin/mail-manager" },
    { name: "Excel-candidates", href: "/admin/excel-candidates" },
    { name: "Recruiter", href: "/admin/recruiters" },
    { name: "Service Providers", href: "/admin/serviceproviders" },
    { name: "Mailing System", href: "/admin/Mailing" },
    { name: "Subscription Plans", href: "/admin/CreatePlanForm" },
    //{ name: "Plans", href: "/admin/plans" }
    { name: "Coupon Management", href: "/admin/CouponManagement" },
    { name: "Libraries", href: "/admin/libraries" },
    { name: "3rd Party Integration", href: "/admin/third-party-integrations" },
    { name: "Social Media", href: "/admin/social-media-integration" },
    { name: "Contact Developer", href: "/admin/contact-developer" },
    { name: "Events & Activities", href: "/admin/events-activities" },
    { name: "Contact Management", href: "/admin/contact-management" },
    { name: "Government Schemes", href: "/admin/government-schemes" },
    { name: "Files & Folder", href: "/admin/files-folders" },
    { name: "Digital Wallet", href: "/admin/digital-wallet" },
    { name: "Feedback", href: "/admin/feedback" },
    { name: "SMS / WhatsApp", href: "/admin/sms-whatsapp-integration" },
    { name: "Retail Sales", href: "/admin/retail-sales" },
    { name: "Enquiries", href: "/admin/enquiries" },
    { name: "Service Requests", href: "/admin/service-requests" },
    { name: "Clients List", href: "/admin/clients-list" },
    { name: "Blogs / Articles", href: "/admin/blogs-articles" },

  ];

  const handleLogout = async () => {
    // Proper way to sign out
    await signOut({ redirect: false });
    // then navigate to login
    router.replace("/admin/login");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="bg-gray-800 text-white p-4 w-64">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`p-2 rounded hover:bg-gray-700 ${pathname === item.href ? "bg-gray-700 font-semibold" : ""}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => signOut({ redirect: true, callbackUrl: "/login", cookieName: "next-auth.admin-token" })}
          className="mt-6 px-3 py-2 bg-red-600 rounded w-full"
        >
          Logout
        </button>

      </aside>

      <main className="flex-1 p-6 bg-gray-100 overflow-auto h-screen">{children}</main>
    </div>
  );
}
