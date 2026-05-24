import { useState, useRef, useEffect } from "react";
import CreatorBadge from "./CreatorBadge.jsx";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const EDGE_FN_URL  = `${SUPABASE_URL}/functions/v1/send-order-email`;

// Returns Supabase Storage URL for a dish photo
function storedImg(id) {
  return `${SUPABASE_URL}/storage/v1/object/public/menu-images/dish-${id}.jpg`;
}

// ── MENU DATA ────────────────────────────────────────────────────────────────
// fallback = stock photo shown until Chef Brown uploads a real one
const MENU = [
  // Rice
  { id:1,  category:"Rice",     emoji:"🍗", name:"Fried Rice + Grilled Chicken",        desc:"Fragrant fried rice with perfectly grilled chicken",            price:35, fallback:"https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=75" },
  { id:2,  category:"Rice",     emoji:"🐠", name:"Fried Rice + Grilled Fish",            desc:"Light fried rice with seasoned grilled tilapia",                price:30, fallback:"https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&q=75" },
  // Jollof
  { id:3,  category:"Jollof",   emoji:"🍛", name:"Jollof + Grilled Chicken",             desc:"Smoky party jollof with charcoal-grilled chicken",              price:35, fallback:"https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=75" },
  { id:4,  category:"Jollof",   emoji:"🐡", name:"Jollof + Grilled Fish",                desc:"Rich tomato jollof with whole grilled fish",                    price:30, fallback:"https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400&q=75" },
  // Assorted
  { id:5,  category:"Assorted", emoji:"🔥", name:"Assorted Fried Rice — Shito",         desc:"Sausage, chicken & gizzard on fried rice with shito",          price:50, fallback:"https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=75" },
  { id:6,  category:"Assorted", emoji:"🌶️", name:"Assorted Fried Rice — Chilly Pepper", desc:"Sausage, chicken & gizzard on fried rice with chilly pepper",  price:50, fallback:"https://images.unsplash.com/photo-1596560548464-f010b69e3d3a?w=400&q=75" },
  { id:7,  category:"Assorted", emoji:"🍲", name:"Assorted Jollof — Shito",             desc:"Sausage, chicken & gizzard on smoky jollof with shito",        price:50, fallback:"https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&q=75" },
  { id:8,  category:"Assorted", emoji:"🌶️", name:"Assorted Jollof — Chilly Pepper",   desc:"Sausage, chicken & gizzard on smoky jollof with chilly pepper",price:50, fallback:"https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&q=75" },
  // Sides
  { id:9,  category:"Sides",    emoji:"🥗", name:"Ghanaian Salad",                       desc:"Fresh garden salad with Ghanaian-style dressing",              price:20, fallback:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=75" },
  { id:10, category:"Sides",    emoji:"🥚", name:"Boiled Egg + Hot Pepper",              desc:"Classic boiled eggs with spicy hot pepper sauce",              price:10, fallback:"https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&q=75" },
];

const CATS = ["All", ...Array.from(new Set(MENU.map(m => m.category)))];

// ── THEME ─────────────────────────────────────────────────────────────────────
const C = {
  bg:"#1e0e04", bg2:"#2c1407", bg3:"#3a1a08",
  gold:"#c9930a", gold2:"#e8b535",
  text:"#f0ddb8", muted:"#8a6030", white:"#ffffff",
  border:"rgba(201,147,10,0.22)",
  green:"#1a5c38", red:"#7a1a10",
};

const pill = (extra={}) => ({
  fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700,
  fontSize:".82rem", letterSpacing:".08em", textTransform:"uppercase",
  padding:"8px 22px", borderRadius:50, border:"none", cursor:"pointer",
  transition:"all .18s", ...extra,
});
const goldBtn  = pill({ background:C.gold,  color:"#1a0900" });
const ghostBtn = pill({ background:"transparent", color:C.gold2, border:`1.5px solid ${C.gold}` });

// ── TOAST ─────────────────────────────────────────────────────────────────────
function Toast({ msg, show, err }) {
  return (
    <div style={{
      position:"fixed", bottom:28, left:"50%", zIndex:999, maxWidth:"90vw",
      transform:`translateX(-50%) translateY(${show?0:80}px)`,
      opacity:show?1:0, transition:"all .38s cubic-bezier(.34,1.56,.64,1)",
      pointerEvents:"none",
    }}>
      <div style={{
        background:err?C.red:C.green, color:"#fff",
        padding:"13px 22px", borderRadius:14, fontSize:".88rem", fontWeight:500,
        boxShadow:"0 8px 32px rgba(0,0,0,.5)", lineHeight:1.5, textAlign:"center",
      }}>{msg}</div>
    </div>
  );
}

// ── MENU CARD ─────────────────────────────────────────────────────────────────
function Card({ item, qty, onAdd, onRemove }) {
  const sel = qty > 0;
  // Try Supabase Storage first; fall back to stock photo on error
  const [imgSrc, setImgSrc] = useState(storedImg(item.id));
  return (
    <div style={{
      background:C.bg2, borderRadius:18, overflow:"hidden",
      border:`1.5px solid ${sel?C.gold:C.border}`,
      boxShadow:sel?`0 0 0 3px rgba(201,147,10,.18), 0 12px 36px rgba(0,0,0,.3)`:"none",
      transform:sel?"translateY(-3px)":"none",
      transition:"all .2s",
    }}>
      <img src={imgSrc} alt={item.name}
        style={{ width:"100%", height:155, objectFit:"cover", display:"block", background:C.bg3 }}
        onError={()=>setImgSrc(item.fallback)} />
      <div style={{ padding:"15px 17px 17px" }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:".63rem", fontWeight:700, letterSpacing:".18em", textTransform:"uppercase", color:C.gold, marginBottom:4 }}>{item.category}</div>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:".97rem", textTransform:"uppercase", color:C.white, lineHeight:1.2, marginBottom:5 }}>{item.name}</div>
        <div style={{ fontSize:".77rem", color:C.muted, lineHeight:1.5, marginBottom:13 }}>{item.desc}</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:"1.05rem", color:C.gold2 }}>GHS {item.price}</span>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {[{lbl:"−",action:()=>onRemove(item.id),active:false,dim:qty===0},{lbl:"+",action:()=>onAdd(item.id),active:sel,dim:false}].map((b,i)=>(
              <button key={i} onClick={b.action} style={{
                width:30,height:30,borderRadius:"50%",
                border:`1.5px solid ${b.active?C.gold:C.border}`,
                background:b.active?C.gold:C.bg3,
                color:b.active?"#1a0900":C.text,
                fontSize:"1.1rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,
                opacity:b.dim?.4:1,transition:"all .15s",
              }}>{b.lbl}</button>
            ))}
            <span style={{ fontWeight:600,minWidth:18,textAlign:"center",fontSize:".95rem", order:-1 }}>{qty}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CART DRAWER ───────────────────────────────────────────────────────────────
