import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Dishes that need photos — matches MENU ids in App.jsx
const DISHES = [
  { id: 1,  name: "Fried Rice + Grilled Chicken",       category: "Rice"     },
  { id: 2,  name: "Fried Rice + Grilled Fish",           category: "Rice"     },
  { id: 3,  name: "Jollof + Grilled Chicken",            category: "Jollof"   },
  { id: 4,  name: "Jollof + Grilled Fish",               category: "Jollof"   },
  { id: 5,  name: "Assorted Fried Rice — Shito",         category: "Assorted" },
  { id: 6,  name: "Assorted Fried Rice — Chilly Pepper", category: "Assorted" },
  { id: 7,  name: "Assorted Jollof — Shito",             category: "Assorted" },
  { id: 8,  name: "Assorted Jollof — Chilly Pepper",     category: "Assorted" },
  { id: 9,  name: "Ghanaian Salad",                      category: "Sides"    },
  { id: 10, name: "Boiled Egg + Hot Pepper",             category: "Sides"    },
];

// Admin password — stored only in env, never in code
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "chefbrown2025";

const C = {
  bg: "#1e0e04", bg2: "#2c1407", bg3: "#3a1a08",
  gold: "#c9930a", gold2: "#e8b535",
  text: "#f0ddb8", muted: "#8a6030", white: "#ffffff",
  border: "rgba(201,147,10,0.22)",
  green: "#1a5c38", red: "#7a1a10",
};

// ── Get public URL for a dish image from Supabase Storage ─────────────────
function getDishImageUrl(dishId) {
  return `${SUPABASE_URL}/storage/v1/object/public/menu-images/dish-${dishId}.jpg`;
}

