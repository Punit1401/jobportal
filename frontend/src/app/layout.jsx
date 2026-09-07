import "./globals.css";
import { headers } from "next/headers";
import Script from "next/script";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SessionProviderWrapper from "../components/SessionProviderWrapper";

export const metadata = {
  title: "Career and Naukri",
  description: "Connecting talented professionals with world-class opportunities.",
};

const RESERVED_SUBDOMAINS = new Set(["www", "admin", "api", "app", "mail", "ftp"]);

function isPublicSiteHost(hostname) {
  if (!hostname) return false;
  if (hostname.endsWith(".localhost")) {
    const subdomain = hostname.replace(/\.localhost$/, "");
    return !!subdomain && !RESERVED_SUBDOMAINS.has(subdomain);
  }

  const parts = hostname.split(".");
  if (parts.length >= 3 && !RESERVED_SUBDOMAINS.has(parts[0])) {
    return true;
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  if (rootDomain && !rootDomain.includes("localhost")) {
    const rootHost = rootDomain.split(":")[0];
    return hostname !== rootHost && hostname !== `www.${rootHost}` && hostname.endsWith(`.${rootHost}`);
  }

  return false;
}

export default async function RootLayout({ children }) {
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") || "/";
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host") || "";
  const hostname = host.split(":")[0];

  const isAdmin = pathname.startsWith("/admin");
  const isAuthPage = pathname === "/login" || pathname.includes("register");
  const isDashboardArea =
    pathname.startsWith("/user") ||
    pathname.startsWith("/recruiter") ||
    pathname.startsWith("/serviceprovider");
  const isPublicWebsite = pathname.startsWith("/p/") || isPublicSiteHost(hostname);

  if (isAdmin) {
    return (
      <html lang="en">
        <body>
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </body>
      </html>
    );
  }

  if (isPublicWebsite) {
    return (
      <html lang="en">
        <body className="flex flex-col min-h-screen bg-gray-50">
          <SessionProviderWrapper>
            <main className="flex-grow">{children}</main>
          </SessionProviderWrapper>
          <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gray-50">
        <SessionProviderWrapper>
          <Navbar />
          <main className="flex-grow pt-20 pb-10">{children}</main>
          {!isAuthPage && !isDashboardArea && <Footer />}
        </SessionProviderWrapper>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
