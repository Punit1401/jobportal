"use client";

import React, { useState, useCallback } from "react";

export default function SeoProTemplate({ data, isDraft }) {
  const [cart, setCart] = useState({});
  const [toast, setToast] = useState("");
  const [rating, setRating] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);

  const scrollSec = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const addCart = (name, price) => {
    setCart((prev) => ({
      ...prev,
      [name]: { name, price: parseInt(String(price).replace(/\D/g, ""), 10) || 0, qty: (prev[name]?.qty || 0) + 1 },
    }));
    showToast(`${name} added to cart!`);
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const changeQty = (name, delta) => {
    setCart((prev) => {
      const next = { ...prev };
      if (!next[name]) return next;
      next[name] = { ...next[name], qty: next[name].qty + delta };
      if (next[name].qty <= 0) delete next[name];
      return next;
    });
  };

  return (
    <div className="seo-site min-h-screen bg-[#f5f9f9] text-[#1e2a2a] text-sm font-sans">
      <style jsx global>{`
        .seo-site {
          --seo-deep: #0a2f2f;
          --seo-teal: #2c6e6e;
          --seo-emerald: #2e8b57;
          --seo-mint: #d0f0e4;
          --seo-gold: #e6b800;
          --seo-gradient: linear-gradient(145deg, #2c6e6e, #1a4a4a);
        }
        .seo-site .page-wrap { width: 100%; min-height: 100vh; margin: 0 auto; background: white; overflow: hidden; }
        .seo-site .nav { background: rgba(255,255,255,0.97); padding: 12px 28px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(46,139,87,0.15); position: sticky; top: 0; z-index: 99; }
        .seo-site .nav-logo { width: 36px; height: 36px; background: var(--seo-gradient); border-radius: 9px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; }
        .seo-site .nav-link { padding: 6px 12px; border-radius: 30px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; background: none; }
        .seo-site .nav-link:hover { background: var(--seo-gradient); color: white; }
        .seo-site .hero { background: linear-gradient(145deg, #f5f9f9, white); padding: 48px 28px 40px; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 32px; align-items: center; position: relative; overflow: hidden; }
        @media (max-width: 768px) { .seo-site .hero { grid-template-columns: 1fr; } }
        .seo-site .hero-title { font-size: 28px; font-weight: 800; line-height: 1.15; color: var(--seo-deep); }
        .seo-site .hero-grad { background: var(--seo-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .seo-site .btn-primary { padding: 10px 20px; background: var(--seo-gradient); color: white; border: none; border-radius: 30px; font-size: 12px; font-weight: 700; cursor: pointer; }
        .seo-site .btn-secondary { padding: 10px 20px; background: transparent; color: var(--seo-deep); border: 2px solid var(--seo-teal); border-radius: 30px; font-size: 12px; font-weight: 700; cursor: pointer; }
        .seo-site .sec { padding: 40px 28px; }
        .seo-site .sec-alt { background: #f5f9f9; }
        .seo-site .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        @media (max-width: 768px) { .seo-site .services-grid, .seo-site .products-grid, .seo-site .blogs-grid { grid-template-columns: 1fr; } }
        .seo-site .svc-card { background: white; border: 1px solid rgba(46,139,87,0.1); border-radius: 16px; padding: 16px; }
        .seo-site .products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .seo-site .prod-card { background: white; border: 1px solid rgba(46,139,87,0.1); border-radius: 16px; overflow: hidden; }
        .seo-site .blogs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .seo-site .footer { background: var(--seo-deep); border-top: 3px solid var(--seo-emerald); padding: 28px; color: rgba(255,255,255,0.7); }
        .seo-site .fab { position: fixed; right: 20px; bottom: 20px; width: 46px; height: 46px; background: var(--seo-gradient); border: none; color: white; border-radius: 50%; cursor: pointer; z-index: 999; box-shadow: 0 6px 16px rgba(46,139,87,0.4); }
      `}</style>

      {isDraft && (
        <div className="bg-amber-100 text-amber-800 text-center py-2 text-xs font-bold uppercase tracking-widest">
          Draft — only you can see this until you publish
        </div>
      )}

      <div className="page-wrap">
        <nav className="nav">
          <div className="flex items-center gap-2 font-bold text-[var(--seo-deep)]">
            <div className="nav-logo">{data.brandInitial}</div>
            {data.brandName}
          </div>
          <div className="flex gap-1 flex-wrap">
            {["s-home", "s-about", "s-services", "s-products", "s-contact"].map((id, i) => (
              <button key={id} type="button" className="nav-link" onClick={() => scrollSec(id)}>
                {["Home", "About", "Services", "Products", "Contact"][i]}
              </button>
            ))}
          </div>
        </nav>

        <div className="hero" id="s-home">
          <div>
            <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              {data.role}
            </div>
            <h1 className="hero-title">
              {data.heroTitle} <span className="hero-grad">{data.role}</span>
            </h1>
            <p className="text-[#8a9c9c] mt-2 mb-4 max-w-md leading-relaxed">{data.heroSubtitle}</p>
            <div className="flex gap-5 mb-4">
              {data.stats.map((s, i) => (
                <div key={i}>
                  <div className="text-xl font-extrabold text-[var(--seo-emerald)]">{s.num}</div>
                  <div className="text-[9px] uppercase tracking-wider text-[#8a9c9c] font-semibold">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button type="button" className="btn-primary" onClick={() => scrollSec("s-contact")}>
                Get in touch
              </button>
              <button type="button" className="btn-secondary" onClick={() => scrollSec("s-services")}>
                View services
              </button>
            </div>
          </div>
          <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--seo-gradient)]" />
            <h4 className="font-bold text-[var(--seo-deep)] mb-3 pl-2">Profile snapshot</h4>
            {data.skills.slice(0, 4).map((skill) => (
              <div key={skill} className="flex justify-between py-2 border-b border-emerald-50 text-xs pl-2">
                <span>{skill}</span>
                <span className="font-bold text-[var(--seo-deep)]">★</span>
              </div>
            ))}
            {data.location && (
              <p className="text-center text-[var(--seo-emerald)] font-bold text-[11px] mt-3">📍 {data.location}</p>
            )}
          </div>
        </div>

        <div className="sec sec-alt" id="s-services">
          <h2 className="text-xl font-extrabold text-[var(--seo-deep)] mb-1">Services</h2>
          <p className="text-[#8a9c9c] text-xs mb-6">Powered by your profile skills & experience</p>
          <div className="services-grid">
            {data.services.map((svc, i) => (
              <div key={i} className="svc-card">
                <div className="text-xl mb-2">✨</div>
                <div className="font-bold text-[var(--seo-deep)] text-sm mb-1">{svc.title}</div>
                <p className="text-[11px] text-[#8a9c9c] leading-relaxed mb-2">{svc.desc}</p>
                {(svc.features || []).slice(0, 2).map((f) => (
                  <div key={f} className="text-[10px] text-[#1e2a2a]">✅ {f}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="sec" id="s-about">
          <h2 className="text-xl font-extrabold text-[var(--seo-deep)] mb-4">About</h2>
          <p className="text-sm leading-relaxed text-[#4a5c5c] max-w-2xl border-l-4 border-[var(--seo-emerald)] pl-4">{data.about}</p>
          {data.experiences.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="font-bold text-[var(--seo-deep)]">Experience</h3>
              {data.experiences.map((exp, idx) => (
                <div key={idx} className="p-4 bg-[#f5f9f9] rounded-xl border border-emerald-50">
                  <div className="font-bold">{exp.position || exp.jobDepartment}</div>
                  <div className="text-[var(--seo-emerald)] text-xs font-semibold">{exp.currentCompanyName}</div>
                  <p className="text-xs mt-2 opacity-80">{exp.jobDescription}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sec sec-alt" id="s-products">
          <h2 className="text-xl font-extrabold text-[var(--seo-deep)] mb-4">Offerings</h2>
          <div className="products-grid">
            {data.products.map((p, i) => (
              <div key={i} className="prod-card">
                <div className="h-24 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-3xl relative">
                  {p.emoji}
                  {p.badge && (
                    <span className="absolute top-2 right-2 bg-[var(--seo-gradient)] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-bold text-sm">{p.title}</div>
                  <div className="text-[var(--seo-emerald)] font-extrabold mt-1">{p.price}</div>
                  <button
                    type="button"
                    className="w-full mt-2 py-2 border-2 border-[var(--seo-emerald)] rounded-full text-xs font-bold hover:bg-[var(--seo-gradient)] hover:text-white hover:border-transparent transition-all"
                    onClick={() => addCart(p.title, p.price)}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sec" id="s-blogs">
          <h2 className="text-xl font-extrabold text-[var(--seo-deep)] mb-4">Insights</h2>
          <div className="blogs-grid">
            {data.blogs.map((b, i) => (
              <div key={i} className="bg-[#f5f9f9] border border-emerald-100 rounded-2xl overflow-hidden">
                <div className="h-20 flex items-center justify-center text-2xl bg-gradient-to-br from-blue-50 to-emerald-50">{b.emoji}</div>
                <div className="p-3">
                  <span className="text-[9px] font-bold text-[var(--seo-emerald)] uppercase">{b.category}</span>
                  <div className="font-bold text-xs mt-1 leading-snug">{b.title}</div>
                  <p className="text-[10px] text-[#8a9c9c] mt-1">{b.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sec sec-alt" id="s-contact">
          <h2 className="text-xl font-extrabold text-[var(--seo-deep)] mb-4">Contact</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-emerald-100 rounded-2xl p-5">
              <h3 className="font-bold text-sm border-b-2 border-[var(--seo-emerald)] inline-block pb-1 mb-4">Enquiry</h3>
              <input className="w-full bg-[#f5f9f9] border border-emerald-100 rounded-lg px-3 py-2 text-xs mb-2" placeholder="Full name" />
              <input className="w-full bg-[#f5f9f9] border border-emerald-100 rounded-lg px-3 py-2 text-xs mb-2" placeholder="Email" defaultValue={data.email} readOnly={!!data.email} />
              <textarea className="w-full bg-[#f5f9f9] border border-emerald-100 rounded-lg px-3 py-2 text-xs mb-2" rows={3} placeholder="Your message" />
              <button type="button" className="btn-primary w-full" onClick={() => showToast("Enquiry saved! We will contact you soon.")}>
                Send enquiry
              </button>
            </div>
            <div className="bg-white border border-emerald-100 rounded-2xl p-5">
              <h3 className="font-bold text-sm border-b-2 border-[var(--seo-emerald)] inline-block pb-1 mb-4">Review</h3>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" className={`text-lg ${n <= rating ? "text-[var(--seo-gold)]" : "text-gray-300"}`} onClick={() => setRating(n)}>
                    ★
                  </button>
                ))}
              </div>
              <textarea className="w-full bg-[#f5f9f9] border border-emerald-100 rounded-lg px-3 py-2 text-xs mb-2" rows={3} placeholder="Your feedback" />
              <button type="button" className="btn-primary w-full" onClick={() => showToast("Thank you for your review!")}>
                Submit review
              </button>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-xs">
            {data.email && <a href={`mailto:${data.email}`} className="text-[var(--seo-emerald)] font-bold">✉️ {data.email}</a>}
            {data.phone && <a href={`tel:${data.phone}`} className="text-[var(--seo-emerald)] font-bold">📞 {data.phone}</a>}
          </div>
        </div>

      </div>

      <footer className="footer text-center text-[10px] uppercase tracking-[0.3em] font-semibold">
        Powered by Career and Naukri
      </footer>

      <button type="button" className="fab" onClick={() => setCartOpen(true)} aria-label="Cart">
        🛒
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--seo-gold)] text-[var(--seo-deep)] rounded-full text-[9px] font-bold flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>

      {cartOpen && (
        <div className="fixed inset-0 bg-[#0a2f2f]/90 z-[9999] flex items-center justify-center p-4" onClick={() => setCartOpen(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center font-bold">Cart</div>
            <div className="p-4 flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Cart is empty</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.name} className="flex justify-between items-center py-2 border-b text-xs">
                    <span>{item.name}</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => changeQty(item.name, -1)}>−</button>
                      <span>{item.qty}</span>
                      <button type="button" onClick={() => changeQty(item.name, 1)}>+</button>
                      <span className="font-bold">₹{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t flex justify-between items-center">
              <span className="font-bold text-[var(--seo-emerald)]">₹{cartTotal.toLocaleString()}</span>
              <button type="button" className="btn-primary" onClick={() => { showToast("Checkout — connect payment in settings"); setCartOpen(false); }}>
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-20 right-5 bg-[var(--seo-deep)] text-white px-4 py-2 rounded-lg text-xs font-semibold z-[9999] border-l-4 border-[var(--seo-emerald)]">
          {toast}
        </div>
      )}
    </div>
  );
}