function CartDrawer({ cart, onClose, onAdd, onRemove, onCheckout }) {
  const items = MENU.filter(m => cart[m.id] > 0);
  const total = items.reduce((s,m) => s + m.price*cart[m.id], 0);
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.65)",backdropFilter:"blur(6px)" }} />
      <div style={{ position:"fixed",right:0,top:0,bottom:0,width:"min(400px,100vw)",zIndex:201,background:C.bg2,borderLeft:`1.5px solid ${C.border}`,display:"flex",flexDirection:"column" }}>
        <div style={{ padding:"22px 22px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:"1.35rem",textTransform:"uppercase",letterSpacing:".06em",color:C.gold2 }}>🛒 Your Order</span>
          <button onClick={onClose} style={{ background:"transparent",border:`1.5px solid ${C.border}`,color:C.muted,borderRadius:"50%",width:34,height:34,cursor:"pointer",fontSize:"1.1rem",display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
        </div>
        <div style={{ flex:1,padding:"18px 22px",overflowY:"auto" }}>
          {items.length===0
            ? <div style={{ textAlign:"center",padding:"60px 0",color:C.muted,fontStyle:"italic",fontSize:".9rem" }}>Your cart is empty.<br/>Pick something delicious!</div>
            : items.map(item=>(
              <div key={item.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:"1.8rem",flexShrink:0 }}>{item.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:".86rem",textTransform:"uppercase",color:C.white,lineHeight:1.2 }}>{item.name}</div>
                  <div style={{ fontSize:".76rem",color:C.muted,marginTop:2 }}>GHS {item.price} each · Subtotal: GHS {item.price*cart[item.id]}</div>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:7,flexShrink:0 }}>
                  <button onClick={()=>onRemove(item.id)} style={{ width:26,height:26,borderRadius:"50%",border:`1.5px solid ${C.border}`,background:C.bg3,color:C.text,fontSize:".9rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>−</button>
                  <span style={{ fontWeight:600,minWidth:16,textAlign:"center",fontSize:".88rem" }}>{cart[item.id]}</span>
                  <button onClick={()=>onAdd(item.id)}  style={{ width:26,height:26,borderRadius:"50%",border:`1.5px solid ${C.gold}`,background:C.gold,color:"#1a0900",fontSize:".9rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>+</button>
                  <button onClick={()=>{for(let i=0;i<20;i++)onRemove(item.id);}} style={{ background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:".78rem",padding:4 }} title="Remove">✕</button>
                </div>
              </div>
            ))
          }
        </div>
        {items.length>0&&(
          <div style={{ padding:"18px 22px",borderTop:`1px solid ${C.border}` }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:".9rem",textTransform:"uppercase",letterSpacing:".08em" }}>Total</span>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"1.5rem",color:C.gold2 }}>GHS {total}</span>
            </div>
            <button style={{ ...goldBtn,width:"100%",padding:"16px",fontSize:"1rem" }} onClick={onCheckout}>Proceed to Checkout →</button>
          </div>
        )}
      </div>
    </>
  );
}

