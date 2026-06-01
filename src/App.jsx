import { useState, useEffect, useCallback, useRef, Component } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@supabase/supabase-js";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from "recharts";

const SUPA_URL = "https://afftspqsbojqvjidpidz.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmZnRzcHFzYm9qcXZqaWRwaWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMDQ2OTQsImV4cCI6MjA4OTg4MDY5NH0.Rpyz7l7YQjm5wNsBMiKwotozMgLIoWGdrPGE2lD8RoM";
const db    = createClient(SUPA_URL, SUPA_KEY);
const TABLE = "return_cases";

const STATUS_LIST   = ["รับเรื่อง", "รอสินค้าตีกลับ", "ตรวจสอบแล้ว", "เสร็จสิ้น"];
const PLATFORM_LIST = ["Lazada", "Shopee", "TikTok", "อื่นๆ"];
const REASON_LIST   = ["ได้รับสินค้าไม่ครบ", "ได้รับสินค้าที่เสียหาย", "สินค้าชำรุดจากการขนส่ง", "เปลี่ยนใจ/สั่งผิด", "สินค้าเสียหาย", "อื่นๆ"];

/* ─── Design Tokens (skill-spec) ─────────────────────────────────
   Light: bg #eeeeee | accent #111111 — minimal, high contrast
   Dark:  bg #0f1117 | accent #7c5cfc — violet glow
─────────────────────────────────────────────────────────────────── */
const T = {
  l: {
    bg:          "#f3f4f6", // gray-100
    surface:     "#ffffff", // white
    raised:      "#ffffff", // white
    border:      "#e5e7eb", // gray-200
    borderLight: "#f3f4f6", // gray-100
    text:        "#1f2937", // gray-800
    sec:         "#4b5563", // gray-600
    muted:       "#9ca3af", // gray-400
    accent:      "#4f46e5", // indigo-600
    accentSoft:  "#e0e7ff", // indigo-100
    accentText:  "#4338ca", // indigo-700
    danger:      "#ef4444", // red-500
    dangerSoft:  "rgba(239, 68, 68, 0.1)",
    success:     "#10b981", // emerald-500
    successSoft: "rgba(16, 185, 129, 0.1)",
    warning:     "#f59e0b", // amber-500
    warningSoft: "rgba(245, 158, 11, 0.1)",
    info:        "#3b82f6", // blue-500
    infoSoft:    "rgba(59, 130, 246, 0.1)",
    sidebar:     "#ffffff",
    topbar:      "#ffffff",
    gridLine:    "#e5e7eb",
    tick:        "#9ca3af",
    g1: "linear-gradient(135deg, #4f46e5, #3b82f6)",
    g2: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    g3: "linear-gradient(135deg, #ef4444, #f87171)",
    g4: "linear-gradient(135deg, #10b981, #34d399)",
    glowSm: "0 1px 3px rgba(0,0,0,0.05)",
    glowMd: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
    glowLg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
  },
  d: {
    bg:          "#0f172a", // slate-900
    surface:     "#1e293b", // slate-800
    raised:      "#334155", // slate-700
    border:      "#334155", // slate-700
    borderLight: "#1e293b", // slate-800
    text:        "#f8fafc", // slate-50
    sec:         "#cbd5e1", // slate-300
    muted:       "#64748b", // slate-500
    accent:      "#6366f1", // indigo-500
    accentSoft:  "rgba(99, 102, 241, 0.15)",
    accentText:  "#818cf8", // indigo-400
    danger:      "#f87171", // red-400
    dangerSoft:  "rgba(248, 113, 113, 0.15)",
    success:     "#34d399", // emerald-400
    successSoft: "rgba(52, 211, 153, 0.15)",
    warning:     "#fbbf24", // amber-400
    warningSoft: "rgba(251, 191, 36, 0.15)",
    info:        "#60a5fa", // blue-400
    infoSoft:    "rgba(96, 165, 250, 0.15)",
    sidebar:     "#1e293b",
    topbar:      "#1e293b",
    gridLine:    "#334155",
    tick:        "#64748b",
    g1: "linear-gradient(135deg, #6366f1, #818cf8)",
    g2: "linear-gradient(135deg, #fbbf24, #fcd34d)",
    g3: "linear-gradient(135deg, #f87171, #fca5a5)",
    g4: "linear-gradient(135deg, #34d399, #6ee7b7)",
    glowSm: "0 1px 3px rgba(0,0,0,0.2)",
    glowMd: "0 4px 6px -1px rgba(0,0,0,0.3)",
    glowLg: "0 10px 15px -3px rgba(0,0,0,0.4)",
  }
};

const STATUS_META = (dk) => ({
  "รับเรื่อง":       { bg: dk ? "rgba(96,165,250,0.15)"  : "#eff6ff",  color: dk ? "#60a5fa" : "#2563eb",  border: dk ? "rgba(96,165,250,0.3)"  : "rgba(37,99,235,0.2)"  },
  "รอสินค้าตีกลับ": { bg: dk ? "rgba(251,191,36,0.15)"   : "#fffbeb",  color: dk ? "#fbbf24" : "#d97706",  border: dk ? "rgba(251,191,36,0.3)"   : "rgba(217,119,6,0.2)"  },
  "ตรวจสอบแล้ว":    { bg: dk ? "rgba(99,102,241,0.15)"  : "#eef2ff",  color: dk ? "#818cf8" : "#4f46e5",  border: dk ? "rgba(99,102,241,0.3)"  : "rgba(79,70,229,0.2)"   },
  "เสร็จสิ้น":      { bg: dk ? "rgba(52,211,153,0.15)"  : "#ecfdf5",  color: dk ? "#34d399" : "#059669",  border: dk ? "rgba(52,211,153,0.3)"  : "rgba(5,150,105,0.2)"   },
});

const PLAT_META = (dk) => ({
  Lazada:  { bg: dk ? "rgba(139, 92, 246, 0.15)" : "#f5f3ff", color: dk ? "#c4b5fd" : "#7c3aed" },
  Shopee:  { bg: dk ? "rgba(249, 115, 22, 0.15)" : "#fff7ed", color: dk ? "#fdba74" : "#ea580c" },
  TikTok:  { bg: dk ? "rgba(243, 244, 246, 0.1)" : "#f3f4f6", color: dk ? "#e5e7eb" : "#374151" },
  "อื่นๆ": { bg: dk ? "rgba(255, 255, 255, 0.05)" : "#f9fafb", color: dk ? "#9ca3af" : "#6b7280" },
});

const CHART_PALETTE = ["#4f46e5", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

const ACTION_STATUS_LIST = ["ส่งตัวเดิม", "ส่งตัวใหม่", "เก็บเข้าคลัง", "ช่างกำลังดำเนินการ", "รออะไหล่", "ซ่อมแล้ว เก็บเข้าคลังดี", "เก็บเข้าคลังเสีย", "รอซ่อม", "รอซ่อม คืนคลัง"];
const CARRIER_LIST = ["Thai Post", "Flash", "SPX", "LEX", "J&T", "อื่นๆ"];
const INCOMING_STATUS_LIST = ["รอตรวจเช็ค", "เช็คสินค้าแล้ว", "ไม่เคลม", "อื่นๆ"];

function unpackDetails(detailsStr) {
  const defaults = {
    note: "",
    carrier: "",
    incoming_tracking: "",
    incoming_status: "รอตรวจเช็ค",
    repair_date: "",
    repair_details: "",
    action_status: "ส่งตัวเดิม",
    operator: "",
    new_tracking: "",
    return_phone: ""
  };
  if (!detailsStr) return defaults;
  const trimmed = detailsStr.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      return { ...defaults, ...parsed };
    } catch (e) {
      // ignore, fall through
    }
  }
  return { ...defaults, note: detailsStr };
}

function packDetails(unpacked) {
  return JSON.stringify({
    note: unpacked.note || "",
    carrier: unpacked.carrier || "",
    incoming_tracking: unpacked.incoming_tracking || "",
    incoming_status: unpacked.incoming_status || "รอตรวจเช็ค",
    repair_date: unpacked.repair_date || "",
    repair_details: unpacked.repair_details || "",
    action_status: unpacked.action_status || "ส่งตัวเดิม",
    operator: unpacked.operator || "",
    new_tracking: unpacked.new_tracking || "",
    return_phone: unpacked.return_phone || ""
  });
}

/* ─── Missing Utility Components ──────────────────────────────── */

function Spin({ size = 18, color }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: `2.5px solid ${color || "rgba(255,255,255,0.3)"}`,
      borderTopColor: color || "#fff",
      borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0
    }}/>
  );
}

function Skel({ w = "100%", h = 16, r = 8, dk = false }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: dk
        ? "linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)"
        : "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.5s ease-in-out infinite"
    }}/>
  );
}

function CustomTooltip({ active, payload, label, C, suffix = "" }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={{
      background: C.raised, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: "10px 14px", boxShadow: "0 8px 20px rgba(0,0,0,0.12)", fontSize: 12
    }}>
      {label && <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>{label}</div>}
      {payload.map((entry, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color || entry.fill || C.accent, flexShrink: 0 }}/>
          <span style={{ color: C.sec }}>{entry.name || entry.dataKey}:</span>
          <span style={{ fontWeight: 700, color: C.text }}>{typeof entry.value === "number" ? entry.value.toLocaleString("th-TH") : entry.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyChart({ C, msg }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "48px 24px", color: C.muted, gap: 10
    }}>
      <i className="fas fa-chart-pie" style={{ fontSize: 36, opacity: 0.2 }}/>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{msg || "ไม่มีข้อมูลเพียงพอในการสร้างกราฟสถิติ"}</div>
    </div>
  );
}

