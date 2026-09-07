"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ChevronDown, User, Wallet, ClipboardList } from "lucide-react";

const NavLink = ({ children, href = "#", isPrimary = false, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    className={`block px-3 py-2 text-sm font-bold transition duration-150 ease-in-out ${isPrimary
      ? "text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
      : "text-slate-700 hover:text-indigo-600"
      }`}
  >
    {children}
  </Link>
);

export default function NavBar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false); 
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [menuHeight, setMenuHeight] = useState(0);
  const menuRef = useRef(null);
  const { data: session } = useSession();
  const user = session?.user;
  const isRecruiter = user?.role === "recruiter";
  const isServiceProvider = user?.role === "serviceprovider";

  const profileHref = isRecruiter ? "/recruiter/profile" : isServiceProvider ? "/serviceprovider/profile" : "/user/profile";
  const walletHref = isRecruiter ? "/recruiter/wallet" : isServiceProvider ? "/serviceprovider/wallet" : "/user/wallet";
  const serviceRequestHref = isRecruiter
    ? "/recruiter/service-request"
    : isServiceProvider
      ? "/serviceprovider/service-request"
      : "/user/service-requests";

  // લોગો પર ક્લિક કરવાનું લોજિક
  const handleLogoClick = (e) => {
    if (e) e.preventDefault();

    if (!user) {
      router.push("/"); // જો લોગિન ના હોય તો Home પર મોકલશે
    } else {
      // જો લોગિન હોય તો રોલ મુજબ ડેશબોર્ડ પર મોકલશે
      switch (user.role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "recruiter":
          router.push("/recruiter/dashboard");
          break;
        case "serviceprovider":
          router.push("/serviceprovider/dashboard");
          break;
        case "user":
        case "candidate":
          router.push("/user/dashboard");
          break;
        default:
          router.push("/");
      }
    }
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/login");
  };

  useEffect(() => {
    if (menuRef.current) {
      setMenuHeight(isMenuOpen ? menuRef.current.scrollHeight : 0);
    }
  }, [isMenuOpen]);

  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About Us", href: "/pages/aboutus" },
    { name: "Careers", href: "/careers" },
    { name: "Blogs / Articles", href: "/blogs" },
    { name: "Contact Us", href: "/pages/contactus" },
    { name: "Philanthropy", href: "/pages/philanthropy" },
    //{ name: "Subscriptions", href: "/pages/subscriptions" },
  ];

  const featureLinks = [
    { name: "User Features", href: "/pages/features/user" },
    { name: "Recruiter Features", href: "/pages/features/recruiter" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md shadow-lg shadow-indigo-100/50 py-2" : "bg-white py-4"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo Section - Career and Naukri */}
          <div
            onClick={handleLogoClick}
            className="cursor-pointer flex-shrink-0 text-2xl font-black text-indigo-600 tracking-tighter hover:text-indigo-800 transition-colors mr-auto"
          >
            Job <span className="text-slate-900">Portal</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex flex-grow justify-center space-x-2 items-center">
            <div
              className="relative group"
              onMouseEnter={() => setIsFeaturesOpen(true)}
              onMouseLeave={() => setIsFeaturesOpen(false)}
            >
              {isFeaturesOpen && (
                <div className="absolute left-0 mt-0 w-56 bg-white border border-slate-100 shadow-xl rounded-2xl py-2 z-50">
                  {featureLinks.map((feature) => (
                    <Link
                      key={feature.href}
                      href={feature.href}
                      className="block px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      {feature.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href}>{link.name}</NavLink>
            ))}
          </div>

          {/* User Actions Section */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <div className="relative">
                <div 
                  className="flex items-center gap-3 cursor-pointer p-1.5 pr-3 hover:bg-slate-50 rounded-2xl transition-all"
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-sm font-black shadow-lg shadow-indigo-100">
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-0.5">
                      {user.role?.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                      {user.name?.split(' ')[0] || "User"} <ChevronDown size={14} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </div>

                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 shadow-2xl rounded-[1.5rem] py-3 z-[60] animate-in fade-in zoom-in-95 duration-200"
                    onMouseEnter={() => setIsUserMenuOpen(true)}
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-50 mb-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                    </div>

                    <Link href={profileHref} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                      <User size={18} /> Profile
                    </Link>
                    <Link href={walletHref} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                      <Wallet size={18} /> Digital Wallet
                    </Link>
                    <Link href={serviceRequestHref} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                      <ClipboardList size={18} /> Service Request
                    </Link>
                    
                    <div className="mt-2 pt-2 border-t border-slate-50 px-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <LogOut size={18} /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <NavLink href="/login">Login</NavLink>
                <Link
                  href="/register"
                  className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-indigo-50 transition-all"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-slate-50 shadow-xl"
        style={{ maxHeight: isMenuOpen ? "100vh" : "0px" }}
      >
        <div ref={menuRef} className="px-4 pt-4 pb-8 space-y-1">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="block w-full text-left px-4 py-3 text-base font-bold text-indigo-600 bg-indigo-50 rounded-xl mb-2"
          >
            Home
          </Link>

          <div className="space-y-1">
            <button
              onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
              className="flex justify-between items-center w-full px-4 py-3 text-base font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
            >
              Features <ChevronDown size={18} className={isFeaturesOpen ? 'rotate-180' : ''} />
            </button>
            {isFeaturesOpen && (
              <div className="pl-4 space-y-1 bg-slate-50 rounded-xl py-2">
                {featureLinks.map((feature) => (
                  <Link
                    key={feature.href}
                    href={feature.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-sm font-bold text-slate-600"
                  >
                    {feature.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 text-base font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
            >
              {link.name}
            </Link>
          ))}

          {user ? (
            <div className="pt-4 mt-4 border-t border-slate-100">
              <div className="px-4 py-3 mb-4 bg-slate-50 rounded-xl" onClick={handleLogoClick}>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{user.role?.replace('_', ' ')}</p>
                <p className="text-sm font-bold text-slate-700">{user.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 text-base font-bold text-white bg-rose-500 rounded-xl shadow-lg shadow-rose-100"
              >
                <LogOut size={18} />
                Log Out
              </button>
            </div>
          ) : (
            <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-4 text-base font-bold text-white bg-indigo-600 rounded-xl shadow-lg">Login</Link>
              <Link href="/register" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-4 text-base font-bold text-slate-600 bg-slate-50 rounded-xl border border-slate-100">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
