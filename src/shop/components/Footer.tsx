import React from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowUpRight, Instagram, Twitter, Linkedin } from "lucide-react";

// ─── Footer ──────────────────────────────────────────────────────────────────

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const navLinks = {
    Shop: [
      { label: "Apparel",     to: "/?segment=APPAREL" },
      { label: "Bags",        to: "/?segment=BAGS" },
      { label: "Headwear",    to: "/?segment=HEADWEAR" },
      { label: "Footwear",    to: "/?segment=FOOTWEAR" },
      { label: "Accessories", to: "/?segment=ACCESSORIES" },
      { label: "Stationery",  to: "/?segment=STATIONERY" },
    ],
    Company: [
      { label: "About Us",    to: "/about" },
      { label: "Get a Quote", to: "/contact" },
      { label: "How It Works",to: "/how-it-works" },
      { label: "Bulk Orders", to: "/contact" },
    ],
    Account: [
      { label: "Login",       to: "/login" },
      { label: "My Orders",   to: "/orders" },
      { label: "My Cart",     to: "/cart" },
      { label: "Profile",     to: "/profile" },
    ],
  };

  return (
    <footer
      style={{
        background: "linear-gradient(170deg, #0f0c29 0%, #1a1a4e 55%, #0f172a 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* ── Background texture ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }} />

      {/* ── Ambient glow ── */}
      <div style={{
        position: "absolute", bottom: "-60px", left: "-60px",
        width: "350px", height: "350px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "-40px", right: "15%",
        width: "280px", height: "280px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ── Main footer content ── */}
      <div style={{
        maxWidth: "1280px", margin: "0 auto",
        padding: "64px 32px 0",
        position: "relative", zIndex: 1,
      }}>

        {/* Top section: brand + links */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
          gap: "48px",
          paddingBottom: "52px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>

          {/* ── Brand column ── */}
          <div>
            {/* Logo */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, color: "#fff", fontSize: "16px",
                boxShadow: "0 4px 16px rgba(16,185,129,0.35)",
                flexShrink: 0,
              }}>
                B
              </div>
              <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                BrandName
              </span>
            </div>

            <p style={{
              fontSize: "0.875rem",
              color: "rgba(148,163,184,0.75)",
              lineHeight: 1.75,
              maxWidth: "280px",
              marginBottom: "28px",
            }}>
              Your end-to-end B2B merchandise platform. Upload your logo, pick your products, and we'll handle fulfillment at scale.
            </p>

            {/* Contact info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
              {[
                { icon: <Mail size={13} />, text: "hello@brandname.com" },
                { icon: <Phone size={13} />, text: "+91 98765 43210" },
                { icon: <MapPin size={13} />, text: "Mumbai, Maharashtra" },
              ].map((item) => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#818cf8", flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.7)" }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { icon: <Instagram size={15} />, label: "Instagram" },
                { icon: <Twitter size={15} />,   label: "Twitter" },
                { icon: <Linkedin size={15} />,  label: "LinkedIn" },
              ].map((s) => (
                <button
                  key={s.label}
                  title={s.label}
                  style={{
                    width: "34px", height: "34px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(148,163,184,0.8)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(99,102,241,0.2)";
                    e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
                    e.currentTarget.style.color = "#a5b4fc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = "rgba(148,163,184,0.8)";
                  }}
                >
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          {/* ── Nav columns ── */}
          {Object.entries(navLinks).map(([section, links]) => (
            <div key={section}>
              <h4 style={{
                fontSize: "0.7rem",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(99,102,241,0.9)",
                marginBottom: "20px",
              }}>
                {section}
              </h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.to)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        color: "rgba(148,163,184,0.75)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "color 0.15s",
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#fff";
                        const arrow = e.currentTarget.querySelector(".arrow") as HTMLElement;
                        if (arrow) { arrow.style.opacity = "1"; arrow.style.transform = "translate(2px,-2px)"; }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "rgba(148,163,184,0.75)";
                        const arrow = e.currentTarget.querySelector(".arrow") as HTMLElement;
                        if (arrow) { arrow.style.opacity = "0"; arrow.style.transform = "translate(0,0)"; }
                      }}
                    >
                      {link.label}
                      <span className="arrow" style={{ opacity: 0, transition: "all 0.15s", display: "flex" }}>
                        <ArrowUpRight size={11} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Newsletter strip ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "32px 0",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          gap: "24px",
          flexWrap: "wrap",
        }}>
          <div>
            <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>
              Stay in the loop
            </p>
            <p style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.6)", margin: 0 }}>
              New products, bulk deals, and branding tips — straight to your inbox.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <input
              type="email"
              placeholder="you@company.com"
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                fontSize: "0.85rem",
                outline: "none",
                width: "220px",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                transition: "border 0.2s",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
            />
            <button
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                transition: "opacity 0.2s",
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 0",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <p style={{ fontSize: "0.75rem", color: "rgba(100,116,139,0.6)", margin: 0 }}>
            © {year} BrandName. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "24px" }}>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((label) => (
              <button
                key={label}
                style={{
                  background: "none", border: "none", padding: 0,
                  fontSize: "0.75rem", color: "rgba(100,116,139,0.6)",
                  cursor: "pointer", transition: "color 0.15s",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(148,163,184,0.9)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(100,116,139,0.6)")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;