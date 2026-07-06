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

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;
    const path = req.nextUrl.pathname;
    const role = token?.role;

    // ✅ ૧. રજીસ્ટ્રેશન પેજને ચેકમાંથી મુક્ત કરો (આ લાઈન ઉમેરી છે)
    if (path === "/recruiter/register") {
      return NextResponse.next();
    }

    // ૨. રોલ વાઈઝ સિક્યોરિટી
    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (path.startsWith("/recruiter") && role !== "recruiter") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (path.startsWith("/serviceprovider") && role !== "serviceprovider") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (path.startsWith("/user") && role !== "user") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // ૩. Cache Control
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  },
  {
    callbacks: {
      // ✅ રજીસ્ટ્રેશન પેજ માટે ટોકન વગર પણ પરમિશન આપવી પડશે
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path === "/recruiter/register") return true;
        return !!token;
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
    "/admin/:path*",
    "/recruiter/:path*",
    "/serviceprovider/:path*",
    "/user/:path*",
  ],
};