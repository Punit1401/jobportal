// // src/app/api/auth/[...nextauth]/route.js
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import connectMongo from "@/lib/mongodb";
// import Admin from "@/models/Admin";
// import User from "@/models/User";
// import bcrypt from "bcryptjs";

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       id: "credentials",
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials, req) {
//         // Connect to DB
//         await connectMongo();

//         const { email, password } = credentials || {};

//         if (!email || !password) {
//           throw new Error("Missing email or password");
//         }

//         // 1) Try Admin collection first
//         const admin = await Admin.findOne({ email }).lean();
//         if (admin) {
//           // check password
//           const isValid = await bcrypt.compare(password, admin.password);
//           if (!isValid) {
//             throw new Error("Invalid credentials");
//           }

//           // Return the basic user object (NextAuth will include in token via callbacks)
//           return { id: admin._id.toString(), name: admin.name, email: admin.email, role: "admin" };
//         }

//         // 2) Try User collection
//         const user = await User.findOne({ email }).lean();
//         if (user) {
//           const isValid = await bcrypt.compare(password, user.password);
//           if (!isValid) {
//             throw new Error("Invalid credentials");
//           }

//           return { id: user._id.toString(), name: user.name, email: user.email, role: "user" };
//         }

//         // Not found in either collection
//         throw new Error("Invalid credentials");
//       },
//     }),
//   ],

//   session: {
//     strategy: "jwt",
//     maxAge: 12 * 60 * 60,   // 12 hours in seconds
//     updateAge: 60 * 60,     // refresh JWT if older than 1 hour (optional)
//   },

//   pages: {
//     signIn: "/login", // your login page path
//     // error: '/auth/error' // optional
//   },

//   callbacks: {
//     async jwt({ token, user, account }) {
//       // On first sign in, 'user' is available
//       if (user) {
//         token.id = user.id;
//         token.role = user.role || "user";
//         token.name = user.name || null;
//         token.email = user.email || null;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       // Attach custom fields to session
//       session.user = session.user || {};
//       session.user.id = token.id;
//       session.user.role = token.role;
//       session.user.name = token.name || session.user.name;
//       session.user.email = token.email || session.user.email;
//       return session;
//     },
//   },

//   secret: process.env.NEXTAUTH_SECRET,
//   debug: process.env.NODE_ENV === "development",
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
// // src/app/api/auth/[...nextauth]/route.js
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import connectMongo from "@/lib/mongodb";
// import Admin from "@/models/Admin";
// import User from "@/models/User";
// import Recruiter from "@/models/Recruiter";
// import ServiceProvider from "@/models/serviceprovider";
// import bcrypt from "bcryptjs";

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       id: "credentials",
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         try {
//           await connectMongo();
//           const { email, password } = credentials || {};

//           if (!email || !password) {
//             throw new Error("Email and password are required.");
//           }

//           const normalizedEmail = email.toLowerCase();

//           // Define all models and their roles to check
//           const rolesToCheck = [
//             { model: User, role: "user" },
//             { model: Admin, role: "admin" },
//             { model: Recruiter, role: "recruiter" },
//             { model: ServiceProvider, role: "serviceprovider" },

//           ];

//           // Loop through each role to find a match with email AND password
//           for (const item of rolesToCheck) {
//             const dbUser = await item.model.findOne({ email: normalizedEmail }).lean();

//             if (dbUser) {
//               // Check if password matches for THIS specific record
//               const isPasswordCorrect = await bcrypt.compare(password, dbUser.password);

//               if (isPasswordCorrect) {
//                 // Special check for Recruiter verification
//                 if (item.role === "recruiter" && !dbUser.isEmailVerified && dbUser.isVerified === false) {
//                   throw new Error("Please verify your email address.");
//                 }

//                 // Return user data if both email and password are valid
//                 return {
//                   id: dbUser._id.toString(),
//                   name: dbUser.name || dbUser.fullName || "User",
//                   email: dbUser.email,
//                   role: item.role,
//                 };
//               }
//               // If password doesn't match this record, continue to the next model
//             }
//           }

//           // If no record matches both email and password in any table
//           throw new Error("Invalid email or password.");

//         } catch (error) {
//           console.error("Auth Error:", error.message);
//           throw new Error(error.message);
//         }
//       },
//     }),
//   ],

//   session: {
//     strategy: "jwt",
//     maxAge: 12 * 60 * 60, // 12 hours
//   },

//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//         token.name = user.name;
//         token.email = user.email;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id;
//         session.user.role = token.role;
//         session.user.name = token.name;
//         session.user.email = token.email;
//       }
//       return session;
//     },
//   },

//   pages: {
//     signIn: "/login",
//     error: "/login",
//   },

//   secret: process.env.NEXTAUTH_SECRET,

//   cookies: {
//     sessionToken: {
//       name: `next-auth.session-token`,
//       options: {
//         httpOnly: true,
//         sameSite: 'lax',
//         path: '/',
//         secure: process.env.NODE_ENV === "production",
//       },
//     },
//   },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectMongo from "@/lib/mongodb";
import Admin from "@/models/Admin";
import User from "@/models/User";
import Recruiter from "@/models/Recruiter";
import ServiceProvider from "@/models/serviceprovider";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await connectMongo();
          const { email, password } = credentials || {};

          if (!email || !password) {
            throw new Error("Email and password are required.");
          }

          // ઈમેલને સાફ (Trim) અને લોઅરકેસ કરવો જેથી પ્રોડક્શનમાં ભૂલ ના થાય
          const normalizedEmail = email.toLowerCase().trim();

          const rolesToCheck = [
            { model: User, role: "user" },
            { model: Admin, role: "admin" },
            { model: Recruiter, role: "recruiter" },
            { model: ServiceProvider, role: "serviceprovider" },
          ];

          for (const item of rolesToCheck) {
            const dbUser = await item.model.findOne({ email: normalizedEmail }).lean();

            if (dbUser) {
              const isPasswordCorrect = await bcrypt.compare(password, dbUser.password);

              if (isPasswordCorrect) {
                // Recruiter માટે વેરિફિકેશન ચેક
                if (item.role === "recruiter" && dbUser.isEmailVerified === false && dbUser.isVerified === false) {
                  throw new Error("Please verify your email address.");
                }

                return {
                  id: dbUser._id.toString(),
                  name: dbUser.name || dbUser.fullName || "User",
                  email: dbUser.email,
                  role: item.role,
                };
              }
            }
          }

          throw new Error("Invalid email or password.");
        } catch (error) {
          console.error("Auth Error:", error.message);
          throw new Error(error.message);
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // 12 કલાક
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },

    // પ્રોડક્શન રિડાયરેક્ટ ફિક્સ
    async redirect({ url, baseUrl }) {
      // જો URL લોકલહોસ્ટ પર જતું હોય તો તેને મેન્યુઅલી બેઝ URL પર મોકલો
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  // લાઈવ સાઈટ (HTTPS) પર કૂકીઝ સેટ કરવા માટે
  // route.js માં કૂકીઝ સેક્શન આ રીતે અપડેટ કરો
  cookies: {
    sessionToken: {
      // લાઈવ સર્વર માટે આ નામ રાખવું જરૂરી છે
      name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };