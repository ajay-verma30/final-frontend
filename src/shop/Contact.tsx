import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle2, Building2, Users, Tag, MessageSquare } from "lucide-react";
import ShopNavbar from "./components/ShopNavbar";
import Footer from "./components/Footer";
import api from "../api/axiosInstance";

const CATEGORY_OPTIONS = [
  "Apparel",
  "Accessories",
  "Footwear",
  "Stationery",
  "Headwear",
  "Bags",
  "Multiple / Not sure yet",
];

interface FormState {
  companyName: string;
  email: string;
  phone: string;
  category: string;
  quantity: string;
  message: string;
}

const QUANTITY_RANGES = [
  "1 – 24 units",
  "25 – 99 units",
  "100 – 499 units",
  "500 – 999 units",
  "1,000+ units",
];

const Contact = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
  companyName: "",
  email: "",
  phone: "",
  category: "",
  quantity: "",
  message: "",
});
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await api.post("/api/contact/quote", form);
    setSubmitted(true);
  } catch (err) {
    alert("Something went wrong. Please try again.");
  }
};

  const isValid =
  form.companyName.trim() &&
  form.email.trim() &&
  form.category &&
  form.quantity &&
  form.message.trim();

  /* ── shared input style helper ── */
  const inputStyle = (name: string): React.CSSProperties => ({
    width: "100%",
    background: focused === name ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.04)",
    border: `1.5px solid ${focused === name ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: "12px",
    padding: "14px 16px",
    fontSize: "0.92rem",
    color: "#f1f5f9",
    outline: "none",
    transition: "all 0.2s",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    boxSizing: "border-box",
    boxShadow: focused === name ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
  });

  const labelStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "rgba(148,163,184,0.8)",
    marginBottom: "8px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  };


  

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29 0%, #1a1a4e 45%, #0f172a 100%)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <ShopNavbar />

      {/* Ambient orbs */}
      <div style={{
        position: "fixed", top: "-100px", left: "-100px", width: "500px", height: "500px",
        borderRadius: "50%", pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "fixed", bottom: "-80px", right: "-80px", width: "400px", height: "400px",
        borderRadius: "50%", pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
      }} />

      <div style={{
        maxWidth: "1100px", margin: "0 auto",
        padding: "48px 32px 80px",
        position: "relative", zIndex: 1,
      }}>

        {/* Back nav */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            padding: "8px 16px",
            color: "rgba(148,163,184,0.9)",
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: "48px",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        >
          <ArrowLeft size={14} /> Back to Shop
        </button>

        {/* Two-column layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap: "64px",
          alignItems: "start",
        }}>

          {/* ── Left panel: info ── */}
          <div>
            {/* Eyebrow */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "999px",
              padding: "5px 14px",
              marginBottom: "24px",
            }}>
              <span style={{
                fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
                color: "#a5b4fc", textTransform: "uppercase",
              }}>Request a Quote</span>
            </div>

            <h1 style={{
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              color: "#fff",
              margin: "0 0 20px 0",
              letterSpacing: "-0.02em",
            }}>
              Let's build<br />
              <span style={{
                background: "linear-gradient(90deg, #818cf8, #c084fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                something branded.
              </span>
            </h1>

            <p style={{
              fontSize: "0.95rem",
              color: "rgba(203,213,225,0.7)",
              lineHeight: 1.75,
              margin: "0 0 48px 0",
              maxWidth: "360px",
            }}>
              Tell us about your organization and what you're looking for. We'll get back to you
              within <strong style={{ color: "rgba(203,213,225,0.95)" }}>1 business day</strong> with
              a tailored quote and product options.
            </p>

            {/* Feature list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {[
                { icon: "🎨", title: "Custom Branding", desc: "Logo print, embroidery, or heat transfer on any product" },
                { icon: "📦", title: "Bulk Fulfillment", desc: "From 25 to 10,000+ units — we scale with you" },
                { icon: "⚡", title: "Fast Turnaround", desc: "Standard 5–7 days, rush options available" },
              ].map((item) => (
                <div key={item.title} style={{
                  display: "flex", gap: "14px", alignItems: "flex-start",
                }}>
                  <div style={{
                    width: "40px", height: "40px", flexShrink: 0,
                    background: "rgba(99,102,241,0.12)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    borderRadius: "10px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "18px",
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#e2e8f0", marginBottom: "3px" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.7)", lineHeight: 1.5 }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right panel: form ── */}
          <div>
            {submitted ? (
              /* Success state */
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: "24px",
                padding: "60px 40px",
                textAlign: "center",
              }}>
                <div style={{
                  width: "72px", height: "72px",
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 24px",
                }}>
                  <CheckCircle2 size={32} color="#818cf8" />
                </div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#fff", marginBottom: "12px" }}>
                  Quote Submitted!
                </h2>
                <p style={{ fontSize: "0.95rem", color: "rgba(148,163,184,0.8)", lineHeight: 1.65, marginBottom: "32px" }}>
                  Thanks, <strong style={{ color: "#e2e8f0" }}>{form.companyName}</strong>!<br />
                  We'll reach out within 1 business day with your custom quote.
                </p>
                <button
                  onClick={() => navigate("/")}
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "13px 28px",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
                  }}
                >
                  Back to Shop
                </button>
              </div>
            ) : (
              /* Form */
              <form
                onSubmit={handleSubmit}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "24px",
                  padding: "40px",
                  backdropFilter: "blur(16px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {/* Company name */}
                <div>
                  <label style={labelStyle}>
                    <Building2 size={12} color="#818cf8" />
                    Company / Organisation Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    onFocus={() => setFocused("companyName")}
                    onBlur={() => setFocused(null)}
                    placeholder="Acme Corp"
                    required
                    style={inputStyle("companyName")}
                  />
                </div>

                {/* Email */}
<div>
  <label style={labelStyle}>
    <Send size={12} color="#818cf8" />
    Email Address
  </label>
  <input
    type="email"
    name="email"
    value={form.email}
    onChange={handleChange}
    onFocus={() => setFocused("email")}
    onBlur={() => setFocused(null)}
    placeholder="you@company.com"
    required
    style={inputStyle("email")}
  />
</div>

{/* Phone */}
<div>
  <label style={labelStyle}>
    <Users size={12} color="#818cf8" />
    Phone Number
  </label>
  <input
    type="tel"
    name="phone"
    value={form.phone}
    onChange={handleChange}
    onFocus={() => setFocused("phone")}
    onBlur={() => setFocused(null)}
    placeholder="+1-555-000-0000"
    style={inputStyle("phone")}
  />
</div>

                {/* Category interest */}
                <div>
                  <label style={labelStyle}>
                    <Tag size={12} color="#818cf8" />
                    Product Category Interest
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    onFocus={() => setFocused("category")}
                    onBlur={() => setFocused(null)}
                    required
                    style={{
                      ...inputStyle("category"),
                      appearance: "none",
                      cursor: "pointer",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23818cf8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 16px center",
                      paddingRight: "40px",
                    }}
                  >
                    <option value="" disabled style={{ background: "#1a1a4e" }}>Select a category…</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat} style={{ background: "#1a1a4e" }}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estimated quantity */}
                <div>
                  <label style={labelStyle}>
                    <Users size={12} color="#818cf8" />
                    Estimated Quantity
                  </label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {QUANTITY_RANGES.map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, quantity: range }))}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "8px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          fontFamily: "'DM Sans', system-ui, sans-serif",
                          border: form.quantity === range
                            ? "1.5px solid rgba(99,102,241,0.8)"
                            : "1.5px solid rgba(255,255,255,0.1)",
                          background: form.quantity === range
                            ? "rgba(99,102,241,0.2)"
                            : "rgba(255,255,255,0.04)",
                          color: form.quantity === range ? "#a5b4fc" : "rgba(148,163,184,0.8)",
                          boxShadow: form.quantity === range ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
                        }}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label style={labelStyle}>
                    <MessageSquare size={12} color="#818cf8" />
                    Additional Details
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    onFocus={() => setFocused("message")}
                    onBlur={() => setFocused(null)}
                    placeholder="Tell us about your branding requirements, timeline, any specific customizations, or questions…"
                    required
                    rows={5}
                    style={{
                      ...inputStyle("message"),
                      resize: "vertical",
                      minHeight: "120px",
                    }}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!isValid}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                    background: isValid
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "rgba(99,102,241,0.2)",
                    color: isValid ? "#fff" : "rgba(165,180,252,0.5)",
                    border: "none",
                    borderRadius: "12px",
                    padding: "15px 28px",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    cursor: isValid ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    boxShadow: isValid ? "0 8px 32px rgba(99,102,241,0.4)" : "none",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    marginTop: "4px",
                  }}
                  onMouseEnter={(e) => {
                    if (isValid) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 12px 40px rgba(99,102,241,0.55)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = isValid ? "0 8px 32px rgba(99,102,241,0.4)" : "none";
                  }}
                >
                  <Send size={16} />
                  Submit Quote Request
                </button>

                <p style={{
                  textAlign: "center",
                  fontSize: "0.75rem",
                  color: "rgba(100,116,139,0.7)",
                  margin: 0,
                }}>
                  We'll respond within 1 business day · No spam, ever.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Contact;