const pad      = n => String(n).padStart(2, "0");
const fmtDate  = dt => {
  if (!dt) return "-";
  const d = new Date(dt);
  return isNaN(d) ? String(dt) : `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fmtMoney = n => (n != null && n !== "") ? "฿" + Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-";
const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

// Copy function with iframe fallback support
const copyToClipboard = (text, callback) => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => callback(true))
      .catch(() => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          callback(true);
        } catch (err) {
          callback(false);
        }
        document.body.removeChild(textArea);
      });
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      callback(true);
    } catch (err) {
      callback(false);
    }
    document.body.removeChild(textArea);
  }
};

function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  return { toasts, push };
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Dashboard ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, background: "rgba(239, 68, 68, 0.1)", borderRadius: 16, border: "1px dashed #ef4444", textAlign: "center", margin: "20px 0" }}>
          <i className="fas fa-triangle-exclamation" style={{ fontSize: 40, color: "#ef4444", marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>เกิดข้อผิดพลาดในการประมวลผลข้อมูลกราฟสถิติ</h3>
          <p style={{ fontSize: 12, opacity: 0.8, fontFamily: "monospace", marginBottom: 16 }}>{this.state.error?.toString()}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })} 
            style={{ padding: "8px 18px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
          >
            รีโหลดส่วนนี้อีกครั้ง
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
      @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

      /* ─── Reset ─── */
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      html {
        font-size: 14px;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overflow: visible;
      }
      body {
        font-family: 'DM Sans', 'IBM Plex Sans Thai', sans-serif;
        line-height: 1.6;
        transform: none !important;
        will-change: auto !important;
        overflow-x: hidden;
        background: #eeeeee;
      }
      #root { min-height: 100vh; overflow: visible; }

      /* ─── Scrollbar ─── */
      ::-webkit-scrollbar { width: 5px; height: 5px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.22); }
      [data-theme="dark"] ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }

      /* ─── Animations ─── */
      @keyframes spin      { to { transform: rotate(360deg); } }
      @keyframes fadeInUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
      @keyframes slideIn   { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:none; } }
      @keyframes scaleIn   { from { opacity:0; transform:scale(.96) translateY(8px); } to { opacity:1; transform:none; } }
      @keyframes overlayIn { from { opacity:0; } to { opacity:1; } }
      @keyframes modalSlide{ from { opacity:0; transform:scale(.96) translateY(16px); } to { opacity:1; transform:none; } }
      @keyframes shimmer   { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
      @keyframes glowPulse { 0%,100% { box-shadow:0 0 12px rgba(124,92,252,0.35); } 50% { box-shadow:0 0 28px rgba(124,92,252,0.65); } }
      @keyframes dotPulse  { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.6; transform:scale(.75); } }

      .fade-up  { animation: fadeInUp .4s cubic-bezier(.16,1,.3,1) both; }
      .scale-in { animation: scaleIn  .3s cubic-bezier(.16,1,.3,1) both; }
      .stagger > *:nth-child(1) { animation-delay:  0ms; }
      .stagger > *:nth-child(2) { animation-delay: 60ms; }
      .stagger > *:nth-child(3) { animation-delay:120ms; }
      .stagger > *:nth-child(4) { animation-delay:180ms; }

      /* ─── Input focus ring ─── */
      input, select, textarea {
        transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
        outline: none;
      }
      input:focus, select:focus, textarea:focus {
        border-color: #111 !important;
        box-shadow: 0 0 0 3px rgba(17,17,17,0.08) !important;
      }
      [data-theme="dark"] input:focus,
      [data-theme="dark"] select:focus,
      [data-theme="dark"] textarea:focus {
        border-color: #7c5cfc !important;
        box-shadow: 0 0 0 3px rgba(124,92,252,0.18) !important;
      }
      input::placeholder, textarea::placeholder { opacity: .45; }

      /* ─── Table ─── */
      table { border-spacing: 0; width: 100%; }
      a { text-decoration: none; }
      button { font-family: inherit; outline: none; }

      /* ─── reduced-motion ─── */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
      }
    `}</style>
  );
}

function Toasts({ toasts, C }) {
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none",
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "13px 18px 13px 14px", borderRadius: 12,
          background: C.raised,
          border: `1px solid ${t.type === "success" ? C.success + "30" : C.danger + "30"}`,
          boxShadow: C === T.d
            ? "0 8px 32px rgba(0,0,0,0.45)"
            : "0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
          fontSize: 13, fontWeight: 500, color: C.text, maxWidth: 360,
          animation: "slideIn .3s cubic-bezier(.16,1,.3,1) both",
          pointerEvents: "all",
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: t.type === "success" ? C.successSoft : C.dangerSoft,
          }}>
            <i
              className={`fas fa-${t.type === "success" ? "circle-check" : "circle-exclamation"}`}
              style={{ color: t.type === "success" ? C.success : C.danger, fontSize: 15 }}
            />
          </div>
          <span style={{ flex: 1, lineHeight: 1.45 }}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status, dk }) {
  const meta = STATUS_META(dk)[status] || STATUS_META(dk)["รับเรื่อง"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 99,
      fontSize: 11.5, fontWeight: 600, background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color, flexShrink: 0 }}/>
      {status}
    </span>
  );
}

function PlatBadge({ platform, dk }) {
  const meta = (PLAT_META(dk)[platform] || PLAT_META(dk)["อื่นๆ"]);
  const icons = { Lazada: "🛍️", Shopee: "🟠", TikTok: "🎵", "อื่นๆ": "📦" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 8px", borderRadius: 6,
      fontSize: 11, fontWeight: 700, background: meta.bg, color: meta.color, border: dk ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.02)"
    }}>
      <span style={{ fontSize: 10 }}>{icons[platform] || "📦"}</span>{platform}
    </span>
  );
}

function Card({ children, C, style = {}, hover = false, noPad = false }) {
  const [h, setH] = useState(false);
  const isDark = C === T.d;
  return (
    <div
      onMouseEnter={() => hover && setH(true)}
      onMouseLeave={() => hover && setH(false)}
      style={{
        background: C.raised,
        border: `1px solid ${h ? C.accent : C.border}`,
        borderRadius: 16,
        padding: noPad ? 0 : 24,
        boxShadow: h
          ? (isDark ? "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px " + C.accent + "22" : "0 8px 24px rgba(0,0,0,0.09)")
          : (isDark ? "0 2px 12px rgba(0,0,0,0.25)" : "0 1px 4px rgba(0,0,0,0.04)"),
        transition: "all .22s cubic-bezier(.16,1,.3,1)",
        transform: h ? "translateY(-3px)" : "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SHdr({ title, icon, C, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: C.accentSoft, color: C.accent,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0
      }}>
        <i className={`fas fa-${icon}`}/>
      </div>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, gradient, loading, delta, C }) {
  const [h, setH] = useState(false);
  const isDark = C === T.d;
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: C.raised,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: "20px 22px",
        position: "relative",
        overflow: "hidden",
        boxShadow: h
          ? (isDark ? C.glowSm : "0 6px 20px rgba(0,0,0,0.10)")
          : (isDark ? "0 2px 12px rgba(0,0,0,0.25)" : "0 1px 4px rgba(0,0,0,0.04)"),
        transform: h ? "translateY(-3px)" : "none",
        transition: "all .22s cubic-bezier(.16,1,.3,1)",
        cursor: "default",
      }}
    >
      {/* Accent bar top */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: gradient, borderRadius: "16px 16px 0 0",
      }}/>

      {/* Label + icon row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: .3, textTransform: "uppercase" }}>
          {label}
        </span>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: gradient,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, color: "#fff",
          boxShadow: isDark ? "0 3px 10px rgba(0,0,0,0.3)" : "0 3px 8px rgba(0,0,0,0.15)",
        }}>
          <i className={`fas fa-${icon}`}/>
        </div>
      </div>

      {/* Value */}
      {loading ? (
        <Skel w="55%" h={28} r={6} dk={isDark}/>
      ) : (
        <div style={{
          fontSize: 28, fontWeight: 700, lineHeight: 1.1,
          color: C.text, letterSpacing: "-0.8px",
          fontFamily: "'DM Sans',sans-serif",
        }}>
          {value}
        </div>
      )}

      {/* Delta */}
      {delta != null && !loading && (
        <div style={{
          display: "flex", alignItems: "center", gap: 4, marginTop: 8,
          fontSize: 11, fontWeight: 600,
          color: delta >= 0 ? C.success : C.danger,
        }}>
          <i className={`fas fa-arrow-${delta >= 0 ? "up" : "down"}`} style={{ fontSize: 9 }}/>
          <span>{Math.abs(delta)}% เทียบสัปดาห์ก่อน</span>
        </div>
      )}
    </div>
  );
}

function PrimaryBtn({ children, onClick, icon, loading = false, C, small = false }) {
  const [h, setH] = useState(false);
  const isDark = C === T.d;
  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: small ? "8px 16px" : "10px 20px",
        borderRadius: 8,
        background: C.accent,
        color: isDark ? "#fff" : "#fff",
        border: "none",
        cursor: loading ? "wait" : "pointer",
        fontSize: small ? 12 : 13,
        fontWeight: 600,
        letterSpacing: .1,
        boxShadow: h && !loading
          ? (isDark ? C.glowMd : "0 4px 14px rgba(0,0,0,0.22)")
          : (isDark ? C.glowSm : "0 2px 6px rgba(0,0,0,0.12)"),
        transform: h && !loading ? "translateY(-1px)" : "none",
        transition: "all .18s ease",
        whiteSpace: "nowrap",
        opacity: loading ? .75 : 1,
      }}
    >
      {loading ? <Spin size={13}/> : icon && <i className={`fas fa-${icon}`} style={{ fontSize: small ? 11 : 12 }}/>}
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, icon, C }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "10px 20px", borderRadius: 8,
        background: h ? C.accentSoft : "transparent",
        color: h ? C.accent : C.sec,
        border: `1.5px solid ${h ? C.accent : C.border}`,
        cursor: "pointer", fontSize: 13, fontWeight: 600,
        transition: "all .15s ease",
      }}
    >
      {icon && <i className={`fas fa-${icon}`}/>}{children}
    </button>
  );
}

function IconBtn({ icon, onClick, C, variant = "default", title = "", active = false }) {
  const [h, setH] = useState(false);
  const on = h || active;
  const configs = {
    default: { bg: on ? C.accentSoft : "transparent", color: on ? C.accent : C.muted, border: on ? C.accent : C.border },
    danger:  { bg: h  ? C.dangerSoft  : "transparent", color: h  ? C.danger  : C.muted, border: h  ? C.danger  : C.border },
    success: { bg: h  ? C.successSoft : "transparent", color: h  ? C.success : C.muted, border: h  ? C.success : C.border },
  };
  const cfg = configs[variant] || configs.default;
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: 36, height: 36, borderRadius: 8,
        border: `1px solid ${cfg.border}`,
        background: cfg.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: cfg.color, fontSize: 13,
        transition: "all .15s ease", flexShrink: 0,
      }}
    >
      <i className={`fas fa-${icon}`}/>
    </button>
  );
}

/* ─── Modal Portal helper ─────────────────────────────────────────
   Renders modal overlay directly inside document.body so that NO
   ancestor transform / overflow / stacking-context can misplace it.
   This guarantees true viewport-center on every screen and browser.
─────────────────────────────────────────────────────────────────── */
function ModalPortal({ children }) {
  const [el] = useState(() => {
    const div = document.createElement("div");
    div.style.cssText = "position:fixed;inset:0;z-index:9000;pointer-events:none;";
    return div;
  });

  useEffect(() => {
    document.body.appendChild(el);
    return () => document.body.removeChild(el);
  }, [el]);

  return createPortal(children, el);
}

