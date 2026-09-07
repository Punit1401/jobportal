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
    { name: "Subscriber Management", href: "/admin/subscriber-management" },
    { name: "Subscription Management", href: "/admin/subscription-management" },
    { name: "Subscription Plans", href: "/admin/CreatePlanForm" },
    { name: "Advertisement Plans", href: "/admin/advertising-plans" },
    { name: "Dropdown Manager", href: "/admin/dropdownManager" },
    { name: "Libraries", href: "/admin/libraries" },
    { name: "Reports & Graphs", href: "/admin/reports" },
    { name: "Events & Activities", href: "/admin/events-activities" },
    { name: "Bulk Vacancies", href: "/admin/bulk-vacancies" },
    //{ name: "Users", href: "/admin/users" },
    { name: "Jobs", href: "/admin/jobs" },
    //{ name: "Applications", href: "/admin/applications" },
    { name: "Candidates", href: "/admin/candidates" },
    { name: "Notifications", href: "/admin/notifications" },

    { name: "Mail-manager", disabled: true },
    { name: "Excel-candidates", href: "/admin/excel-candidates" },
    { name: "Mailing System", href: "/admin/Mailing" },

    //{ name: "Plans", href: "/admin/plans" }
    { name: "Coupon Management", href: "/admin/CouponManagement" },

    //{ name: "3rd Party Integration", href: "/admin/third-party-integrations" },
    //{ name: "Social Media", href: "/admin/social-media-integration" },
    //{ name: "Contact Developer", href: "/admin/contact-developer" },

    { name: "Contact Management", href: "/admin/contact-management" },
    { name: "Government Schemes", href: "/admin/govt-resources" },
    { name: "Government Exams", href: "/admin/govt-exams" },
    { name: "🚩 Negative List", href: "/admin/negative-list" },
    { name: "Files & Folder", href: "/admin/files-folders" },
    { name: "Digital Wallet", href: "/admin/digital-wallet" },
    { name: "Feedback", href: "/admin/feedback" },
    //{ name: "SMS / WhatsApp", href: "/admin/sms-whatsapp-integration" },
    //{ name: "Retail Sales", href: "/admin/retail-sales" },
    //{ name: "Enquiries", href: "/admin/enquiries" },
    { name: "Service Requests", href: "/admin/service-requests" },
    //{ name: "Clients List", href: "/admin/clients-list" },
    { name: "Blogs / Articles", href: "/admin/blogs-articles" },

  ];

  const handleLogout = async () => {
    // Proper way to sign out
    await signOut({ redirect: false });
    // then navigate to login
    router.replace("/admin/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <aside className="bg-gray-800 text-white p-4 w-64 flex flex-col h-screen shrink-0">
        <h2 className="text-2xl font-bold mb-6 shrink-0">Admin Panel</h2>
        <nav className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 scrollbar-thin scrollbar-thumb-gray-700">
          {navItems.map((item, idx) => {
            const key = item.href || item.name || idx;
            if (item.disabled) {
              return (
                <span
                  key={key}
                  className="px-2 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider select-none cursor-default shrink-0 opacity-75 mt-1"
                >
                  {item.name}
                </span>
              );
            }
            return (
              <Link
                key={key}
                href={item.href}
                className={`p-2 rounded hover:bg-gray-700 transition-colors shrink-0 text-sm ${pathname === item.href ? "bg-gray-700 font-semibold" : ""}`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => signOut({ redirect: true, callbackUrl: "/login", cookieName: "next-auth.admin-token" })}
          className="mt-6 px-3 py-2 bg-red-600 rounded w-full shrink-0 text-sm"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto h-screen">{children}</main>
    </div>
  );
}
