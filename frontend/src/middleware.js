// import { withAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";

// export default withAuth(
//   function middleware(req) {
//     const token = req.nextauth?.token;
//     const path = req.nextUrl.pathname;
//     const role = token?.role;

//     // ૧. જો પેજ રજીસ્ટર વાળું હોય, તો આગળ જવા દો (No Role Check for Registration)
//     if (path.includes("/register")) {
//       return NextResponse.next();
//     }

//     // ૨. રોલ વાઈઝ સિક્યોરિટી (ફક્ત ડેશબોર્ડ કે પ્રોટેક્ટેડ પેજ માટે)
//     if (path.startsWith("/admin") && role !== "admin") {
//       return NextResponse.redirect(new URL("/login", req.nextUrl));
//     }

//     // Recruiter સિક્યોરિટી (પણ રજીસ્ટર પેજ સિવાય)
//     if (path.startsWith("/recruiter") && role !== "recruiter") {
//       return NextResponse.redirect(new URL("/login", req.nextUrl));
//     }

//     // Service Provider સિક્યોરિટી (પણ રજીસ્ટર પેજ સિવાય)
//     if (path.startsWith("/serviceprovider") && role !== "serviceprovider") {
//       return NextResponse.redirect(new URL("/login", req.nextUrl));
//     }

//     // User/Candidate સિક્યોરિટી
//     if (path.startsWith("/user") && role !== "user") {
//       return NextResponse.redirect(new URL("/login", req.nextUrl));
//     }

//     // ૩. Cache Control Headers
//     const response = NextResponse.next();
//     response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
//     response.headers.set('Pragma', 'no-cache');
//     response.headers.set('Expires', '0');

//     return response;
//   },
//   {
//     callbacks: {
//       authorized: ({ token, req }) => {
//         const path = req.nextUrl.pathname;

//         // લોગિન વગર એક્સેસ કરવા માટેના પબ્લિક પાથ (Register, API, etc.)
//         if (
//           path.includes("/register") || 
//           path.startsWith("/api/auth") || 
//           path === "/login" ||
//           path.startsWith("/_next")
//         ) {
//           return true;
//         }

//         // બાકીના પ્રોટેક્ટેડ રૂટ્સ (Dashboard, etc.) માટે ટોકન હોવું ફરજિયાત છે
//         return !!token;
//       },
//     },
//     pages: {
//       signIn: "/login",
//       error: "/login",
//     },
//   }
// );

// export const config = {
//   // મિડલવેર કયા પાથ પર કામ કરશે તે લિસ્ટ
//   matcher: [
//     "/admin/:path*",
//     "/recruiter/:path*",
//     "/serviceprovider/:path*",
//     "/user/:path*",
//   ],
// };
// import { withAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";

// export default withAuth(
//   function middleware(req) {
//     const token = req.nextauth?.token;
//     const path = req.nextUrl.pathname;
//     const role = token?.role;

//     // ૧. રોલ વાઈઝ સિક્યોરિટી
//     if (path.startsWith("/admin") && role !== "admin") {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }

//     if (path.startsWith("/recruiter") && role !== "recruiter") {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }

//     if (path.startsWith("/serviceprovider") && role !== "serviceprovider") {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }

//     if (path.startsWith("/user") && role !== "user") {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }

//     // ૨. Cache Control
//     const response = NextResponse.next();
//     response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
//     response.headers.set('Pragma', 'no-cache');
//     response.headers.set('Expires', '0');

//     return response;
//   },
//   {
//     callbacks: {
//       authorized: ({ token }) => !!token,
//     },
//     pages: {
//       signIn: "/login",
//       error: "/login",
//     },
//     // ✅ આ લાઈન પ્રોડક્શન માટે સૌથી મહત્વની છે
//     secret: process.env.NEXTAUTH_SECRET,
//   }
// );

// export const config = {
//   matcher: [
//     "/admin/:path*",
//     "/recruiter/:path*",
//     "/serviceprovider/:path*",
//     "/user/:path*",
//   ],
// };
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const RESERVED_SUBDOMAINS = new Set(["www", "admin", "api", "app", "mail", "ftp"]);

function buildRequestHeaders(req) {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", req.nextUrl.pathname);
  return headers;
}