function Modal({ open, onClose, title, icon, children, footer, maxW = 750, C }) {
  /* Lock body scroll while open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* ESC to close */
  useEffect(() => {
    const handleEsc = e => e.key === "Escape" && open && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose, open]);

  if (!open) return null;

  const overlay = (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        /* Overlay fills the entire visual viewport, independent of any
           ancestor overflow / transform / stacking context because this
           node is appended directly to <body> via ModalPortal           */
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9100,
        background: "rgba(15, 23, 42, 0.82)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
        pointerEvents: "all",
        /* Animate in */
        animation: "overlayIn .2s ease both",
      }}
    >
      <style>{`
        @keyframes overlayIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes modalSlide { from { opacity:0; transform:scale(.96) translateY(16px); } to { opacity:1; transform:none; } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.raised,
          borderRadius: 28,
          border: `1px solid ${C.border}`,
          boxShadow: "0 32px 64px -12px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.04)",
          width: "100%",
          maxWidth: maxW,
          /* Clamp height: never taller than 92 % of the visible viewport */
          maxHeight: "92dvh",
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "modalSlide .28s cubic-bezier(.16,1,.3,1) both",
          /* Ensure this box never escapes the overlay flex container */
          position: "relative",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: "20px 24px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: C.raised,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16, fontWeight: 700, color: C.text }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: C.accentSoft,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: C.accent, fontSize: 15,
            }}>
              <i className={`fas fa-${icon}`}/>
            </div>
            {title}
          </div>
          <IconBtn icon="xmark" onClick={onClose} C={C} variant="danger"/>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{
          padding: "24px",
          overflowY: "auto",
          flex: 1,
          minHeight: 0,   /* critical: lets flexbox shrink below content size */
          overscrollBehavior: "contain",
        }}>
          {children}
        </div>

        {/* ── Footer ── */}
        {footer && (
          <div style={{
            padding: "16px 24px",
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            background: C.raised,
            flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return <ModalPortal>{overlay}</ModalPortal>;
}

function Field({ label, req, full, children, C }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: full ? "1/-1" : undefined }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: C.sec, display: "flex", gap: 4, letterSpacing: .2 }}>
        {label}{req && <span style={{ color: C.danger }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function ReturnForm({ open, onClose, onSave, initial, C }) {
  const defaultForm = {
    date: nowLocal(), platform: "", store: "", staff: "", order_id: "", customer: "", address: "",
    phone: "", sku: "", price: "", reason: "", details: "", evidence_url: "", cod: "-", sla: "", status: "รับเรื่อง",
    note: "", carrier: "", incoming_tracking: "", incoming_status: "รอตรวจเช็ค",
    repair_date: "", repair_details: "", action_status: "ส่งตัวเดิม", operator: "", new_tracking: "", return_phone: ""
  };
  const [f, setF] = useState(defaultForm);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      const dt = initial.date ? (() => {
        const x = new Date(initial.date);
        x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
        return x.toISOString().slice(0, 16);
      })() : "";
      const unpacked = unpackDetails(initial.details);
      setF({
        ...defaultForm,
        ...initial,
        date: dt,
        price: initial.price || "",
        evidence_url: initial.evidence_url || "",
        note: unpacked.note || "",
        carrier: unpacked.carrier || "",
        incoming_tracking: unpacked.incoming_tracking || "",
        incoming_status: unpacked.incoming_status || "รอตรวจเช็ค",
        repair_date: unpacked.repair_date || "",
        repair_details: unpacked.repair_details || "",
        action_status: unpacked.action_status || "ส่งตัวเดิม",
        operator: unpacked.operator || "",
        new_tracking: unpacked.new_tracking || "",
        return_phone: unpacked.return_phone || ""
      });
    } else {
      setF({ ...defaultForm, date: nowLocal() });
    }
  }, [open, initial]);

  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  async function save() {
    if (!f.date) { alert("กรุณากรอกวันที่รับเรื่อง"); return; }
    if (!f.order_id.trim()) { alert("กรุณากรอกเลขคำสั่งซื้อ (Order ID)"); return; }
    if (!f.platform) { alert("กรุณาเลือกแพลตฟอร์ม"); return; }
    
    setBusy(true);
    try {
      const packed = packDetails({
        note: f.note,
        carrier: f.carrier,
        incoming_tracking: f.incoming_tracking,
        incoming_status: f.incoming_status,
        repair_date: f.repair_date,
        repair_details: f.repair_details,
        action_status: f.action_status,
        operator: f.operator,
        new_tracking: f.new_tracking,
        return_phone: f.return_phone
      });
      const payload = {
        ...f,
        details: packed
      };
      delete payload.note;
      delete payload.carrier;
      delete payload.incoming_tracking;
      delete payload.incoming_status;
      delete payload.repair_date;
      delete payload.repair_details;
      delete payload.action_status;
      delete payload.operator;
      delete payload.new_tracking;
      delete payload.return_phone;

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  const IS = getIS(C);
  const SS = getSS(C);

  return (
    <Modal open={open} onClose={onClose} title={initial ? "แก้ไขเคสคืนสินค้า" : "บันทึกเคสคืนสินค้าใหม่"} icon={initial ? "pen" : "plus"} C={C}
      footer={<>
        <GhostBtn onClick={onClose} C={C}>ยกเลิก</GhostBtn>
        <PrimaryBtn onClick={save} loading={busy} icon="floppy-disk" C={C}>บันทึกข้อมูล</PrimaryBtn>
      </>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="วันที่แจ้งเคส / รับเรื่อง" req C={C}><input type="datetime-local" style={IS} value={f.date || ""} onChange={set("date")}/></Field>
        <Field label="แพลตฟอร์ม" req C={C}>
          <select style={SS} value={f.platform || ""} onChange={set("platform")}>
            <option value="">-- เลือกแพลตฟอร์ม --</option>
            {PLATFORM_LIST.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="ร้านค้า (Store)" C={C}><input type="text" style={IS} placeholder="เช่น TOOLSTHAILAND" value={f.store || ""} onChange={set("store")}/></Field>
        <Field label="ผู้ดูแลเคส (Staff)" C={C}><input type="text" style={IS} placeholder="เช่น หมิว Lazada" value={f.staff || ""} onChange={set("staff")}/></Field>
        <Field label="เลขพัสดุที่ส่งเคลม / Order ID" req C={C}><input type="text" style={IS} placeholder="ป้อนรหัสอ้างอิงออเดอร์ หรือเลขพัสดุส่งเคลม" value={f.order_id || ""} onChange={set("order_id")}/></Field>
        <Field label="ขนส่งที่ลูกค้าส่งเคลม" C={C}>
          <select style={SS} value={f.carrier || ""} onChange={set("carrier")}>
            <option value="">-- เลือกขนส่ง --</option>
            {CARRIER_LIST.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="ชื่อผู้รับ/ลูกค้า (Customer)" C={C}><input type="text" style={IS} placeholder="ชื่อ-นามสกุล ลูกค้า" value={f.customer || ""} onChange={set("customer")}/></Field>
        <Field label="ที่อยู่ผู้รับสำหรับการส่งกลับ (Address)" full C={C}>
          <textarea rows={2} style={{ ...IS, resize: "vertical", minHeight: 60 }} placeholder="ที่อยู่ในการจัดส่งสินค้าตัวใหม่คืนแก่ลูกค้า" value={f.address || ""} onChange={set("address")}/>
        </Field>
        <Field label="เบอร์โทรศัพท์ลูกค้า" C={C}><input type="tel" style={IS} placeholder="0xx-xxx-xxxx" value={f.phone || ""} onChange={set("phone")}/></Field>
        <Field label="รหัสสินค้า SKU" C={C}><input type="text" style={IS} placeholder="เช่น SSCS-100" value={f.sku || ""} onChange={set("sku")}/></Field>
        <Field label="ราคาจำหน่าย (฿)" C={C}><input type="number" style={IS} placeholder="0.00" min="0" step="0.01" value={f.price || ""} onChange={set("price")}/></Field>
        <Field label="COD (บาท)" C={C}><input type="text" style={IS} placeholder="เช่น 450 หรือ - หากจ่ายแล้ว" value={f.cod || ""} onChange={set("cod")}/></Field>
        <Field label="สาเหตุการส่งคืน" C={C}>
          <select style={SS} value={f.reason || ""} onChange={set("reason")}>
            <option value="">-- เลือกสาเหตุ --</option>
            {REASON_LIST.map(r => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="รายละเอียดเพิ่มเติม" full C={C}>
          <textarea rows={3} style={{ ...IS, resize: "vertical", minHeight: 76 }} placeholder="คำอธิบาย อาการ หรือเหตุผลเพิ่มเติมโดยละเอียด..." value={f.note || ""} onChange={set("note")}/>
        </Field>
        <Field label="ลิงก์รูปหลักฐาน (Image URL)" C={C}><input type="url" style={IS} placeholder="https://image-host.com/evidence.jpg" value={f.evidence_url || ""} onChange={set("evidence_url")}/></Field>
        <Field label="ระยะเวลาแก้ไข (SLA)" C={C}><input type="text" style={IS} placeholder="เช่น 3 วัน" value={f.sla || ""} onChange={set("sla")}/></Field>
        <Field label="สถานะเคสหลัก" req C={C}>
          <select style={SS} value={f.status || "รับเรื่อง"} onChange={set("status")}>
            {STATUS_LIST.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <div style={{ gridColumn: "1/-1", margin: "8px 0", borderTop: `1px solid ${C.border}`, paddingTop: 16, fontWeight: 700, fontSize: 13, color: C.accent }}>
          ⚙️ ข้อมูลการตรวจสอบและการส่งซ่อม
        </div>
        <Field label="เลขพัสดุรับเข้าคลัง" C={C}><input type="text" style={IS} placeholder="ป้อนเลขพัสดุสินค้าที่รับเข้ามา" value={f.incoming_tracking || ""} onChange={set("incoming_tracking")}/></Field>
        <Field label="สถานะรับเข้า" C={C}>
          <select style={SS} value={f.incoming_status || "รอตรวจเช็ค"} onChange={set("incoming_status")}>
            {INCOMING_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="วันที่ซ่อม-เช็คสินค้า" C={C}><input type="datetime-local" style={IS} value={f.repair_date || ""} onChange={set("repair_date")}/></Field>
        <Field label="รายละเอียดงานซ่อมสินค้า" C={C}><input type="text" style={IS} placeholder="เช่น เปลี่ยนบอร์ดอะไหล่, ซ่อมสวิทช์ไฟ" value={f.repair_details || ""} onChange={set("repair_details")}/></Field>
        <Field label="สถานะดำเนินการส่งซ่อม" C={C}>
          <select style={SS} value={f.action_status || "ส่งตัวเดิม"} onChange={set("action_status")}>
            {ACTION_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="ผู้ดำเนินการ (Operator/ช่าง)" C={C}><input type="text" style={IS} placeholder="ชื่อช่างหรือผู้ดำเนินการ" value={f.operator || ""} onChange={set("operator")}/></Field>
        <Field label="เลขพัสดุส่งกลับใหม่" C={C}><input type="text" style={IS} placeholder="ป้อนเลขพัสดุใหม่ที่ส่งให้ลูกค้า" value={f.new_tracking || ""} onChange={set("new_tracking")}/></Field>
        <Field label="เบอร์โทรศัพท์สำหรับส่งกลับ (ถ้าต่างจากเดิม)" C={C}><input type="tel" style={IS} placeholder="0xx-xxx-xxxx" value={f.return_phone || ""} onChange={set("return_phone")}/></Field>
      </div>
    </Modal>
  );
}

function DelConfirm({ open, onClose, onConfirm, item, C }) {
  const [busy, setBusy] = useState(false);

  /* Lock body scroll while open */
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* ESC key */
  useEffect(() => {
    const h = e => e.key === "Escape" && open && onClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  async function handleDelete() {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <ModalPortal>
      <div
        onClick={e => e.target === e.currentTarget && onClose()}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9200,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 16px",
          pointerEvents: "all",
          animation: "overlayIn .2s ease both",
        }}
      >
        <div style={{
          background: C.raised, borderRadius: 20, border: `1px solid ${C.border}`,
          padding: "28px 24px 20px", maxWidth: 380, width: "100%", textAlign: "center",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
          animation: "modalSlide .28s cubic-bezier(.16,1,.3,1) both",
        }}>
          <div style={{
            width: 58, height: 58, background: C.dangerSoft, borderRadius: "50%", display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24, color: C.danger
          }}>
            <i className="fas fa-trash-can"/>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>ยืนยันลบเคสคืนสินค้านี้?</div>
          <div style={{ fontSize: 13, color: C.sec, marginBottom: 24, lineHeight: 1.6 }}>
            ต้องการลบรายการ Order ID: <br/>
            <strong style={{ color: C.text, fontFamily: "monospace", fontSize: 14 }}>{item?.order_id || ""}</strong> <br/>
            ผู้รับ: <strong style={{ color: C.text }}>{item?.customer || "-"}</strong> ใช่หรือไม่?<br/>
            <span style={{ color: C.danger, fontWeight: 600, fontSize: 11.5, display: "block", marginTop: 8 }}>⚠ ข้อมูลจะหายไปถาวรและไม่สามารถกู้คืนได้</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "10px 0", borderRadius: 8, background: "transparent", border: `1px solid ${C.border}`,
              color: C.sec, cursor: "pointer", fontSize: 13, fontWeight: 600
            }}>ยกเลิก</button>
            <button onClick={handleDelete} disabled={busy} style={{
              flex: 1, padding: "10px 0", borderRadius: 8, background: C.danger, border: "none",
              color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>
              {busy ? <Spin size={12}/> : <i className="fas fa-trash"/>}
              <span>ยืนยันลบ</span>
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function ReturnCasesPage({ returns, loading, triggerAdd, triggerEdit, onDelete, onEdit, C, dk, toast }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [delItem, setDelItem] = useState(null);
  const [copyStatus, setCopyStatus] = useState({});

  const counts = STATUS_LIST.reduce((a, s) => ({ ...a, [s]: returns.filter(r => r.status === s).length }), {});
  
  const filtered = returns.filter(r => {
    const matchesFilter = filter === "all" || r.status === filter;
    if (!matchesFilter) return false;
    
    if (!search) return true;
    const q = search.toLowerCase();
    const unpacked = unpackDetails(r.details);
    return [
      r.order_id,
      r.customer,
      r.phone,
      r.sku,
      r.staff,
      r.store,
      r.reason,
      unpacked.note,
      unpacked.carrier,
      unpacked.incoming_tracking,
      unpacked.new_tracking,
      unpacked.operator
    ].some(val => (val || "").toLowerCase().includes(q));
  });

  const handleCopy = (text, successMsg) => {
    copyToClipboard(text, (success) => {
      if (success) {
        setCopyStatus(p => ({ ...p, [text]: true }));
        toast(successMsg || "คัดลอกแล้ว");
        setTimeout(() => setCopyStatus(p => ({ ...p, [text]: false })), 2000);
      } else {
        toast("คัดลอกไม่สำเร็จ", "error");
      }
    });
  };

  const handleActionStatusChange = async (id, newStatus) => {
    const item = returns.find(r => r.id === id);
    if (!item) return;
    const unpacked = unpackDetails(item.details);
    unpacked.action_status = newStatus;
    const packed = packDetails(unpacked);
    await onEdit(id, { ...item, details: packed });
  };

  const handleIncomingStatusChange = async (id, newStatus) => {
    const item = returns.find(r => r.id === id);
    if (!item) return;
    const unpacked = unpackDetails(item.details);
    unpacked.incoming_status = newStatus;
    const packed = packDetails(unpacked);
    await onEdit(id, { ...item, details: packed });
  };

  const KPIS = [
    { label: "เคสทั้งหมด",          value: returns.length,               icon: "clipboard-list", gradient: C.g1 },
    { label: "รับเรื่องแล้ว",         value: counts["รับเรื่อง"] || 0,      icon: "inbox",          gradient: C.g2 },
    { label: "รอสินค้าตีกลับ",       value: counts["รอสินค้าตีกลับ"] || 0, icon: "truck-ramp-box", gradient: C.g3 },
    { label: "เสร็จสิ้น",            value: counts["เสร็จสิ้น"] || 0,      icon: "circle-check",   gradient: C.g4 },
  ];

  return (
    <div className="fade-up">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        {KPIS.map((k, i) => <KpiCard key={i} {...k} loading={loading} C={C}/>)}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
        <div style={{
          display: "flex", gap: 4, background: C.raised, padding: "5px", borderRadius: 12,
          border: `1px solid ${C.border}`, overflowX: "auto", maxWidth: "100%"
        }}>
          { [["all", "ทั้งหมด", returns.length], ...STATUS_LIST.map(s => [s, s, counts[s] || 0])].map(([v, label, total]) => {
            const active = filter === v;
            return (
              <button key={v} onClick={() => setFilter(v)} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 13px", borderRadius: 7, border: "none",
                background: active ? C.accent : "transparent",
                color: active ? "#fff" : C.sec,
                fontWeight: active ? 700 : 500, fontSize: 12.5,
                cursor: "pointer", transition: "all .15s ease", whiteSpace: "nowrap",
              }}>
                {label}
                <span style={{
                  background: active ? "rgba(255,255,255,0.22)" : C.border,
                  color: active ? "#fff" : C.muted,
                  borderRadius: 99, fontSize: 10,
                  fontWeight: 700, padding: "1px 7px", minWidth: 18, textAlign: "center",
                }}>{total}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 14px", gap: 10 }}>
            <i className="fas fa-magnifying-glass" style={{ color: C.muted, fontSize: 13 }}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหารายการ, SKU, ขนส่ง, เลขพัสดุ..."
              style={{ border: "none", background: "transparent", color: C.text, fontSize: 13, outline: "none", width: 240 }}/>
            {search && (
              <i className="fas fa-circle-xmark" style={{ color: C.muted, cursor: "pointer", fontSize: 13 }} onClick={() => setSearch("")}/>
            )}
          </div>
          
          <PrimaryBtn onClick={triggerAdd} icon="plus" C={C}>เพิ่มรายการใหม่</PrimaryBtn>
        </div>
      </div>

      <Card C={C} style={{ overflow: "hidden", padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: "80px 32px", textAlign: "center", color: C.muted, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <Spin size={32} color={C.accent}/>
              <div style={{ fontSize: 14, fontWeight: 600 }}>กำลังเรียกข้อมูลจากฐานข้อมูลหลัก...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "80px 32px", textAlign: "center", color: C.muted }}>
              <div style={{ fontSize: 44, marginBottom: 16, opacity: .3 }}><i className="fas fa-box-open"/></div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.sec, marginBottom: 4 }}>ไม่พบข้อมูลรายการ</div>
              <div style={{ fontSize: 13 }}>กรุณาลองปรับเปลี่ยนตัวเลือก ค้นหา หรือป้อนข้อมูลตัวแปรใหม่</div>
            </div>
          ) : (
            <table style={{ borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.surface }}>
                  {[
                    "#", "วันที่แจ้งเคส", "เลขพัสดุที่ส่งเคลม / Order ID", "ขนส่ง", "สาเหตุ", "สินค้า SKU", "รายละเอียด", "แพลตฟอร์ม", 
                    "สถานะเคส", "เลขพัสดุรับเข้า", "สถานะรับเข้า", "พนักงาน", "มือถือ", "วันที่ซ่อม-เช็ค", 
                    "รายละเอียดงานซ่อม", "สถานะดำเนินการ", "ผู้ดำเนินการ", "เลขพัสดุใหม่", "มือถือส่งกลับ", "จัดการ"
                  ].map((h, i, arr) => (
                    <th key={i} style={{
                      padding: `10px ${i === 0 ? 20 : 12}px`,
                      textAlign: "left", fontSize: 10.5, fontWeight: 700,
                      color: C.muted, textTransform: "uppercase", letterSpacing: .7,
                      borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap",
                      ...(i === arr.length - 1 ? {
                        position: "sticky", right: 0,
                        background: C.surface, borderLeft: `1px solid ${C.border}`, zIndex: 5,
                      } : {}),
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, fi) => {
                  const sm = STATUS_META(dk);
                  const ss = sm[r.status] || sm["รับเรื่อง"];
                  const isCopied = !!copyStatus[r.order_id];
                  const unpacked = unpackDetails(r.details);
                  const isIncomingCopied = !!copyStatus[unpacked.incoming_tracking];
                  const isNewCopied = !!copyStatus[unpacked.new_tracking];

                  return (
                    <tr
                      key={r.id}
                      style={{ borderBottom: `1px solid ${C.borderLight}`, transition: "background .1s ease" }}
                      onMouseEnter={e => e.currentTarget.style.background = C.surface}
                      onMouseLeave={e => e.currentTarget.style.background = ""}
                    >
                      <td style={{ padding: "11px 12px 11px 20px", color: C.muted, fontSize: 12, fontWeight: 500 }}>{fi + 1}</td>
                      <td style={{ padding: "11px 12px", color: C.muted, fontSize: 11.5, whiteSpace: "nowrap", fontFamily: "'JetBrains Mono',monospace" }}>{fmtDate(r.date)}</td>
                      
                      {/* เลขพัสดุที่ส่งเคลม */}
                      <td style={{ padding: "11px 12px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{
                            fontWeight: 700, color: C.text, fontSize: 12,
                            fontFamily: "'JetBrains Mono',monospace", letterSpacing: .2,
                          }}>{r.order_id}</span>
                          <button
                            onClick={() => handleCopy(r.order_id, "คัดลอกเลขพัสดุส่งเคลมแล้ว")}
                            style={{
                              background: "none", border: "none", cursor: "pointer",
                              padding: "2px 4px", borderRadius: 4,
                              color: isCopied ? C.success : C.muted,
                              transition: "color .15s",
                            }}
                            title="คัดลอก"
                          >
                            <i className={`fas fa-${isCopied ? "check" : "copy"}`} style={{ fontSize: 11 }}/>
                          </button>
                        </div>
                      </td>

                      {/* ขนส่ง */}
                      <td style={{ padding: "11px 12px", whiteSpace: "nowrap", color: C.text, fontWeight: 500 }}>{unpacked.carrier || "-"}</td>

                      {/* สาเหตุ */}
                      <td style={{ padding: "11px 12px", color: C.text, whiteSpace: "nowrap" }}>{r.reason || "-"}</td>

                      {/* สินค้า SKU */}
                      <td style={{ padding: "11px 12px", fontWeight: 700, whiteSpace: "nowrap", color: C.text, fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{r.sku || "-"}</td>
                      
                      {/* รายละเอียด */}
                      <td style={{ padding: "11px 12px", maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: C.sec, fontSize: 12 }} title={unpacked.note}>{unpacked.note || "-"}</td>

                      {/* แพลตฟอร์ม */}
                      <td style={{ padding: "11px 12px" }}><PlatBadge platform={r.platform || "อื่นๆ"} dk={dk}/></td>

                      {/* สถานะเคสหลัก */}
                      <td style={{ padding: "11px 12px" }}>
                        <select
                          value={r.status}
                          onChange={e => onStatusChange(r.id, e.target.value)}
                          style={{
                            appearance: "none", padding: "5px 22px 5px 8px", borderRadius: 6,
                            border: `1.5px solid ${ss.border}`, fontSize: 11.5, fontWeight: 600,
                            cursor: "pointer", background: ss.bg, color: ss.color, minWidth: 110,
                            fontFamily: "inherit",
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
                            backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center",
                          }}
                        >
                          {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>

                      {/* เลขพัสดุรับเข้า */}
                      <td style={{ padding: "11px 12px", whiteSpace: "nowrap" }}>
                        {unpacked.incoming_tracking ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontWeight: 600, color: C.text, fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>{unpacked.incoming_tracking}</span>
                            <button
                              onClick={() => handleCopy(unpacked.incoming_tracking, "คัดลอกเลขพัสดุรับเข้าแล้ว")}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: 4, color: isIncomingCopied ? C.success : C.muted }}
                              title="คัดลอก"
                            >
                              <i className={`fas fa-${isIncomingCopied ? "check" : "copy"}`} style={{ fontSize: 11 }}/>
                            </button>
                          </div>
                        ) : "-"}
                      </td>

                      {/* สถานะรับเข้า */}
                      <td style={{ padding: "11px 12px" }}>
                        <select
                          value={unpacked.incoming_status || "รอตรวจเช็ค"}
                          onChange={e => handleIncomingStatusChange(r.id, e.target.value)}
                          style={{
                            appearance: "none", padding: "4px 20px 4px 6px", borderRadius: 6,
                            border: `1px solid ${C.border}`, fontSize: 11.5, fontWeight: 600,
                            cursor: "pointer", background: C.surface, color: C.text, minWidth: 100,
                            fontFamily: "inherit",
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
                            backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center",
                          }}
                        >
                          {INCOMING_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>

                      {/* พนักงาน */}
                      <td style={{ padding: "11px 12px", whiteSpace: "nowrap", color: C.sec, fontSize: 12.5 }}>{r.staff || "-"}</td>

                      {/* มือถือลูกค้า */}
                      <td style={{ padding: "11px 12px", color: C.sec, fontSize: 12, whiteSpace: "nowrap" }}>{r.phone || "-"}</td>

                      {/* วันที่ซ่อม-เช็ค */}
                      <td style={{ padding: "11px 12px", color: C.muted, fontSize: 11.5, whiteSpace: "nowrap", fontFamily: "'JetBrains Mono',monospace" }}>
                        {unpacked.repair_date ? unpacked.repair_date.replace("T", " ") : "-"}
                      </td>

                      {/* รายละเอียดซ่อม */}
                      <td style={{ padding: "11px 12px", maxWidth: 150, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: C.sec, fontSize: 12 }} title={unpacked.repair_details}>{unpacked.repair_details || "-"}</td>

                      {/* สถานะดำเนินการ */}
                      <td style={{ padding: "11px 12px" }}>
                        <select
                          value={unpacked.action_status || "ส่งตัวเดิม"}
                          onChange={e => handleActionStatusChange(r.id, e.target.value)}
                          style={{
                            appearance: "none", padding: "4px 20px 4px 6px", borderRadius: 6,
                            border: `1px solid ${C.border}`, fontSize: 11.5, fontWeight: 600,
                            cursor: "pointer", background: C.surface, color: C.text, minWidth: 120,
                            fontFamily: "inherit",
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
                            backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center",
                          }}
                        >
                          {ACTION_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>

                      {/* ผู้ดำเนินการ */}
                      <td style={{ padding: "11px 12px", whiteSpace: "nowrap", color: C.sec, fontSize: 12.5 }}>{unpacked.operator || "-"}</td>

                      {/* เลขพัสดุใหม่ */}
                      <td style={{ padding: "11px 12px", whiteSpace: "nowrap" }}>
                        {unpacked.new_tracking ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontWeight: 600, color: C.text, fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>{unpacked.new_tracking}</span>
                            <button
                              onClick={() => handleCopy(unpacked.new_tracking, "คัดลอกเลขพัสดุใหม่แล้ว")}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: 4, color: isNewCopied ? C.success : C.muted }}
                              title="คัดลอก"
                            >
                              <i className={`fas fa-${isNewCopied ? "check" : "copy"}`} style={{ fontSize: 11 }}/>
                            </button>
                          </div>
                        ) : "-"}
                      </td>

                      {/* มือถือส่งกลับ */}
                      <td style={{ padding: "11px 12px", color: C.sec, fontSize: 12, whiteSpace: "nowrap" }}>{unpacked.return_phone || r.phone || "-"}</td>

                      {/* Actions */}
                      <td style={{ padding: "11px 16px", position: "sticky", right: 0, background: C.raised, borderLeft: `1px solid ${C.border}`, zIndex: 4 }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <IconBtn icon="pen"       onClick={() => triggerEdit(r)} C={C}              title="แก้ไข"/>
                          <IconBtn icon="trash-can" onClick={() => setDelItem(r)}   C={C} variant="danger" title="ลบ"/>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Table footer */}
        <div style={{
          padding: "12px 20px", borderTop: `1px solid ${C.borderLight}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: 12, color: C.muted,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: C.success,
              animation: "dotPulse 2.4s ease-in-out infinite",
            }}/>
            <span>
              แสดง <strong style={{ color: C.text }}>{filtered.length}</strong> จาก{" "}
              <strong style={{ color: C.text }}>{returns.length}</strong> รายการ
            </span>
          </div>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>Masaru RMS · Supabase</span>
        </div>
      </Card>

      <DelConfirm open={!!delItem} onClose={() => setDelItem(null)} item={delItem} C={C}
        onConfirm={async () => { await onDelete(delItem.id); setDelItem(null); }}/>
    </div>
  );
}

function ReportsPage({ returns = [], C, dk }) {
  const safeReturns = returns || [];
  const totalVal  = safeReturns.reduce((sum, r) => sum + (parseFloat(r.price) || 0), 0);
  const avgVal    = safeReturns.length ? totalVal / safeReturns.length : 0;
  const doneCount = safeReturns.filter(r => r.status === "เสร็จสิ้น").length;
  const doneRate  = safeReturns.length ? Math.round((doneCount / safeReturns.length) * 100) : 0;

  // Timeline computation (12 Months back) with safety check
  const monthMap = {};
  safeReturns.forEach(r => {
    if (!r.date) return;
    const d = new Date(r.date);
    const k = `${d.getFullYear()}/${pad(d.getMonth() + 1)}`;
    if (!monthMap[k]) monthMap[k] = { month: k, count: 0, value: 0, done: 0 };
    monthMap[k].count++;
    monthMap[k].value += parseFloat(r.price) || 0;
    if (r.status === "เสร็จสิ้น") monthMap[k].done++;
  });
  const timeline = Object.values(monthMap).sort((a, b) => String(a.month).localeCompare(String(b.month))).slice(-12);

  const platData = PLATFORM_LIST.map((p, i) => ({
    name: p,
    count: safeReturns.filter(r => r.platform === p).length,
    value: safeReturns.filter(r => r.platform === p).reduce((sum, r) => sum + (parseFloat(r.price) || 0), 0),
    fill: CHART_PALETTE[i % CHART_PALETTE.length],
  })).filter(d => d.count > 0);

  const statusData = STATUS_LIST.map((s, i) => ({
    name: s, value: safeReturns.filter(r => r.status === s).length, fill: CHART_PALETTE[i % CHART_PALETTE.length]
  })).filter(d => d.value > 0);

  const reasonData = REASON_LIST.map((r, i) => ({
    name: r.length > 18 ? r.slice(0, 16) + "..." : r,
    fullName: r,
    count: safeReturns.filter(x => x.reason === r).length,
    fill: CHART_PALETTE[i % CHART_PALETTE.length]
  })).filter(d => d.count > 0).sort((a, b) => b.count - a.count);

  const staffMap = {};
  safeReturns.forEach(r => { if (r.staff) staffMap[r.staff] = (staffMap[r.staff] || 0) + 1; });
  const staffData = Object.entries(staffMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  const gridColor = C.gridLine;
  const tickColor = C.tick;
  const textColor = C.text;

  const KPIS = [
    { label: "มูลค่าเคสรวม",     value: "฿" + Math.round(totalVal).toLocaleString("th-TH"), icon: "wallet",           gradient: C.g4 },
    { label: "มูลค่าเฉลี่ย/เคส",  value: "฿" + Math.round(avgVal).toLocaleString("th-TH"),  icon: "calculator",       gradient: C.g1 },
    { label: "อัตราปิดงาน",       value: doneRate + "%",                                       icon: "clipboard-check",  gradient: C.g2 },
    { label: "เคสสะสม",          value: safeReturns.length,                                   icon: "chart-line",       gradient: C.g3 },
  ];

  return (
    <ErrorBoundary>
      <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {KPIS.map((k, i) => <KpiCard key={i} {...k} C={C}/>)}
        </div>

        <Card C={C} style={{ padding: 24 }}>
          <SHdr title="แนวโน้มปริมาณเคสคืนสินค้ารายเดือน" icon="chart-area" sub={`${timeline.length} เดือนที่ผ่านมารวมทั้งหมด`} C={C}/>
          {timeline.length === 0 ? (
            <EmptyChart C={C}/>
          ) : (
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.accent} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={C.accent} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false}/>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} allowDecimals={false}/>
                  <Tooltip content={<CustomTooltip C={C} suffix=" เคส"/>}/>
                  <Area type="monotone" dataKey="count" name="ปริมาณเคส" stroke={C.accent} strokeWidth={2.5}
                    fill="url(#areaGrad)" dot={{ fill: C.accent, r: 4, strokeWidth: 2, stroke: C.raised }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: C.raised }}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
          <Card C={C} style={{ padding: 24 }}>
            <SHdr title="จำนวนเคสคืนจำแนกตามช่องทาง" icon="store" C={C}/>
            {platData.length === 0 ? (
              <EmptyChart C={C}/>
            ) : (
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={true} vertical={false}/>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} allowDecimals={false}/>
                    <Tooltip content={<CustomTooltip C={C} suffix=" เคส"/>}/>
                    <Bar dataKey="count" name="จำนวนเคส" radius={[6, 6, 0, 0]} maxBarSize={45}>
                      {platData.map((d, i) => <Cell key={i} fill={d.fill}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card C={C} style={{ padding: 24 }}>
            <SHdr title="สัดส่วนขั้นตอนการดำเนินงานในปัจจุบัน" icon="pie-chart" C={C}/>
            {statusData.length === 0 ? (
              <EmptyChart C={C}/>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 16, height: 220, flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ width: 140, height: 140, position: "relative" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                        paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                        {statusData.map((s, i) => <Cell key={i} fill={s.fill} stroke={C.raised} strokeWidth={2}/>)}
                      </Pie>
                      <Tooltip content={<CustomTooltip C={C} suffix=" เคส"/>}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 150 }}>
                  {statusData.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.fill, flexShrink: 0 }}/>
                        <span style={{ fontSize: 12, color: C.sec, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{s.name}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: textColor }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        <Card C={C} style={{ padding: 24 }}>
          <SHdr title="สาเหตุการเคลมและคืนของหลัก" icon="circle-info" C={C}/>
          {reasonData.length === 0 ? (
            <EmptyChart C={C}/>
          ) : (
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reasonData} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={true} horizontal={false}/>
                  <XAxis type="number" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} allowDecimals={false}/>
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} width={100}/>
                  <Tooltip content={<CustomTooltip C={C} suffix=" เคส"/>}/>
                  <Bar dataKey="count" name="จำนวนเคส" radius={[0, 6, 6, 0]} maxBarSize={18}>
                    {reasonData.map((d, i) => <Cell key={i} fill={d.fill}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card C={C} style={{ padding: 24 }}>
          <SHdr title="อันดับพนักงานผู้ดูแลความพึงพอใจและปิดเคสดีเด่น" icon="trophy" C={C}/>
          {staffData.length === 0 ? (
            <EmptyChart C={C} msg="ไม่มีข้อมูลผู้ดูแลบันทึกในระบบ"/>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              {staffData.map((s, i) => {
                const max = staffData[0].count;
                const pct = Math.round((s.count / max) * 100);
                return (
                  <div key={i} style={{ background: C.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: `${CHART_PALETTE[i % CHART_PALETTE.length]}18`,
                        color: CHART_PALETTE[i % CHART_PALETTE.length],
                        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13
                      }}>{i + 1}</div>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>รับผิดชอบ {s.count} รายการ</div>
                      </div>
                    </div>
                    <div style={{ height: 5, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 99,
                        background: CHART_PALETTE[i % CHART_PALETTE.length],
                        width: `${pct}%`, transition: "width 0.8s ease-in-out"
                      }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </ErrorBoundary>
  );
}

function InventoryPage({ returns = [], C, dk }) {
  const [search, setSearch] = useState("");
  const [filterPlat, setFP] = useState("all");
  const [sortBy, setSortBy] = useState("total");

  const safeReturns = returns || [];
  const skuMap = {};
  safeReturns.forEach(r => {
    if (!r.sku) return;
    const cleanSku = String(r.sku).trim();
    if (!skuMap[cleanSku]) {
      skuMap[cleanSku] = { sku: cleanSku, total: 0, pending: 0, inProg: 0, done: 0, totalVal: 0, platforms: new Set(), lastDate: null };
    }
    const s = skuMap[cleanSku];
    s.total++;
    s.totalVal += parseFloat(r.price) || 0;
    if (r.platform) s.platforms.add(r.platform);
    if (r.status === "เสร็จสิ้น") s.done++;
    else if (r.status === "รับเรื่อง") s.pending++;
    else s.inProg++;
    
    if (r.date) {
      const d = new Date(r.date);
      if (!s.lastDate || d > s.lastDate) s.lastDate = d;
    }
  });

  let list = Object.values(skuMap);
  if (filterPlat !== "all") {
    list = list.filter(s => [...s.platforms].includes(filterPlat));
  }
  if (search) {
    list = list.filter(s => String(s.sku).toLowerCase().includes(search.toLowerCase()));
  }
  
  list = list.sort((a, b) => sortBy === "value" ? b.totalVal - a.totalVal : b.total - a.total);

  const topSKU = list[0];
  const totPend = safeReturns.filter(r => r.status !== "เสร็จสิ้น").length;
  
  const getInventoryHealth = (pendingTotal) => {
    if (pendingTotal > 5) return { label: "เสี่ยงของล้นคลัง", color: "#ef4444", bg: C.dangerSoft };
    if (pendingTotal > 2) return { label: "ต้องตรวจสอบ", color: "#f59e0b", bg: C.warningSoft };
    return { label: "ควบคุมได้", color: "#10b981", bg: C.successSoft };
  };

  const skuChartData = list.slice(0, 8).map(s => {
    const skuStr = String(s.sku || "");
    return {
      name: skuStr.length > 12 ? skuStr.slice(0, 10) + ".." : skuStr,
      "เสร็จสิ้น": s.done || 0,
      "รอดำเนินการ": (s.pending || 0) + (s.inProg || 0)
    };
  });

  const gridColor = dk ? "#334155" : "#e5e7eb";
  const tickColor = dk ? "#64748b" : "#9ca3af";

  return (
    <ErrorBoundary>
      <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { label: "SKU ที่มีการคืน",   value: Object.keys(skuMap).length, icon: "cubes",               gradient: C.g1 },
            { label: "เคสทั้งหมด",         value: safeReturns.length,         icon: "clipboard-list",      gradient: C.g2 },
            { label: "รอดำเนินการ",         value: totPend,                    icon: "hourglass-half",      gradient: C.g3 },
            { label: "SKU คืนบ่อยที่สุด",   value: topSKU?.sku || "-",         icon: "trophy",              gradient: C.g4 },
          ].map((k, i) => <KpiCard key={i} {...k} C={C}/>)}
        </div>

        {skuChartData.length > 0 && (
          <Card C={C} style={{ padding: 24 }}>
            <SHdr title="ยอดเคลมแบ่งตามประเภทสินค้า (Top 8 SKU)" icon="chart-bar" sub="อัตราส่วนความสําเร็จและงานคงเหลือ" C={C}/>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skuChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false}/>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} allowDecimals={false}/>
                  <Tooltip content={<CustomTooltip C={C} suffix=" ชิ้น"/>}/>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: tickColor, paddingTop: 10 }}/>
                  <Bar dataKey="เสร็จสิ้น" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} maxBarSize={32}/>
                  <Bar dataKey="รอดำเนินการ" fill="#ef4444" stackId="a" radius={[6, 6, 0, 0]} maxBarSize={32}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 14px", gap: 10 }}>
              <i className="fas fa-magnifying-glass" style={{ color: C.muted, fontSize: 13 }}/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหารหัส SKU..."
                style={{ border: "none", background: "transparent", color: C.text, fontSize: 13, outline: "none", width: 160 }}/>
            </div>
            
            <div style={{ display: "flex", gap: 4, background: C.raised, padding: 4, borderRadius: 10, border: `1px solid ${C.border}` }}>
              {["all", ...PLATFORM_LIST].map(p => (
                <button key={p} onClick={() => setFP(p)} style={{
                  padding: "6px 12px", borderRadius: 8, border: "none",
                  background: filterPlat === p ? `linear-gradient(135deg, ${C.accent}, ${C.accentText})` : "transparent",
                  color: filterPlat === p ? "#fff" : C.sec, fontSize: 12, fontWeight: filterPlat === p ? 700 : 500,
                  cursor: "pointer"
                }}>
                  {p === "all" ? "ทั้งหมด" : p}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 4, background: C.raised, padding: 4, borderRadius: 10, border: `1px solid ${C.border}` }}>
            {[["total", "จำนวนเคส"], ["value", "มูลค่าเคลมรวม"]].map(([v, l]) => (
              <button key={v} onClick={() => setSortBy(v)} style={{
                padding: "6px 12px", borderRadius: 8, border: "none",
                background: sortBy === v ? C.accentSoft : "transparent",
                color: sortBy === v ? C.accent : C.sec,
                fontSize: 12, fontWeight: sortBy === v ? 700 : 500, cursor: "pointer", transition: "all .15s ease"
              }}>
                จัดเรียงตาม: {l}
              </button>
            ))}
          </div>
        </div>

        <Card C={C} style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.surface }}>
                  {["#", "รหัสสินค้า SKU", "แพลตฟอร์มที่พบ", "ความเสียหายรวม", "กำลังดําเนินการ", "เสร็จสิ้นแล้ว", "มูลค่ารวมจำหน่าย", "สัดส่วนงานสำเร็จ", "อัปเดตล่าสุด", "สถานะประเมิน"].map((h, i) => (
                    <th key={i} style={{
                      padding: `12px ${i === 0 ? 20 : 12}px`, textAlign: "left", fontSize: 11, fontWeight: 700,
                      color: C.muted, textTransform: "uppercase", letterSpacing: .6,
                      borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ padding: "64px 32px", textAlign: "center", color: C.muted }}>
                      <i className="fas fa-boxes-stacked" style={{ fontSize: 32, opacity: .3, display: "block", marginBottom: 10 }}/>
                      <span>ไม่พบประวัติ SKU ที่ตรงตามตัวเลือก</span>
                    </td>
                  </tr>
                ) : (
                  list.map((s, i) => {
                    const rate = Math.round((s.done / s.total) * 100);
                    const health = getInventoryHealth(s.pending + s.inProg);
                    return (
                      <tr key={s.sku} style={{ borderBottom: `1px solid ${C.borderLight}`, transition: "background-color .12s ease" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = ""}>
                        <td style={{ padding: "12px 12px 12px 20px", color: C.muted, fontSize: 12, fontWeight: 600 }}>{i + 1}</td>
                        <td style={{ padding: "12px 12px" }}>
                          <div style={{ fontWeight: 700, color: C.accent, fontFamily: "monospace", fontSize: 13 }}>{s.sku}</div>
                        </td>
                        <td style={{ padding: "12px 12px" }}>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {[...s.platforms].map(p => <PlatBadge key={p} platform={p} dk={dk}/>)}
                          </div>
                        </td>
                        <td style={{ padding: "12px 12px" }}>
                          <span style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>{s.total}</span>
                        </td>
                        <td style={{ padding: "12px 12px" }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: (s.pending + s.inProg) > 0 ? C.danger : C.muted }}>{s.pending + s.inProg}</span>
                        </td>
                        <td style={{ padding: "12px 12px" }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: C.success }}>{s.done}</span>
                        </td>
                        <td style={{ padding: "12px 12px", fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>{fmtMoney(s.totalVal)}</td>
                        
                        <td style={{ padding: "12px 12px", minWidth: 140 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                              <div style={{
                                height: "100%", borderRadius: 99,
                                background: rate >= 80 ? C.success : rate >= 40 ? C.warning : C.danger,
                                width: `${rate}%`
                              }}/>
                            </div>
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: rate >= 80 ? C.success : rate >= 40 ? C.warning : C.danger, minWidth: 32 }}>{rate}%</span>
                          </div>
                        </td>
                        
                        <td style={{ padding: "12px 12px", fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>{s.lastDate ? fmtDate(s.lastDate.toISOString()) : "-"}</td>
                        <td style={{ padding: "12px 12px" }}>
                          <span style={{
                            display: "inline-flex", padding: "4px 10px", borderRadius: 99, fontSize: 11,
                            fontWeight: 700, background: health.bg, color: health.color, border: `1px solid ${health.color}33`
                          }}>{health.label}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.borderLight}`, fontSize: 12, color: C.muted }}>
            ตรวจพบสินค้าประเภทที่เกิดความเสียหายทั้งหมด {list.length} รายการ (SKUs)
          </div>
        </Card>
      </div>
    </ErrorBoundary>
  );
}

function getIS(C) {
  return {
    padding: "10px 14px",
    borderRadius: 8,
    border: `1.5px solid ${C.border}`,
    background: C.surface,
    color: C.text,
    fontSize: 13,
    fontFamily: "'DM Sans','IBM Plex Sans Thai',sans-serif",
    outline: "none",
    width: "100%",
    transition: "border-color .15s ease, box-shadow .15s ease, background .15s ease",
  };
}
function getSS(C) {
  return {
    ...getIS(C),
    appearance: "none",
    paddingRight: 34,
    cursor: "pointer",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
  };
}

function BulkSearchPage({ returns = [], C, dk, toast, triggerEdit }) {
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState([]);
  const [copyStatus, setCopyStatus] = useState({});

  const handleSearch = () => {
    const numbers = inputText
      .split(/[\n,\s\t]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const searchResults = numbers.map(num => {
      const foundCase = returns.find(r => {
        const orderIdMatch = (r.order_id || "").trim().toLowerCase() === num.toLowerCase();
        const unpacked = unpackDetails(r.details);
        const incomingMatch = (unpacked.incoming_tracking || "").trim().toLowerCase() === num.toLowerCase();
        const newMatch = (unpacked.new_tracking || "").trim().toLowerCase() === num.toLowerCase();
        return orderIdMatch || incomingMatch || newMatch;
      });

      if (foundCase) {
        const unpacked = unpackDetails(foundCase.details);
        const caseDate = foundCase.date ? fmtDate(foundCase.date).split(" ")[0] : "-";
        return {
          number: num,
          found: true,
          date: caseDate,
          actionStatus: unpacked.action_status || "ส่งตัวเดิม",
          caseStatus: foundCase.status,
          record: foundCase
        };
      } else {
        return {
          number: num,
          found: false,
          date: "",
          actionStatus: "",
          caseStatus: "",
          record: null
        };
      }
    });

    setResults(searchResults);
  };

  const handleCopy = (text, successMsg) => {
    copyToClipboard(text, (success) => {
      if (success) {
        setCopyStatus(p => ({ ...p, [text]: true }));
        toast(successMsg || "คัดลอกสำเร็จ");
        setTimeout(() => setCopyStatus(p => ({ ...p, [text]: false })), 2000);
      } else {
        toast("คัดลอกไม่สำเร็จ", "error");
      }
    });
  };

  const copyTextResults = () => {
    if (results.length === 0) return;
    const text = results.map(r => {
      if (r.found) {
        return `${r.number} : พบเลข : ${r.date} : ${r.actionStatus}`;
      } else {
        return `${r.number} : ไม่พบเลข`;
      }
    }).join("\n");

    handleCopy(text, "คัดลอกผลการค้นหาทั้งหมดแล้ว");
  };

  const copyColumnResults = () => {
    if (results.length === 0) return;
    const text = results.map(r => {
      if (r.found) {
        return `พบเลข : ${r.date} : ${r.actionStatus}`;
      } else {
        return `ไม่พบเลข`;
      }
    }).join("\n");

    handleCopy(text, "คัดลอกเฉพาะสเตตัส (คอลัมน์) สำหรับ Google Sheets แล้ว");
  };

  return (
    <div className="fade-up">
      <Card C={C} style={{ marginBottom: 24 }}>
        <SHdr title="ระบบค้นหาสเตตัสพัสดุแบบกลุ่ม (Bulk Search)" icon="magnifying-glass-plus" C={C} sub="ป้อนเลขพัสดุส่งเคลม เลขพัสดุรับเข้า หรือเลขพัสดุส่งกลับใหม่ พร้อมกันเพื่อเช็คสถานะและรายละเอียดการเคลม" />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <textarea
            rows={8}
            style={{ ...getIS(C), width: "100%", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, lineHeight: 1.5 }}
            placeholder="ป้อนเลขพัสดุ เช่น บรรทัดละ 1 เลข&#10;TH265769951069C&#10;797761830876&#10;880017164051"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
          <div style={{ display: "flex", gap: 12 }}>
            <PrimaryBtn onClick={handleSearch} icon="magnifying-glass" C={C}>ค้นหาข้อมูล</PrimaryBtn>
            {results.length > 0 && (
              <>
                <GhostBtn onClick={copyTextResults} icon="copy" C={C}>คัดลอกผลการค้นหา</GhostBtn>
                <GhostBtn onClick={copyColumnResults} icon="clipboard-list" C={C}>คัดลอกเฉพาะผลลัพธ์ (คอลัมน์)</GhostBtn>
              </>
            )}
          </div>
        </div>
      </Card>

      {results.length > 0 && (
        <Card C={C} style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700, color: C.text }}>ผลลัพธ์การค้นหา ({results.length} รายการ)</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.surface }}>
                  {["เลขที่ค้นหา", "สถานะการค้นพบ", "วันที่พบเลข / แจ้งเคส", "สถานะดำเนินการ", "สถานะเคสหลัก", "จัดการ"].map((h, i) => (
                    <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.muted, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const isNumCopied = !!copyStatus[r.number];
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span>{r.number}</span>
                          <button
                            onClick={() => handleCopy(r.number, "คัดลอกเลขแล้ว")}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: isNumCopied ? C.success : C.muted }}
                            title="คัดลอก"
                          >
                            <i className={`fas fa-${isNumCopied ? "check" : "copy"}`} style={{ fontSize: 10 }}/>
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {r.found ? (
                          <span style={{ background: C.successSoft, color: C.success, padding: "3px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>🟢 พบเลข</span>
                        ) : (
                          <span style={{ background: C.dangerSoft, color: C.danger, padding: "3px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>🔴 ไม่พบเลข</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", color: C.sec, fontFamily: "'JetBrains Mono', monospace" }}>{r.date || "-"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        {r.found ? (
                          <span style={{ background: C.accentSoft, color: C.accent, padding: "3px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>{r.actionStatus}</span>
                        ) : "-"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>{r.found ? <StatusBadge status={r.caseStatus} dk={dk} /> : "-"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        {r.found && r.record && (
                          <button
                            onClick={() => triggerEdit(r.record)}
                            style={{
                              background: "none", border: "none", color: C.accent, fontWeight: 600,
                              cursor: "pointer", fontSize: 12.5, textDecoration: "underline", display: "flex", alignItems: "center", gap: 4
                            }}
                          >
                            <i className="fas fa-pen"/> แก้ไขเคส
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function App() {
  const [page, setPage]       = useState("returns");
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbSt, setDbSt]       = useState("connecting");
  const [lastSync, setLS]     = useState(null);
  const [theme, setTheme]     = useState(() => localStorage.getItem("masaru_theme") || "light");
  const { toasts, push: toast } = useToast();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const dk = theme === "dark";
  const C  = dk ? T.d : T.l;

  useEffect(() => {
    document.body.style.backgroundColor = C.bg;
    document.body.style.color = C.text;
  }, [C]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await db.from(TABLE).select("*").order("date", { ascending: false });
      if (error) throw error;
      setReturns(data || []);
      setDbSt("connected");
      setLS(new Date());
    } catch (e) {
      setDbSt("error");
      toast("เชื่อมต่อดึงข้อมูลไม่สำเร็จ: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(form) {
    try {
      const { data, error } = await db.from(TABLE).insert([{ ...form, price: form.price !== "" ? parseFloat(form.price) : null }]).select();
      if (error) throw error;
      setReturns(p => [data[0], ...p]);
      setLS(new Date());
      toast("บันทึกเคสความเสียหายสำเร็จ");
    } catch (error) {
      toast("เกิดข้อผิดพลาดในการบันทึก: " + error.message, "error");
      throw error;
    }
  }

  async function handleEdit(id, form) {
    try {
      const { data, error } = await db.from(TABLE).update({ ...form, price: form.price !== "" ? parseFloat(form.price) : null }).eq("id", id).select();
      if (error) throw error;
      setReturns(p => p.map(r => r.id === id ? data[0] : r));
      setLS(new Date());
      toast("อัปเดตรายละเอียดเคสเสร็จสิ้น");
    } catch (error) {
      toast("เกิดข้อผิดพลาดในการบันทึก: " + error.message, "error");
      throw error;
    }
  }

  async function handleDelete(id) {
    try {
      const { error } = await db.from(TABLE).delete().eq("id", id);
      if (error) throw error;
      setReturns(p => p.filter(r => r.id !== id));
      setLS(new Date());
      toast("ลบเคสคืนสินค้าออกถาวรเรียบร้อย");
    } catch (error) {
      toast("ลบไม่สำเร็จ: " + error.message, "error");
      throw error;
    }
  }

  async function handleStatus(id, status) {
    try {
      setReturns(p => p.map(r => r.id === id ? { ...r, status } : r));
      const { data, error } = await db.from(TABLE).update({ status }).eq("id", id).select();
      if (error) throw error;
      
      setReturns(p => p.map(r => r.id === id ? data[0] : r));
      setLS(new Date());
      toast(`เปลี่ยนสเตตัส → "${status}" แล้ว`);
    } catch (error) {
      toast("อัปเดตสเตตัสล้มเหลว", "error");
      load();
    }
  }

  const NAV = [
    { key: "returns",   icon: "table-list",    label: "จัดการคืนสินค้า",  badge: returns.filter(r => r.status === "รับเรื่อง").length },
    { key: "reports",   icon: "chart-simple",  label: "รายงาน & สถิติ",   badge: null },
    { key: "inventory", icon: "boxes-stacked", label: "คลังวิเคราะห์ SKU",  badge: null },
    { key: "bulkSearch", icon: "magnifying-glass-plus", label: "ค้นหาเลขสถานะ", badge: null },
  ];
  const PAGE_TITLE = { 
    returns: "Return Case Management", 
    reports: "Analytics Report", 
    inventory: "SKU Analytics", 
    bulkSearch: "Bulk Status Search" 
  };
  const PAGE_SUB   = { 
    returns: "จัดการ ตรวจสอบ และอัปเดตสเตตัสพัสดุเคลมคืนสินค้า", 
    reports: "ข้อมูลวิเคราะห์ประสิทธิภาพและปริมาณความเสียหายรายวัน", 
    inventory: "สถิติและประเมินคุณภาพสินค้าเพื่อการควบคุมดีเฟค", 
    bulkSearch: "ค้นหาสถานะพัสดุหลายรายการพร้อมกันได้ทีละ 20 - 30 เลข" 
  };

  const sidebarW = 248;
  const headerH  = 60;

  return (
    <>
      <GlobalStyles/>
      <div
        data-theme={dk ? "dark" : "light"}
        style={{
          display: "grid",
          gridTemplateColumns: `${sidebarW}px 1fr`,
          gridTemplateRows: `${headerH}px 1fr`,
          minHeight: "100vh",
          width: "100%",
          background: C.bg,
          transition: "background .25s ease",
        }}
      >

        {/* ══ SIDEBAR ══ */}
        <aside style={{
          gridRow: "1/3",
          background: C.sidebar,
          borderRight: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column",
          position: "sticky", top: 0, height: "100vh",
          overflowY: "auto", zIndex: 40,
          boxShadow: dk
            ? "2px 0 16px rgba(0,0,0,0.28)"
            : "1px 0 0 #e0e0e0",
          transition: "background .25s ease, border-color .25s ease",
        }}>

          {/* Logo */}
          <div style={{
            padding: "0 20px",
            display: "flex", alignItems: "center", gap: 12,
            borderBottom: `1px solid ${C.border}`,
            height: headerH, flexShrink: 0,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: dk ? C.g1 : "linear-gradient(135deg,#111,#444)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 16, flexShrink: 0,
              boxShadow: dk ? C.glowSm : "0 3px 10px rgba(0,0,0,0.18)",
            }}>
              <i className="fas fa-rotate-left"/>
            </div>
            <div>
              <div style={{
                fontSize: 15, fontWeight: 800, color: C.text,
                letterSpacing: "-0.5px", lineHeight: 1.2,
                fontFamily: "'DM Sans',sans-serif",
              }}>Masaru</div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: .6, textTransform: "uppercase" }}>
                RETURN SYSTEM
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: "16px 12px", flex: 1 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.2,
              textTransform: "uppercase", padding: "0 8px 10px",
            }}>เมนูนำทาง</div>

            {NAV.map(n => {
              const active = page === n.key;
              return (
                <div
                  key={n.key}
                  onClick={() => setPage(n.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 10px", borderRadius: 8,
                    cursor: "pointer", marginBottom: 2,
                    transition: "all .18s ease",
                    color: active ? (dk ? C.accentText : C.accent) : C.sec,
                    background: active ? C.accentSoft : "transparent",
                    fontWeight: active ? 700 : 500,
                    fontSize: 13.5,
                    userSelect: "none",
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 7,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: active ? C.accent : "transparent",
                    color: active ? "#fff" : C.muted,
                    fontSize: 13,
                    transition: "all .18s ease",
                    flexShrink: 0,
                  }}>
                    <i className={`fas fa-${n.icon}`}/>
                  </div>
                  <span style={{ flex: 1 }}>{n.label}</span>
                  {n.badge > 0 && (
                    <span style={{
                      background: C.danger, color: "#fff",
                      borderRadius: 99, fontSize: 10, fontWeight: 700,
                      padding: "1px 7px", minWidth: 20, textAlign: "center",
                    }}>{n.badge}</span>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div style={{ padding: "14px", borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
            {/* DB badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 8,
              background: dbSt === "connected" ? C.successSoft : C.dangerSoft,
              border: `1px solid ${dbSt === "connected" ? C.success + "28" : C.danger + "28"}`,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: dbSt === "connected" ? C.success : C.danger, flexShrink: 0,
                boxShadow: dbSt === "connected" ? `0 0 0 2.5px ${C.success}30` : "none",
                animation: dbSt === "connected" ? "dotPulse 2.4s ease-in-out infinite" : "none",
              }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: dbSt === "connected" ? C.success : C.danger }}>
                  {dbSt === "connected" ? "Supabase Connected" : dbSt === "connecting" ? "กำลังเชื่อมต่อ…" : "Connection Error"}
                </div>
                {lastSync && (
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 1, fontFamily: "'JetBrains Mono',monospace" }}>
                    {lastSync.toLocaleTimeString("th-TH")}
                  </div>
                )}
              </div>
            </div>

            {/* Theme toggle — ghost button style */}
            <button
              onClick={() => {
                const target = dk ? "light" : "dark";
                setTheme(target);
                localStorage.setItem("masaru_theme", target);
                document.body.setAttribute("data-theme", target);
              }}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "9px 12px", borderRadius: 8,
                background: "transparent",
                border: `1.5px solid ${C.border}`,
                color: C.sec, fontSize: 13, cursor: "pointer",
                fontWeight: 500, transition: "all .15s ease", width: "100%",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.accentSoft; e.currentTarget.style.color = dk ? C.accentText : C.accent; e.currentTarget.style.borderColor = dk ? C.accentText : C.accent; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.sec; e.currentTarget.style.borderColor = C.border; }}
            >
              <i className={`fas fa-${dk ? "sun" : "moon"}`} style={{ fontSize: 13, width: 16, textAlign: "center" }}/>
              <span>{dk ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </aside>

        {/* ══ TOPBAR ══ */}
        <header style={{
          gridColumn: 2, height: headerH,
          background: C.topbar,
          borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center",
          padding: "0 28px", position: "sticky", top: 0, zIndex: 30, gap: 12,
          boxShadow: dk
            ? "0 2px 12px rgba(0,0,0,0.25)"
            : "0 1px 0 #e0e0e0",
          transition: "background .25s ease, border-color .25s ease",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 16, fontWeight: 700, color: C.text,
              letterSpacing: "-0.4px", lineHeight: 1.2,
              fontFamily: "'DM Sans',sans-serif",
            }}>
              {PAGE_TITLE[page]}
            </div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>
              {PAGE_SUB[page]}
            </div>
          </div>

          {/* Refresh */}
          <IconBtn icon="rotate-right" onClick={load} C={C} title="รีเฟรชข้อมูล" active={loading}/>

          {/* Avatar */}
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: dk ? C.g1 : "linear-gradient(135deg,#111,#444)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer",
            boxShadow: dk ? C.glowSm : "0 2px 6px rgba(0,0,0,0.16)",
            fontFamily: "'DM Sans',sans-serif",
          }}>M</div>
        </header>

        {/* ══ MAIN ══ */}
        <main style={{
          gridColumn: 2, padding: "24px 28px",
          overflowY: "auto", background: C.bg,
          transition: "background .25s ease",
        }}>
          {page === "returns"   && <ReturnCasesPage returns={returns} loading={loading} triggerAdd={() => { setEditItem(null); setFormOpen(true); }} triggerEdit={(item) => { setEditItem(item); setFormOpen(true); }} onDelete={handleDelete} onEdit={handleEdit} onStatusChange={handleStatus} C={C} dk={dk} toast={toast}/>}
          {page === "reports"   && <ReportsPage     returns={returns} C={C} dk={dk}/>}
          {page === "inventory" && <InventoryPage   returns={returns} C={C} dk={dk}/>}
          {page === "bulkSearch" && <BulkSearchPage returns={returns} C={C} dk={dk} toast={toast} triggerEdit={(item) => { setEditItem(item); setFormOpen(true); }}/>}
        </main>
      </div>

      <ReturnForm open={formOpen} onClose={() => setFormOpen(false)} onSave={async (f) => {
        if (editItem) {
          await handleEdit(editItem.id, f);
        } else {
          await handleAdd(f);
        }
      }} initial={editItem} C={C}/>

      <Toasts toasts={toasts} C={C}/>
    </>
  );
}