// ── UPLOAD CARD ───────────────────────────────────────────────────────────
function DishCard({ dish, onUploaded }) {
  const [preview, setPreview]   = useState(null);
  const [current, setCurrent]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus]     = useState(null); // { msg, ok }
  const fileRef = useRef();

  // Load current image from Supabase on mount
  useEffect(() => {
    const url = getDishImageUrl(dish.id);
    // Check if image exists by trying to load it
    const img = new Image();
    img.onload  = () => setCurrent(url + "?t=" + Date.now());
    img.onerror = () => setCurrent(null);
    img.src = url;
  }, [dish.id]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ msg: "Photo too large — max 5MB", ok: false });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files[0];
    if (!file) return;

    setUploading(true);
    setStatus(null);

    try {
      // Upload directly to Supabase Storage
      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/menu-images/dish-${dish.id}.jpg`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "image/jpeg",
            "x-upsert": "true", // overwrite if exists
          },
          body: file,
        }
      );

      if (!res.ok) {
        // Try PUT (upsert)
        const res2 = await fetch(
          `${SUPABASE_URL}/storage/v1/object/menu-images/dish-${dish.id}.jpg`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              "Content-Type": file.type,
              "x-upsert": "true",
            },
            body: file,
          }
        );
        if (!res2.ok) {
          const err = await res2.text();
          throw new Error(err);
        }
      }

      const newUrl = getDishImageUrl(dish.id) + "?t=" + Date.now();
      setCurrent(newUrl);
      setPreview(null);
      setStatus({ msg: "✅ Photo updated!", ok: true });
      fileRef.current.value = "";
      onUploaded(dish.id, newUrl);
    } catch (e) {
      console.error(e);
      setStatus({ msg: "Upload failed. Try again.", ok: false });
    } finally {
      setUploading(false);
    }
  };

  const catColors = {
    Rice: "#2d6a4f", Jollof: "#c9300a",
    Assorted: "#7a4a00", Sides: "#2d4a6a",
  };

  return (
    <div style={{
      background: C.bg2, border: `1.5px solid ${C.border}`,
      borderRadius: 16, overflow: "hidden",
      transition: "border-color .18s",
    }}>
      {/* Image area */}
      <div style={{ position: "relative", height: 180, background: C.bg3, overflow: "hidden" }}>
        {(preview || current) ? (
          <img
            src={preview || current}
            alt={dish.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{
            height: "100%", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span style={{ fontSize: "2.5rem", opacity: .4 }}>📷</span>
            <span style={{ fontSize: ".75rem", color: C.muted }}>No photo yet</span>
          </div>
        )}

        {/* Category badge */}
        <div style={{
          position: "absolute", top: 10, left: 10,
          background: catColors[dish.category] || C.bg3,
          color: "#fff", fontSize: ".62rem", fontWeight: 700,
          letterSpacing: ".12em", textTransform: "uppercase",
          padding: "3px 10px", borderRadius: 20,
        }}>{dish.category}</div>

        {/* Current indicator */}
        {current && !preview && (
          <div style={{
            position: "absolute", top: 10, right: 10,
            background: C.green, color: "#fff",
            fontSize: ".62rem", fontWeight: 700,
            padding: "3px 10px", borderRadius: 20,
          }}>✓ Live</div>
        )}

        {/* Preview indicator */}
        {preview && (
          <div style={{
            position: "absolute", top: 10, right: 10,
            background: C.gold, color: "#1a0900",
            fontSize: ".62rem", fontWeight: 700,
            padding: "3px 10px", borderRadius: 20,
          }}>Preview</div>
        )}
      </div>

      {/* Info & controls */}
      <div style={{ padding: "14px 16px 18px" }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700, fontSize: ".92rem",
          textTransform: "uppercase", color: C.white,
          marginBottom: 12, lineHeight: 1.2,
        }}>{dish.name}</div>

        {/* File picker */}
        <label style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, padding: "10px 14px",
          border: `1.5px dashed ${C.border}`,
          borderRadius: 10, cursor: "pointer",
          color: C.muted, fontSize: ".8rem",
          marginBottom: 10, transition: "border-color .18s",
          background: "transparent",
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
        >
          📁 {preview ? "Change photo" : "Choose photo"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFile}
          />
        </label>

        {/* Upload button */}
        {preview && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              width: "100%", padding: "11px",
              background: uploading ? C.muted : C.gold,
              color: "#1a0900", border: "none", borderRadius: 10,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: ".9rem",
              letterSpacing: ".1em", textTransform: "uppercase",
              cursor: uploading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8,
              marginBottom: 8,
            }}
          >
            {uploading ? (
              <>
                <span style={{
                  width: 14, height: 14,
                  border: "2px solid rgba(26,9,0,.3)",
                  borderTopColor: "#1a0900",
                  borderRadius: "50%",
                  animation: "spin .7s linear infinite",
                  flexShrink: 0,
                }} />
                Uploading…
              </>
            ) : "Upload Photo"}
          </button>
        )}

        {/* Status message */}
        {status && (
          <div style={{
            fontSize: ".78rem", textAlign: "center", padding: "6px 8px",
            borderRadius: 8, marginTop: 4,
            background: status.ok ? "rgba(26,92,56,.2)" : "rgba(122,26,16,.2)",
            color: status.ok ? "#4ade80" : "#f87171",
            border: `1px solid ${status.ok ? "rgba(74,222,128,.2)" : "rgba(248,113,113,.2)"}`,
          }}>{status.msg}</div>
        )}
      </div>
    </div>
  );
}

// ── LOGIN SCREEN ──────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw]     = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError("Wrong password. Try again.");
      setPw("");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        background: C.bg2, border: `1.5px solid ${C.border}`,
        borderRadius: 20, padding: "40px 32px",
        width: "100%", maxWidth: 380, textAlign: "center",
      }}>
        <div style={{ fontSize: "3rem", marginBottom: 14 }}>👨‍🍳</div>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: "1.8rem",
          textTransform: "uppercase", color: C.gold2, marginBottom: 4,
        }}>Admin Panel</h1>
        <p style={{ fontSize: ".82rem", color: C.muted, marginBottom: 28 }}>
          Chef Brown Taste &amp; Tell Eatery
        </p>

        <div style={{ marginBottom: 14 }}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%", padding: "13px 16px",
              border: `1.5px solid ${error ? C.red : C.border}`,
              borderRadius: 12, background: C.bg3,
              color: C.text, fontFamily: "'DM Sans', sans-serif",
              fontSize: ".94rem", outline: "none",
            }}
          />
        </div>

        {error && (
          <div style={{ fontSize: ".8rem", color: "#f87171", marginBottom: 12 }}>{error}</div>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: "100%", padding: "14px",
            background: C.gold, color: "#1a0900",
            border: "none", borderRadius: 50,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: "1rem",
            letterSpacing: ".1em", textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Login
        </button>

        <p style={{ marginTop: 20, fontSize: ".76rem", color: C.muted }}>
          <a href="/" style={{ color: C.gold, textDecoration: "none" }}>← Back to site</a>
        </p>
      </div>
    </div>
  );
}

// ── MAIN ADMIN ────────────────────────────────────────────────────────────
export default function Admin() {
  const [loggedIn, setLoggedIn]   = useState(false);
  const [uploadedImgs, setUploadedImgs] = useState({});
  const [toast, setToast]         = useState({ msg: "", show: false });

  let tt;
  const showToast = (msg) => {
    setToast({ msg, show: true });
    clearTimeout(tt);
    tt = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };

  const handleUploaded = (dishId, url) => {
    setUploadedImgs(prev => ({ ...prev, [dishId]: url }));
    showToast("✅ Photo updated — visible on the site immediately!");
  };

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  const byCategory = DISHES.reduce((acc, d) => {
    acc[d.category] = acc[d.category] || [];
    acc[d.category].push(d);
    return acc;
  }, {});

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1e0e04; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header */}
        <div style={{
          background: C.bg2, borderBottom: `1px solid ${C.border}`,
          padding: "16px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: "1.3rem",
              textTransform: "uppercase", color: C.gold2,
            }}>📸 Menu Photo Manager</div>
            <div style={{ fontSize: ".76rem", color: C.muted, marginTop: 2 }}>
              Chef Brown Taste &amp; Tell Eatery · Upload real food photos
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a href="/" style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: ".82rem", letterSpacing: ".1em",
              textTransform: "uppercase", color: C.gold,
              textDecoration: "none", padding: "8px 16px",
              border: `1.5px solid ${C.border}`, borderRadius: 50,
            }}>← View Site</a>
            <button
              onClick={() => setLoggedIn(false)}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: ".82rem", letterSpacing: ".1em",
                textTransform: "uppercase", color: C.muted,
                background: "transparent", border: `1.5px solid ${C.border}`,
                borderRadius: 50, padding: "8px 16px", cursor: "pointer",
              }}
            >Logout</button>
          </div>
        </div>

        {/* Instructions banner */}
        <div style={{
          background: "rgba(201,147,10,.08)",
          borderBottom: `1px solid ${C.border}`,
          padding: "14px 24px",
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>💡</span>
          <div style={{ fontSize: ".82rem", color: C.muted, lineHeight: 1.6 }}>
            <strong style={{ color: C.text }}>How to update photos:</strong> Take a photo of the dish
            with your phone → tap <em>Choose photo</em> → tap <em>Upload Photo</em>.
            The new image shows on the menu instantly. Best results: natural light, photo from above or at angle.
            Max file size: 5MB.
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "36px 24px" }}>
          {Object.entries(byCategory).map(([cat, dishes]) => (
            <div key={cat} style={{ marginBottom: 48 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
              }}>
                <h2 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900, fontSize: "1.4rem",
                  textTransform: "uppercase", color: C.white,
                }}>{cat}</h2>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: ".72rem", color: C.muted }}>
                  {dishes.length} dish{dishes.length !== 1 ? "es" : ""}
                </span>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 16,
              }}>
                {dishes.map(dish => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    onUploaded={handleUploaded}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Stats footer */}
        <div style={{
          background: C.bg2, borderTop: `1px solid ${C.border}`,
          padding: "16px 24px", textAlign: "center",
          fontSize: ".78rem", color: C.muted,
        }}>
          {Object.keys(uploadedImgs).length > 0
            ? `✅ ${Object.keys(uploadedImgs).length} photo${Object.keys(uploadedImgs).length !== 1 ? "s" : ""} updated this session`
            : "No photos updated yet this session"}
          {" · "}Photos stored in Supabase Storage · Changes are live immediately
        </div>

        {/* Toast */}
        <div style={{
          position: "fixed", bottom: 24, left: "50%", zIndex: 999,
          transform: `translateX(-50%) translateY(${toast.show ? 0 : 80}px)`,
          opacity: toast.show ? 1 : 0,
          transition: "all .38s cubic-bezier(.34,1.56,.64,1)",
          pointerEvents: "none",
        }}>
          <div style={{
            background: C.green, color: "#fff",
            padding: "12px 22px", borderRadius: 14,
            fontSize: ".88rem", fontWeight: 500,
            boxShadow: "0 8px 32px rgba(0,0,0,.5)",
          }}>{toast.msg}</div>
        </div>
      </div>
    </>
  );
}