/** Rewrite username.domain.com → /p/username for published portfolio sites */
function rewritePortfolioSubdomain(req) {
  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0];
  const path = req.nextUrl.pathname;
  const requestHeaders = buildRequestHeaders(req);

  if (path.startsWith("/api") || path.startsWith("/_next") || path.startsWith("/p/")) {
    return null;
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  let subdomain = null;

  if (rootDomain && !rootDomain.includes("localhost")) {
    const rootHost = rootDomain.split(":")[0];
    if (hostname !== rootHost && hostname !== `www.${rootHost}` && hostname.endsWith(`.${rootHost}`)) {
      subdomain = hostname.slice(0, -(rootHost.length + 1));
    }
  } else if (hostname.endsWith(".localhost")) {
    subdomain = hostname.replace(/\.localhost$/, "");
  }

  if (!subdomain || RESERVED_SUBDOMAINS.has(subdomain) || subdomain.includes(".")) {
    return null;
  }

  const url = req.nextUrl.clone();
  url.pathname = `/p/${subdomain}${path === "/" ? "" : path}`;
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export default withAuth(
  function middleware(req) {
    const subRewrite = rewritePortfolioSubdomain(req);
    if (subRewrite) return subRewrite;

    const token = req.nextauth?.token;
    const path = req.nextUrl.pathname;
    const role = token?.role;

    if (path.startsWith("/p/")) {
      const requestHeaders = buildRequestHeaders(req);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // ✅ ૧. રજીસ્ટ્રેશન પેજ અને API ને ચેકમાંથી મુક્ત કરો
    if (
      path === "/recruiter/register" ||
      path === "/serviceprovider/register" ||
      path === "/api/recruiter/register" ||
      path === "/api/serviceprovider/register"
    ) {
      const requestHeaders = buildRequestHeaders(req);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // Helper function to handle unauthorized access securely
    const handleUnauthorized = (req) => {
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized access" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      return NextResponse.redirect(new URL("/login", req.url));
    };

    // ૨. રોલ વાઈઝ સિક્યોરિટી (Protects BOTH Pages and APIs)
    if ((path.startsWith("/admin") || path.startsWith("/api/admin")) && role !== "admin" && role !== "staff") {
      if (
        (path === "/api/admin/events" ||
         path === "/api/admin/modules/libraries" ||
         path === "/api/admin/coupons" ||
         path.startsWith("/api/admin/modules/")) &&
        req.method === "GET"
      ) {
        const requestHeaders = buildRequestHeaders(req);
        return NextResponse.next({ request: { headers: requestHeaders } });
      }
      if (path === "/api/admin/bulk-vacancies" && (req.method === "GET" || ((role === "user" || role === "candidate") && req.method === "POST"))) {
        const requestHeaders = buildRequestHeaders(req);
        return NextResponse.next({ request: { headers: requestHeaders } });
      }
      return handleUnauthorized(req);
    }

    if ((path.startsWith("/recruiter") || path.startsWith("/api/recruiter")) && role !== "recruiter") {
      if (path === "/api/recruiter/companies") {
        const requestHeaders = buildRequestHeaders(req);
        return NextResponse.next({ request: { headers: requestHeaders } });
      }
      return handleUnauthorized(req);
    }

    if ((path.startsWith("/serviceprovider") || path.startsWith("/api/serviceprovider")) && role !== "serviceprovider") {
      return handleUnauthorized(req);
    }

    if ((path.startsWith("/user") || path.startsWith("/api/user")) && role !== "user" && role !== "candidate") {
      return handleUnauthorized(req);
    }

    // ૩. Cache Control
    const requestHeaders = buildRequestHeaders(req);
    const responseWithRequestHeaders = NextResponse.next({ request: { headers: requestHeaders } });
    responseWithRequestHeaders.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    responseWithRequestHeaders.headers.set('Pragma', 'no-cache');
    responseWithRequestHeaders.headers.set('Expires', '0');

    return responseWithRequestHeaders;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        if (path.startsWith("/p/")) return true;
        if (
          path === "/recruiter/register" ||
          path === "/serviceprovider/register" ||
          path === "/api/recruiter/register" ||
          path === "/api/serviceprovider/register"
        ) return true;

        const host = req.headers.get("host") || "";
        const hostname = host.split(":")[0];
        if (hostname.endsWith(".localhost")) {
          const sub = hostname.replace(/\.localhost$/, "");
          if (sub && !RESERVED_SUBDOMAINS.has(sub)) return true;
        }
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
        if (rootDomain && !rootDomain.includes("localhost")) {
          const rootHost = rootDomain.split(":")[0];
          if (hostname.endsWith(`.${rootHost}`) && hostname !== rootHost && hostname !== `www.${rootHost}`) {
            return true;
          }
        }

        const protectedPrefixes = [
          "/admin", "/recruiter", "/serviceprovider", "/user",
          "/api/admin", "/api/recruiter", "/api/serviceprovider", "/api/user"
        ];
        if (protectedPrefixes.some((p) => path.startsWith(p))) {
          return !!token;
        }

        return true;
      },
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