// ── FORM FIELD WRAPPER ────────────────────────────────────────────────────────
function Field({ label, req, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:"block",fontFamily:"'Barlow Condensed',sans-serif",fontSize:".68rem",fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.gold,marginBottom:6 }}>
        {label}{req&&<span style={{ color:C.gold2 }}> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputBase = {
  width:"100%", padding:"13px 16px",
  border:`1.5px solid ${C.border}`, borderRadius:12,
  background:C.bg3, color:C.text,
  fontFamily:"'DM Sans',sans-serif", fontSize:".94rem",
  outline:"none", WebkitAppearance:"none", appearance:"none",
  transition:"border-color .18s",
};

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [cart, setCart]       = useState({});
  const [cat,  setCat]        = useState("All");
  const [drawer, setDrawer]   = useState(false);
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast,  setToast]    = useState({ msg:"", show:false, err:false });
  const [form,   setForm]     = useState({ name:"", phone:"", location:"", method:"Delivery", notes:"" });

  const orderRef = useRef(null);
  let toastTimer;

  const showToast = (msg, err=false, dur=5500) => {
    setToast({ msg, show:true, err });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>setToast(t=>({...t,show:false})), dur);
  };

  const addItem    = id => setCart(c=>({...c,[id]:(c[id]||0)+1}));
  const removeItem = id => setCart(c=>{const n={...c,[id]:Math.max(0,(c[id]||0)-1)};if(!n[id])delete n[id];return n;});

  const cartItems = MENU.filter(m=>cart[m.id]>0);
  const cartTotal = cartItems.reduce((s,m)=>s+m.price*cart[m.id],0);
  const cartCount = cartItems.reduce((s,m)=>s+cart[m.id],0);
  const filtered  = cat==="All" ? MENU : MENU.filter(m=>m.category===cat);

  const inp = id => ({ ...inputBase, borderColor: focused===id ? C.gold : C.border });
  const selStyle = id => ({
    ...inp(id),
    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%23c9930a' stroke-width='1.8' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center",
    paddingRight:36, cursor:"pointer",
  });

  const handleCheckout = () => {
    setDrawer(false);
    setTimeout(()=>orderRef.current?.scrollIntoView({behavior:"smooth",block:"start"}), 120);
  };

  const handleSubmit = async () => {
    const { name, phone, location, method, notes } = form;
    if (!name.trim())      { showToast("Please enter your name.", true); return; }
    if (!phone.trim())     { showToast("Please enter your phone number.", true); return; }
    if (!location.trim())  { showToast("Please enter your delivery location.", true); return; }
    if (!cartItems.length) { showToast("Add at least one item to your order.", true); return; }

    // Generate order number: CB + date digits + random 3-digit suffix
    // e.g. CB-20250514-042
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GH", { timeZone:"Africa/Accra" })
      .split("/").reverse().join("").replace(/\//g,""); // YYYYMMDD
    const suffix = String(Math.floor(Math.random() * 900) + 100); // 100–999
    const orderNumber = `CB-${dateStr}-${suffix}`;

    const items = cartItems.map(m=>({ name:m.name, qty:cart[m.id], unitPrice:m.price, subtotal:m.price*cart[m.id] }));
    const orderedAt = now.toLocaleString("en-GH", { timeZone:"Africa/Accra" });

    setLoading(true);
    try {
      const res = await fetch(EDGE_FN_URL, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ orderNumber, customerName:name, customerPhone:phone, deliveryLocation:location, deliveryMethod:method, items, total:cartTotal, notes, orderedAt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||"Server error");

      showToast(`✅ Order ${orderNumber} confirmed, ${name}! Chef Brown has been notified and will start preparing your meal.`, false, 9000);
      setCart({});
      setForm({ name:"", phone:"", location:"", method:"Delivery", notes:"" });
    } catch(e) {
      console.error(e);
      showToast("Could not send order. Please call 0544248387 directly.", true);
    } finally {
      setLoading(false);
    }
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:#1e0e04;margin:0}
        input::placeholder,textarea::placeholder{color:rgba(138,96,48,.4)!important}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .hc>*{animation:fadeUp .65s ease both}
        .hc>*:nth-child(1){animation-delay:.08s}.hc>*:nth-child(2){animation-delay:.18s}
        .hc>*:nth-child(3){animation-delay:.28s}.hc>*:nth-child(4){animation-delay:.38s}
        .hc>*:nth-child(5){animation-delay:.46s}.hc>*:nth-child(6){animation-delay:.54s}
        .bob{animation:bob 3s ease-in-out infinite}
        .hvr-gold:hover{background:#e8b535!important;transform:scale(1.03)!important}
        .hvr-outline:hover{background:rgba(201,147,10,.1)!important}
        .hvr-lift:hover{transform:translateY(-4px)!important;box-shadow:0 14px 40px rgba(0,0,0,.35)!important;border-color:#c9930a!important}
        .fpill:hover{border-color:#c9930a!important;color:#c9930a!important}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:#1e0e04}
        ::-webkit-scrollbar-thumb{background:rgba(201,147,10,.3);border-radius:3px}
      `}</style>

      <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'DM Sans',sans-serif", overflowX:"hidden" }}>

        {/* NAV */}
        <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 24px",background:"rgba(30,14,4,.9)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${C.border}` }}>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:"1.1rem",textTransform:"uppercase",letterSpacing:".06em",color:C.gold2 }}>Chef Brown</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif",fontSize:".66rem",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:C.muted,marginTop:-2 }}>Taste &amp; Tell Eatery</div>
          </div>
          <button className="hvr-gold" onClick={()=>setDrawer(true)} style={{ ...goldBtn,display:"flex",alignItems:"center",gap:8,padding:"9px 18px",fontSize:".88rem" }}>
            🛒 Cart
            {cartCount>0&&<span style={{ background:"#1a0900",color:C.gold2,borderRadius:"50%",width:20,height:20,fontSize:".7rem",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center" }}>{cartCount}</span>}
          </button>
        </nav>

        {/* HERO */}
        <section style={{ position:"relative",minHeight:"100svh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"100px 24px 64px",overflow:"hidden" }}>
          <div style={{ position:"absolute",inset:0,backgroundImage:`url(https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1400&q=55)`,backgroundSize:"cover",backgroundPosition:"center",filter:"brightness(.16) saturate(.7)",zIndex:0 }} />
          <div style={{ position:"absolute",top:-80,right:-100,width:320,height:320,borderRadius:"40% 60% 30% 70%",background:C.gold,opacity:.1,zIndex:1 }} />
          <div style={{ position:"absolute",bottom:-60,left:-80,width:240,height:240,borderRadius:"50% 30% 60% 40%",background:C.gold,opacity:.08,zIndex:1 }} />
          <div className="hc" style={{ position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center" }}>
            <div className="bob" style={{ fontSize:"3.6rem",marginBottom:14 }}>👨‍🍳</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif",fontSize:".7rem",fontWeight:700,letterSpacing:".22em",textTransform:"uppercase",color:C.gold,background:"rgba(201,147,10,.12)",border:`1px solid ${C.border}`,borderRadius:20,padding:"5px 14px",marginBottom:18 }}>
              📍 Watico Campus Gate, Kesstown
            </div>
            <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"clamp(3.2rem,13vw,7rem)",lineHeight:1,textTransform:"uppercase",letterSpacing:".02em",color:C.gold2,marginBottom:4 }}>
              <span style={{ color:C.white }}>Chef </span>Brown
            </h1>
            <p style={{ fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:"clamp(1.3rem,5vw,2.2rem)",textTransform:"uppercase",letterSpacing:".14em",color:"rgba(255,255,255,.5)",marginBottom:4 }}>Taste &amp; Tell</p>
            <p style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"clamp(.95rem,2.5vw,1.2rem)",color:C.muted,marginBottom:30,letterSpacing:".06em" }}>Eatery</p>
            <div style={{ width:60,height:2,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"0 auto 26px" }} />
            <p style={{ fontSize:".95rem",color:"rgba(240,221,184,.65)",maxWidth:400,lineHeight:1.75,marginBottom:38 }}>
              Homemade Ghanaian meals made fresh daily — smoky jollof, fried rice, assorted plates, and more.
            </p>
            <div style={{ display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",marginBottom:28 }}>
              <a href="#menu"  className="hvr-gold"    style={{ ...goldBtn, textDecoration:"none",padding:"15px 38px" }}>View Menu</a>
              <a href="#order" className="hvr-outline" style={{ ...ghostBtn,textDecoration:"none",padding:"14px 38px" }}>Order Now</a>
            </div>
            <div style={{ fontSize:".82rem",color:C.muted,display:"flex",alignItems:"center",gap:6 }}>
              📞 Call for booking: <strong style={{ color:C.text }}>0544248387</strong>
            </div>
          </div>
        </section>

        {/* MENU */}
        <section id="menu" style={{ padding:"80px 24px",maxWidth:940,margin:"0 auto" }}>
          <p style={{ fontFamily:"'Barlow Condensed',sans-serif",fontSize:".7rem",fontWeight:700,letterSpacing:".22em",textTransform:"uppercase",color:C.gold,marginBottom:6 }}>What's cooking today</p>
          <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"clamp(2rem,6vw,3.2rem)",textTransform:"uppercase",color:C.white,marginBottom:28,lineHeight:1.05 }}>
            Everyday <span style={{ color:C.gold2 }}>Menu</span>
          </h2>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:28 }}>
            {CATS.map(c=>(
              <button key={c} className="fpill" onClick={()=>setCat(c)} style={{
                fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:".8rem",
                letterSpacing:".1em",textTransform:"uppercase",padding:"7px 18px",
                borderRadius:50,border:`1.5px solid ${cat===c?C.gold:C.border}`,
                background:cat===c?C.gold:"transparent",
                color:cat===c?"#1a0900":C.muted,
                cursor:"pointer",transition:"all .18s",
              }}>{c}</button>
            ))}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))",gap:18 }}>
            {filtered.map(item=>(
              <div className="hvr-lift" key={item.id} style={{ transition:"all .2s" }}>
                <Card item={item} qty={cart[item.id]||0} onAdd={addItem} onRemove={removeItem} />
              </div>
            ))}
          </div>
          {cartCount>0&&(
            <div style={{ textAlign:"center",marginTop:36 }}>
              <button className="hvr-gold" onClick={()=>setDrawer(true)} style={{ ...goldBtn,padding:"15px 36px",fontSize:"1rem" }}>
                View Order ({cartCount} item{cartCount!==1?"s":""}) — GHS {cartTotal}
              </button>
            </div>
          )}
        </section>

        {/* ORDER FORM */}
        <section id="order" ref={orderRef} style={{ background:C.bg2 }}>
          <div style={{ maxWidth:680,margin:"0 auto",padding:"72px 24px" }}>
            <p style={{ fontFamily:"'Barlow Condensed',sans-serif",fontSize:".7rem",fontWeight:700,letterSpacing:".22em",textTransform:"uppercase",color:C.gold,marginBottom:6 }}>Almost there</p>
            <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"clamp(2rem,6vw,3rem)",textTransform:"uppercase",color:C.white,marginBottom:32,lineHeight:1.05 }}>
              Place Your <span style={{ color:C.gold2 }}>Order</span>
            </h2>
            <div style={{ background:C.bg,border:`1.5px solid ${C.border}`,borderRadius:24,padding:"34px 28px" }}>
              <div style={{ textAlign:"center",marginBottom:28 }}>
                <span style={{ fontSize:"3rem",display:"block",marginBottom:10 }}>👨‍🍳</span>
                <h3 style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"1.9rem",color:C.gold2,marginBottom:4 }}>Place Your Order</h3>
                <p style={{ fontSize:".8rem",color:C.muted }}>Chef Brown Taste &amp; Tell Eatery</p>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
                <Field label="Your Name" req>
                  <input style={inp("name")} placeholder="Enter your name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} onFocus={()=>setFocused("name")} onBlur={()=>setFocused(null)} />
                </Field>
                <Field label="Phone Number" req>
                  <input style={inp("phone")} type="tel" placeholder="Enter your phone number" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} onFocus={()=>setFocused("phone")} onBlur={()=>setFocused(null)} />
                </Field>
              </div>
              <Field label="Delivery Location" req>
                <input style={inp("loc")} placeholder="e.g. Room 12, Block C, Kesstown" value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} onFocus={()=>setFocused("loc")} onBlur={()=>setFocused(null)} />
              </Field>
              <Field label="Delivery Method">
                <select style={selStyle("method")} value={form.method} onChange={e=>setForm(f=>({...f,method:e.target.value}))} onFocus={()=>setFocused("method")} onBlur={()=>setFocused(null)}>
                  <option>Delivery</option>
                  <option>Self Pickup</option>
                </select>
              </Field>
              <Field label="Special Instructions">
                <textarea style={{ ...inp("notes"),resize:"vertical",minHeight:88 }} placeholder="Any special requests, allergies, etc." value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} onFocus={()=>setFocused("notes")} onBlur={()=>setFocused(null)} />
              </Field>

              {cartItems.length>0 ? (
                <div style={{ background:"rgba(201,147,10,.07)",border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px",marginBottom:18 }}>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:".72rem",letterSpacing:".14em",textTransform:"uppercase",color:C.gold,marginBottom:10 }}>Order Summary</div>
                  {cartItems.map(m=>(
                    <div key={m.id} style={{ display:"flex",justifyContent:"space-between",fontSize:".85rem",padding:"5px 0",borderBottom:`1px solid rgba(201,147,10,.1)` }}>
                      <span style={{ color:C.text }}>{m.emoji} {m.name} × {cart[m.id]}</span>
                      <span style={{ color:C.gold2,fontWeight:600 }}>GHS {m.price*cart[m.id]}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10 }}>
                    <span style={{ fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:".88rem",textTransform:"uppercase",letterSpacing:".1em" }}>Total</span>
                    <span style={{ fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"1.45rem",color:C.gold2 }}>GHS {cartTotal}</span>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign:"center",padding:"18px 0 22px",fontSize:".84rem",color:C.muted,fontStyle:"italic" }}>
                  No items yet — <a href="#menu" style={{ color:C.gold,textDecoration:"none" }}>browse the menu above</a>
                </div>
              )}

              <button className="hvr-gold" onClick={handleSubmit} disabled={loading}
                style={{ ...goldBtn,width:"100%",padding:"17px",fontSize:"1.05rem",display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:loading?.6:1,cursor:loading?"not-allowed":"pointer" }}>
                {loading
                  ? <><span style={{ width:18,height:18,border:"2.5px solid rgba(26,9,0,.3)",borderTopColor:"#1a0900",borderRadius:"50%",animation:"spin .7s linear infinite",flexShrink:0 }} /> Sending Order…</>
                  : "Confirm Order"}
              </button>
              <p style={{ textAlign:"center",marginTop:18,fontSize:".8rem",color:C.muted }}>
                📞 Or call us directly: <strong style={{ color:C.text }}>0544248387</strong>
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <div style={{ background:C.bg3,borderTop:`1px solid ${C.border}`,padding:"18px 24px",textAlign:"center",fontSize:".86rem",color:C.muted }}>
          📍 <strong style={{ color:C.text }}>Watico Campus Gate (Kesstown)</strong>
          &nbsp;·&nbsp; 📞 <strong style={{ color:C.text }}>0544248387</strong>
        </div>
        <footer style={{ textAlign:"center",padding:"22px",fontSize:".74rem",color:"rgba(138,96,48,.4)",borderTop:`1px solid ${C.border}` }}>
          © 2025 Chef Brown Taste &amp; Tell Eatery
        </footer>

        {drawer&&<CartDrawer cart={cart} onClose={()=>setDrawer(false)} onAdd={addItem} onRemove={removeItem} onCheckout={handleCheckout} />}
        <Toast msg={toast.msg} show={toast.show} err={toast.err} />
        <CreatorBadge />
      </div>
    </>
  );
}
