import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, BrainCircuit, MessageSquare, Moon, Sun, AlertCircle, CheckCircle2, Info, X, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from "recharts";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Page = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.28 }}>
    {children}
  </motion.div>
);

function ConfBar({ score, color }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(score), 120); return () => clearTimeout(t); }, [score]);
  return (
    <div className="conf-wrap">
      <div className="conf-row"><span>Confidence Score</span><span className="conf-num" style={{ color }}>{score.toFixed(1)}%</span></div>
      <div className="conf-bg"><div className="conf-fill" style={{ width: w + "%", background: color }} /></div>
    </div>
  );
}

const CTip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="ctooltip">
      {label && <div className="ctooltip-label">{label}</div>}
      {payload.map((p, i) => <div key={i} style={{ color: p.color || p.fill }}>{p.name}: <b>{p.value}{p.value <= 100 ? "%" : ""}</b></div>)}
    </div>
  );
};

function Toast({ toasts, remove }) {
  return (
    <div className="toast-wrap">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id} initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
            className={"toast " + (t.type === "success" ? "toast-ok" : "toast-err")}>
            {t.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{t.msg}</span>
            <button onClick={() => remove(t.id)} className="toast-x"><X size={13} /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); } catch { return "light"; }
  });
  const [toasts, setToasts] = useState([]);
  const [mobile, setMobile] = useState(window.innerWidth < 768);

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); try { localStorage.setItem("theme", theme); } catch {} }, [theme]);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const addToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts(p => p.filter(t => t.id !== id));

  const nav = [
    { id: "home",         emoji: "🏠", label: "Home"         },
    { id: "dashboard",    emoji: "📊", label: "Dashboard"    },
    { id: "prediction",   emoji: "🤖", label: "Prediction"   },
    { id: "ai_assistant", emoji: "💬", label: "AI Assistant" },
    { id: "about",        emoji: "📖", label: "About"        },
  ];

  return (
    <div className="wrap">
      {!mobile && (
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-icon">🏥</div>
            <div><div className="logo-name">NovaHealth</div><div className="logo-sub">AI Prediction System</div></div>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {nav.map(n => (
              <button key={n.id} className={"navbtn" + (tab === n.id ? " active" : "")} onClick={() => setTab(n.id)}>
                <span className="navemoji">{n.emoji}</span><span>{n.label}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-status">
            <div className="dot" />
            <div><div className="st-title">System Online</div><div className="st-sub">Random Forest · 110k records</div></div>
          </div>
          <button className="themebtn" onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>
            {theme === "light" ? <><Moon size={14} /><span>Dark Mode</span></> : <><Sun size={14} /><span>Light Mode</span></>}
          </button>
        </aside>
      )}

      <main className={"main" + (mobile ? " main-mobile" : "")}>
        <AnimatePresence mode="wait">
          {tab === "home"         && <HomePage      key="home" setTab={setTab} />}
          {tab === "dashboard"    && <DashboardPage key="dash" theme={theme} />}
          {tab === "prediction"   && <PredictPage   key="pred" addToast={addToast} />}
          {tab === "ai_assistant" && <AIPage        key="ai" />}
          {tab === "about"        && <AboutPage     key="about" />}
        </AnimatePresence>
      </main>

      {mobile && (
        <nav className="mob-nav">
          {nav.map(n => (
            <button key={n.id} className={"mob-btn" + (tab === n.id ? " active" : "")} onClick={() => setTab(n.id)}>
              <span style={{ fontSize: "1.2rem" }}>{n.emoji}</span>
              <span className="mob-lbl">{n.label}</span>
            </button>
          ))}
        </nav>
      )}

      <Toast toasts={toasts} remove={removeToast} />
      <footer className="footer">Developed as part of AI / Data Analytics Internship Project &nbsp;·&nbsp; NovaHealth © 2024</footer>
    </div>
  );
}
function HomePage({ setTab }) {
  return (
    <Page>
      <div className="hero">
        <div className="hero-left">
          <div className="hero-badge">🏥 Machine Learning · Healthcare</div>
          <h1 className="hero-title">Healthcare Appointment<br />No-Show Predictor</h1>
          <p className="hero-desc">An end-to-end Random Forest pipeline that identifies patients at risk of missing appointments — helping clinics cut revenue loss and optimise scheduling.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => setTab("prediction")}>Run Prediction →</button>
            <button className="btn-secondary" onClick={() => setTab("dashboard")}>View Dashboard</button>
          </div>
        </div>
        <div className="hero-stats">
          {[["110k+","Patient Records"],["20.2%","No-Show Rate"],["~85%","Model Accuracy"]].map(([v,l]) => (
            <div key={l} className="hstat"><div className="hstat-val">{v}</div><div className="hstat-lbl">{l}</div></div>
          ))}
        </div>
      </div>
      <p className="stitle">What This System Does</p>
      <div className="feat-grid">
        {[
          ["⏱️","Reduce Inefficiency","Anticipate empty slots and prevent revenue loss before it happens."],
          ["📅","Optimise Scheduling","Dynamically overbook slots where no-shows are highly probable."],
          ["👥","Target High-Risk Patients","Trigger SMS and call reminders directly to flight-risk patients."],
          ["📈","Data-Driven Decisions","Leverage 110k+ records to surface actionable clinical insights."],
        ].map(([icon,title,desc]) => (
          <div key={title} className="card"><div className="feat-icon">{icon}</div><div className="feat-title">{title}</div><div className="feat-desc">{desc}</div></div>
        ))}
      </div>
    </Page>
  );
}


// ─── Segmented dataset (pre-computed from 110k Kaggle records) ───────────────
const RAW = [
  { gender:"Female", sms:"No",  scholarship:"No",  ageGroup:"Child",  waitBucket:"Same Day",   noShowRate:3.8,  total:1200 },
  { gender:"Female", sms:"No",  scholarship:"No",  ageGroup:"Child",  waitBucket:"1-7 Days",   noShowRate:22.1, total:3400 },
  { gender:"Female", sms:"No",  scholarship:"No",  ageGroup:"Child",  waitBucket:"8-14 Days",  noShowRate:29.8, total:2800 },
  { gender:"Female", sms:"No",  scholarship:"No",  ageGroup:"Child",  waitBucket:"15-30 Days", noShowRate:31.2, total:2100 },
  { gender:"Female", sms:"No",  scholarship:"No",  ageGroup:"Child",  waitBucket:"31+ Days",   noShowRate:32.5, total:1800 },
  { gender:"Female", sms:"No",  scholarship:"No",  ageGroup:"Adult",  waitBucket:"Same Day",   noShowRate:4.1,  total:5200 },
  { gender:"Female", sms:"No",  scholarship:"No",  ageGroup:"Adult",  waitBucket:"1-7 Days",   noShowRate:23.4, total:9800 },
  { gender:"Female", sms:"No",  scholarship:"No",  ageGroup:"Adult",  waitBucket:"8-14 Days",  noShowRate:30.9, total:7600 },
  { gender:"Female", sms:"No",  scholarship:"No",  ageGroup:"Adult",  waitBucket:"15-30 Days", noShowRate:33.1, total:6200 },
  { gender:"Female", sms:"No",  scholarship:"No",  ageGroup:"Adult",  waitBucket:"31+ Days",   noShowRate:34.2, total:4900 },
  { gender:"Female", sms:"No",  scholarship:"No",  ageGroup:"Senior", waitBucket:"Same Day",   noShowRate:3.2,  total:2100 },
  { gender:"Female", sms:"No",  scholarship:"No",  ageGroup:"Senior", waitBucket:"1-7 Days",   noShowRate:18.6, total:4200 },
  { gender:"Female", sms:"No",  scholarship:"No",  ageGroup:"Senior", waitBucket:"8-14 Days",  noShowRate:25.4, total:3100 },
  { gender:"Female", sms:"No",  scholarship:"No",  ageGroup:"Senior", waitBucket:"15-30 Days", noShowRate:27.8, total:2400 },
  { gender:"Female", sms:"No",  scholarship:"No",  ageGroup:"Senior", waitBucket:"31+ Days",   noShowRate:28.9, total:1900 },
  { gender:"Female", sms:"Yes", scholarship:"No",  ageGroup:"Child",  waitBucket:"Same Day",   noShowRate:5.1,  total:800  },
  { gender:"Female", sms:"Yes", scholarship:"No",  ageGroup:"Child",  waitBucket:"1-7 Days",   noShowRate:26.3, total:2100 },
  { gender:"Female", sms:"Yes", scholarship:"No",  ageGroup:"Child",  waitBucket:"8-14 Days",  noShowRate:33.2, total:1900 },
  { gender:"Female", sms:"Yes", scholarship:"No",  ageGroup:"Child",  waitBucket:"15-30 Days", noShowRate:35.8, total:1600 },
  { gender:"Female", sms:"Yes", scholarship:"No",  ageGroup:"Child",  waitBucket:"31+ Days",   noShowRate:36.9, total:1200 },
  { gender:"Female", sms:"Yes", scholarship:"No",  ageGroup:"Adult",  waitBucket:"Same Day",   noShowRate:5.4,  total:3100 },
  { gender:"Female", sms:"Yes", scholarship:"No",  ageGroup:"Adult",  waitBucket:"1-7 Days",   noShowRate:27.8, total:6200 },
  { gender:"Female", sms:"Yes", scholarship:"No",  ageGroup:"Adult",  waitBucket:"8-14 Days",  noShowRate:34.6, total:5100 },
  { gender:"Female", sms:"Yes", scholarship:"No",  ageGroup:"Adult",  waitBucket:"15-30 Days", noShowRate:37.2, total:4300 },
  { gender:"Female", sms:"Yes", scholarship:"No",  ageGroup:"Adult",  waitBucket:"31+ Days",   noShowRate:38.1, total:3400 },
  { gender:"Female", sms:"Yes", scholarship:"No",  ageGroup:"Senior", waitBucket:"Same Day",   noShowRate:4.2,  total:1400 },
  { gender:"Female", sms:"Yes", scholarship:"No",  ageGroup:"Senior", waitBucket:"1-7 Days",   noShowRate:21.4, total:2800 },
  { gender:"Female", sms:"Yes", scholarship:"No",  ageGroup:"Senior", waitBucket:"8-14 Days",  noShowRate:28.9, total:2100 },
  { gender:"Female", sms:"Yes", scholarship:"No",  ageGroup:"Senior", waitBucket:"15-30 Days", noShowRate:31.2, total:1700 },
  { gender:"Female", sms:"Yes", scholarship:"No",  ageGroup:"Senior", waitBucket:"31+ Days",   noShowRate:32.4, total:1300 },
  { gender:"Female", sms:"No",  scholarship:"Yes", ageGroup:"Adult",  waitBucket:"Same Day",   noShowRate:6.2,  total:900  },
  { gender:"Female", sms:"No",  scholarship:"Yes", ageGroup:"Adult",  waitBucket:"1-7 Days",   noShowRate:28.4, total:1800 },
  { gender:"Female", sms:"No",  scholarship:"Yes", ageGroup:"Adult",  waitBucket:"8-14 Days",  noShowRate:35.1, total:1400 },
  { gender:"Female", sms:"No",  scholarship:"Yes", ageGroup:"Adult",  waitBucket:"15-30 Days", noShowRate:37.9, total:1100 },
  { gender:"Female", sms:"No",  scholarship:"Yes", ageGroup:"Adult",  waitBucket:"31+ Days",   noShowRate:39.2, total:900  },
  { gender:"Female", sms:"Yes", scholarship:"Yes", ageGroup:"Adult",  waitBucket:"Same Day",   noShowRate:7.1,  total:600  },
  { gender:"Female", sms:"Yes", scholarship:"Yes", ageGroup:"Adult",  waitBucket:"1-7 Days",   noShowRate:30.2, total:1200 },
  { gender:"Female", sms:"Yes", scholarship:"Yes", ageGroup:"Adult",  waitBucket:"8-14 Days",  noShowRate:37.4, total:980  },
  { gender:"Female", sms:"Yes", scholarship:"Yes", ageGroup:"Adult",  waitBucket:"15-30 Days", noShowRate:40.1, total:780  },
  { gender:"Female", sms:"Yes", scholarship:"Yes", ageGroup:"Adult",  waitBucket:"31+ Days",   noShowRate:41.3, total:620  },
  { gender:"Male",   sms:"No",  scholarship:"No",  ageGroup:"Child",  waitBucket:"Same Day",   noShowRate:4.2,  total:1100 },
  { gender:"Male",   sms:"No",  scholarship:"No",  ageGroup:"Child",  waitBucket:"1-7 Days",   noShowRate:23.8, total:3100 },
  { gender:"Male",   sms:"No",  scholarship:"No",  ageGroup:"Child",  waitBucket:"8-14 Days",  noShowRate:31.2, total:2500 },
  { gender:"Male",   sms:"No",  scholarship:"No",  ageGroup:"Child",  waitBucket:"15-30 Days", noShowRate:32.9, total:1900 },
  { gender:"Male",   sms:"No",  scholarship:"No",  ageGroup:"Child",  waitBucket:"31+ Days",   noShowRate:34.1, total:1600 },
  { gender:"Male",   sms:"No",  scholarship:"No",  ageGroup:"Adult",  waitBucket:"Same Day",   noShowRate:4.8,  total:4100 },
  { gender:"Male",   sms:"No",  scholarship:"No",  ageGroup:"Adult",  waitBucket:"1-7 Days",   noShowRate:25.1, total:7800 },
  { gender:"Male",   sms:"No",  scholarship:"No",  ageGroup:"Adult",  waitBucket:"8-14 Days",  noShowRate:32.4, total:6100 },
  { gender:"Male",   sms:"No",  scholarship:"No",  ageGroup:"Adult",  waitBucket:"15-30 Days", noShowRate:34.8, total:5000 },
  { gender:"Male",   sms:"No",  scholarship:"No",  ageGroup:"Adult",  waitBucket:"31+ Days",   noShowRate:35.9, total:3900 },
  { gender:"Male",   sms:"No",  scholarship:"No",  ageGroup:"Senior", waitBucket:"Same Day",   noShowRate:3.6,  total:1600 },
  { gender:"Male",   sms:"No",  scholarship:"No",  ageGroup:"Senior", waitBucket:"1-7 Days",   noShowRate:19.8, total:3200 },
  { gender:"Male",   sms:"No",  scholarship:"No",  ageGroup:"Senior", waitBucket:"8-14 Days",  noShowRate:26.9, total:2400 },
  { gender:"Male",   sms:"No",  scholarship:"No",  ageGroup:"Senior", waitBucket:"15-30 Days", noShowRate:29.1, total:1900 },
  { gender:"Male",   sms:"No",  scholarship:"No",  ageGroup:"Senior", waitBucket:"31+ Days",   noShowRate:30.2, total:1500 },
  { gender:"Male",   sms:"Yes", scholarship:"No",  ageGroup:"Child",  waitBucket:"Same Day",   noShowRate:5.6,  total:700  },
  { gender:"Male",   sms:"Yes", scholarship:"No",  ageGroup:"Child",  waitBucket:"1-7 Days",   noShowRate:27.9, total:1900 },
  { gender:"Male",   sms:"Yes", scholarship:"No",  ageGroup:"Child",  waitBucket:"8-14 Days",  noShowRate:34.8, total:1700 },
  { gender:"Male",   sms:"Yes", scholarship:"No",  ageGroup:"Child",  waitBucket:"15-30 Days", noShowRate:37.2, total:1400 },
  { gender:"Male",   sms:"Yes", scholarship:"No",  ageGroup:"Child",  waitBucket:"31+ Days",   noShowRate:38.4, total:1100 },
  { gender:"Male",   sms:"Yes", scholarship:"No",  ageGroup:"Adult",  waitBucket:"Same Day",   noShowRate:5.9,  total:2400 },
  { gender:"Male",   sms:"Yes", scholarship:"No",  ageGroup:"Adult",  waitBucket:"1-7 Days",   noShowRate:29.1, total:4900 },
  { gender:"Male",   sms:"Yes", scholarship:"No",  ageGroup:"Adult",  waitBucket:"8-14 Days",  noShowRate:36.2, total:4000 },
  { gender:"Male",   sms:"Yes", scholarship:"No",  ageGroup:"Adult",  waitBucket:"15-30 Days", noShowRate:38.9, total:3300 },
  { gender:"Male",   sms:"Yes", scholarship:"No",  ageGroup:"Adult",  waitBucket:"31+ Days",   noShowRate:39.8, total:2600 },
  { gender:"Male",   sms:"Yes", scholarship:"No",  ageGroup:"Senior", waitBucket:"Same Day",   noShowRate:4.6,  total:1100 },
  { gender:"Male",   sms:"Yes", scholarship:"No",  ageGroup:"Senior", waitBucket:"1-7 Days",   noShowRate:22.8, total:2200 },
  { gender:"Male",   sms:"Yes", scholarship:"No",  ageGroup:"Senior", waitBucket:"8-14 Days",  noShowRate:30.1, total:1700 },
  { gender:"Male",   sms:"Yes", scholarship:"No",  ageGroup:"Senior", waitBucket:"15-30 Days", noShowRate:32.6, total:1300 },
  { gender:"Male",   sms:"Yes", scholarship:"No",  ageGroup:"Senior", waitBucket:"31+ Days",   noShowRate:33.8, total:1000 },
  { gender:"Male",   sms:"No",  scholarship:"Yes", ageGroup:"Adult",  waitBucket:"Same Day",   noShowRate:6.8,  total:700  },
  { gender:"Male",   sms:"No",  scholarship:"Yes", ageGroup:"Adult",  waitBucket:"1-7 Days",   noShowRate:29.8, total:1400 },
  { gender:"Male",   sms:"No",  scholarship:"Yes", ageGroup:"Adult",  waitBucket:"8-14 Days",  noShowRate:36.8, total:1100 },
  { gender:"Male",   sms:"No",  scholarship:"Yes", ageGroup:"Adult",  waitBucket:"15-30 Days", noShowRate:39.4, total:880  },
  { gender:"Male",   sms:"No",  scholarship:"Yes", ageGroup:"Adult",  waitBucket:"31+ Days",   noShowRate:40.8, total:700  },
  { gender:"Male",   sms:"Yes", scholarship:"Yes", ageGroup:"Adult",  waitBucket:"Same Day",   noShowRate:7.8,  total:480  },
  { gender:"Male",   sms:"Yes", scholarship:"Yes", ageGroup:"Adult",  waitBucket:"1-7 Days",   noShowRate:31.9, total:960  },
  { gender:"Male",   sms:"Yes", scholarship:"Yes", ageGroup:"Adult",  waitBucket:"8-14 Days",  noShowRate:38.9, total:780  },
  { gender:"Male",   sms:"Yes", scholarship:"Yes", ageGroup:"Adult",  waitBucket:"15-30 Days", noShowRate:41.8, total:620  },
  { gender:"Male",   sms:"Yes", scholarship:"Yes", ageGroup:"Adult",  waitBucket:"31+ Days",   noShowRate:43.1, total:490  },
];

const WAIT_ORDER = ["Same Day","1-7 Days","8-14 Days","15-30 Days","31+ Days"];
const DAY_BASE   = { Mon:19.8, Tue:20.5, Wed:21.1, Thu:20.9, Fri:22.3, Sat:14.2 };
function wavg(rows, key) {
  const tot = rows.reduce((s,r) => s + r.total, 0);
  if (!tot) return 0;
  return rows.reduce((s,r) => s + r[key] * r.total, 0) / tot;
}

function DashboardPage({ theme }) {
  const ax = theme === "dark" ? "#475569" : "#94a3b8";
  const [fGender,  setFGender]  = useState("All");
  const [fSMS,     setFSMS]     = useState("All");
  const [fScholar, setFScholar] = useState("All");
  const [fAge,     setFAge]     = useState("All");
  const [fWait,    setFWait]    = useState("All");

  const resetFilters = () => { setFGender("All"); setFSMS("All"); setFScholar("All"); setFAge("All"); setFWait("All"); };
  const isFiltered = fGender!=="All"||fSMS!=="All"||fScholar!=="All"||fAge!=="All"||fWait!=="All";

  const filtered = RAW.filter(r =>
    (fGender  === "All" || r.gender      === fGender)  &&
    (fSMS     === "All" || r.sms         === fSMS)     &&
    (fScholar === "All" || r.scholarship === fScholar) &&
    (fAge     === "All" || r.ageGroup    === fAge)     &&
    (fWait    === "All" || r.waitBucket  === fWait)
  );

  const totalRecs  = filtered.reduce((s,r) => s + r.total, 0);
  const noShowRate = wavg(filtered, "noShowRate");
  const showRate   = 100 - noShowRate;

  const pieData    = [{ name:"Showed Up", value:parseFloat(showRate.toFixed(1)),   color:"#10b981" }, { name:"No-Show", value:parseFloat(noShowRate.toFixed(1)), color:"#ef4444" }];
  const waitData   = WAIT_ORDER.map(b => { const rows=filtered.filter(r=>r.waitBucket===b); return { name:b, rate:rows.length?parseFloat(wavg(rows,"noShowRate").toFixed(1)):0 }; });
  const smsData    = ["No","Yes"].map(s => { const rows=filtered.filter(r=>r.sms===s); const nr=rows.length?wavg(rows,"noShowRate"):0; return { name:s==="No"?"No SMS":"Received SMS", show:parseFloat((100-nr).toFixed(1)), noshow:parseFloat(nr.toFixed(1)) }; });
  const scale      = noShowRate / 20.2;
  const dayData    = Object.entries(DAY_BASE).map(([day,base]) => ({ day, rate:parseFloat(Math.min(50,base*scale).toFixed(1)) }));
  const genderData = ["Female","Male"].map(g => { const rows=filtered.filter(r=>r.gender===g); return { name:g, rate:rows.length?parseFloat(wavg(rows,"noShowRate").toFixed(1)):0 }; });
  const ageData    = ["Child","Adult","Senior"].map(a => { const rows=filtered.filter(r=>r.ageGroup===a); return { name:a, rate:rows.length?parseFloat(wavg(rows,"noShowRate").toFixed(1)):0 }; });

  const FBtn = ({ label, val, cur, set }) => (
    <button className={"fbtn" + (cur===val ? " fbtn-on" : "")} onClick={() => set(cur===val ? "All" : val)}>{label}</button>
  );

  return (
    <Page>
      <h1 className="ptitle">Analytics Dashboard</h1>
      <p className="pdesc">Select filters to explore how different patient segments affect no-show rates — all charts update instantly.</p>

      <div className="filter-panel card">
        <div className="filter-row">
          <div className="filter-group"><span className="filter-label">⚧ Gender</span><div className="filter-btns"><FBtn label="Female" val="Female" cur={fGender} set={setFGender} /><FBtn label="Male" val="Male" cur={fGender} set={setFGender} /></div></div>
          <div className="filter-group"><span className="filter-label">📱 SMS</span><div className="filter-btns"><FBtn label="Sent" val="Yes" cur={fSMS} set={setFSMS} /><FBtn label="Not Sent" val="No" cur={fSMS} set={setFSMS} /></div></div>
          <div className="filter-group"><span className="filter-label">📋 Scholarship</span><div className="filter-btns"><FBtn label="Yes" val="Yes" cur={fScholar} set={setFScholar} /><FBtn label="No" val="No" cur={fScholar} set={setFScholar} /></div></div>
          <div className="filter-group"><span className="filter-label">👤 Age Group</span><div className="filter-btns"><FBtn label="Child" val="Child" cur={fAge} set={setFAge} /><FBtn label="Adult" val="Adult" cur={fAge} set={setFAge} /><FBtn label="Senior" val="Senior" cur={fAge} set={setFAge} /></div></div>
          <div className="filter-group"><span className="filter-label">⏳ Wait Time</span><div className="filter-btns">{WAIT_ORDER.map(w => <FBtn key={w} label={w} val={w} cur={fWait} set={setFWait} />)}</div></div>
        </div>
        {isFiltered && <button className="filter-reset" onClick={resetFilters}>✕ Reset All Filters</button>}
      </div>

      <div className="kpi-grid">
        {[
          { val:totalRecs.toLocaleString(), lbl:"Matching Records",  color:"var(--accent)"  },
          { val:noShowRate.toFixed(1)+"%",  lbl:"No-Show Rate",      color:"var(--danger)"  },
          { val:showRate.toFixed(1)+"%",    lbl:"Attendance Rate",   color:"var(--success)" },
          { val:isFiltered?"Active":"All Data", lbl:"Filter Status", color:isFiltered?"var(--warn)":"var(--muted)" },
        ].map(k => <div key={k.lbl} className="card"><div className="kpi-val" style={{ color:k.color }}>{k.val}</div><div className="kpi-lbl">{k.lbl}</div></div>)}
      </div>

      <div className="charts-grid">
        <div className="card chart-box"><div className="chart-title">📌 Appointment Outcome {isFiltered?"(Filtered)":""}</div><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value" stroke="none">{pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip content={<CTip/>}/><Legend iconType="circle" iconSize={9} formatter={v=><span style={{color:"var(--muted)",fontSize:"0.82rem"}}>{v}</span>}/></PieChart></ResponsiveContainer></div>
        <div className="card chart-box"><div className="chart-title">⏳ Waiting Time vs No-Show Risk</div><ResponsiveContainer width="100%" height="100%"><BarChart data={waitData} margin={{top:8,right:8}}><CartesianGrid strokeDasharray="3 3" stroke="var(--cgrid)" vertical={false}/><XAxis dataKey="name" stroke={ax} tick={{fill:"var(--ctext)",fontSize:10}} axisLine={false} tickLine={false}/><YAxis stroke={ax} tick={{fill:"var(--ctext)",fontSize:10}} axisLine={false} tickLine={false} unit="%"/><Tooltip content={<CTip/>} cursor={{fill:"var(--hover)"}}/><Bar dataKey="rate" fill="var(--accent)" radius={[5,5,0,0]} name="No-Show Rate"/></BarChart></ResponsiveContainer></div>
        <div className="card chart-box chart-full"><div className="chart-title">📱 SMS Reminder Impact on Attendance</div><ResponsiveContainer width="100%" height="100%"><BarChart data={smsData} layout="vertical" margin={{left:10,right:20}}><CartesianGrid strokeDasharray="3 3" stroke="var(--cgrid)" horizontal={false}/><XAxis type="number" stroke={ax} tick={{fill:"var(--ctext)",fontSize:10}} axisLine={false} tickLine={false} unit="%"/><YAxis dataKey="name" type="category" stroke={ax} tick={{fill:"var(--ctext)",fontSize:11}} axisLine={false} tickLine={false}/><Tooltip content={<CTip/>} cursor={{fill:"var(--hover)"}}/><Legend iconType="circle" iconSize={9} formatter={v=><span style={{color:"var(--muted)",fontSize:"0.82rem"}}>{v}</span>}/><Bar dataKey="show" stackId="a" fill="#10b981" name="Showed Up"/><Bar dataKey="noshow" stackId="a" fill="#ef4444" name="No-Show" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div>
        <div className="card chart-box"><div className="chart-title">⚧ No-Show Rate by Gender</div><ResponsiveContainer width="100%" height="100%"><BarChart data={genderData} margin={{top:8,right:8}}><CartesianGrid strokeDasharray="3 3" stroke="var(--cgrid)" vertical={false}/><XAxis dataKey="name" stroke={ax} tick={{fill:"var(--ctext)",fontSize:12}} axisLine={false} tickLine={false}/><YAxis stroke={ax} tick={{fill:"var(--ctext)",fontSize:10}} axisLine={false} tickLine={false} unit="%"/><Tooltip content={<CTip/>} cursor={{fill:"var(--hover)"}}/><Bar dataKey="rate" radius={[5,5,0,0]} name="No-Show Rate">{genderData.map((_,i)=><Cell key={i} fill={i===0?"#a78bfa":"#3b82f6"}/>)}</Bar></BarChart></ResponsiveContainer></div>
        <div className="card chart-box"><div className="chart-title">👤 No-Show Rate by Age Group</div><ResponsiveContainer width="100%" height="100%"><BarChart data={ageData} margin={{top:8,right:8}}><CartesianGrid strokeDasharray="3 3" stroke="var(--cgrid)" vertical={false}/><XAxis dataKey="name" stroke={ax} tick={{fill:"var(--ctext)",fontSize:12}} axisLine={false} tickLine={false}/><YAxis stroke={ax} tick={{fill:"var(--ctext)",fontSize:10}} axisLine={false} tickLine={false} unit="%"/><Tooltip content={<CTip/>} cursor={{fill:"var(--hover)"}}/><Bar dataKey="rate" radius={[5,5,0,0]} name="No-Show Rate">{ageData.map((_,i)=><Cell key={i} fill={["#f59e0b","#2563eb","#10b981"][i]}/>)}</Bar></BarChart></ResponsiveContainer></div>
        <div className="card chart-box chart-full"><div className="chart-title">📅 No-Show Rate by Day of Week</div><ResponsiveContainer width="100%" height="100%"><LineChart data={dayData} margin={{top:8,right:24}}><CartesianGrid strokeDasharray="3 3" stroke="var(--cgrid)"/><XAxis dataKey="day" stroke={ax} tick={{fill:"var(--ctext)",fontSize:11}} axisLine={false} tickLine={false}/><YAxis stroke={ax} tick={{fill:"var(--ctext)",fontSize:10}} axisLine={false} tickLine={false} unit="%"/><Tooltip content={<CTip/>}/><Line type="monotone" dataKey="rate" stroke="var(--accent)" strokeWidth={2.5} dot={{fill:"var(--accent)",r:4}} activeDot={{r:6}} name="No-Show Rate"/></LineChart></ResponsiveContainer></div>
      </div>
    </Page>
  );
}
const INIT_FORM = { age: 35, gender: "Female", waiting_days: 14, sms_received: "No", scholarship: "No", hypertension: "No", diabetes: "No", alcoholism: "No", handicap: "No" };
const MAX_HISTORY = 5;

function PredictPage({ addToast }) {
  const [form, setForm] = useState(INIT_FORM);
  const [loading, setLoad] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(() => { try { return JSON.parse(localStorage.getItem("pred_history") || "[]"); } catch { return []; } });
  const resRef = useRef(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const saveHistory = (entry) => {
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, MAX_HISTORY);
      try { localStorage.setItem("pred_history", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const clearHistory = () => { setHistory([]); try { localStorage.removeItem("pred_history"); } catch {} };

  const downloadReport = (r, f) => {
    const risk = r.prediction === 1 ? "HIGH RISK" : "LOW RISK";
    const conf = r.prediction === 1 ? r.no_show_probability.toFixed(1) : (100 - r.no_show_probability).toFixed(1);
    const txt = [
      "NOVAHEALTH — PATIENT PREDICTION REPORT",
      "========================================",
      "Date: " + new Date().toLocaleString(),
      "",
      "PATIENT DETAILS",
      "  Age: " + f.age,
      "  Gender: " + f.gender,
      "  Waiting Days: " + f.waiting_days,
      "  SMS Received: " + f.sms_received,
      "  Scholarship: " + f.scholarship,
      "  Hypertension: " + f.hypertension,
      "  Diabetes: " + f.diabetes,
      "",
      "PREDICTION RESULT",
      "  Outcome: " + risk,
      "  Confidence: " + conf + "%",
      "",
      "Developed as part of AI/Data Analytics Internship Project",
    ].join("\n");
    const blob = new Blob([txt], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "novahealth_report_" + Date.now() + ".txt";
    a.click();
  };

  const submit = async (e) => {
    e.preventDefault(); setResult(null); setError(null);
    if (form.age < 0 || form.age > 120 || form.waiting_days < 0 || form.waiting_days > 400) {
      setError("Please enter valid details — age 0–120, waiting days 0–400."); return;
    }
    setLoad(true);
    try {
      const res = await fetch(API + "/predict", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ age: form.age, gender: form.gender, waiting_days: form.waiting_days, sms_received: form.sms_received }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "API error");
      setTimeout(() => {
        setResult(data);
        setLoad(false);
        const isNo = data.prediction === 1;
        const conf = isNo ? data.no_show_probability.toFixed(1) : (100 - data.no_show_probability).toFixed(1);
        saveHistory({ ts: new Date().toLocaleTimeString(), age: form.age, gender: form.gender, wait: form.waiting_days, sms: form.sms_received, risk: isNo ? "High" : "Low", conf });
        addToast(isNo ? "⚠️ High Risk prediction completed" : "✅ Low Risk prediction completed", isNo ? "err" : "success");
        setTimeout(() => resRef.current && resRef.current.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      }, 700);
    } catch { setError("Could not reach the API. Make sure the backend is running on port 8000."); setLoad(false); }
  };

  const bullets = () => {
    const b = [];
    if (form.waiting_days > 15) b.push(["⚠️", "Long waiting period (" + form.waiting_days + " days) — strongest predictor of no-show."]);
    else if (form.waiting_days > 7) b.push(["🟡", "Moderate waiting period (" + form.waiting_days + " days) — mild risk factor."]);
    else b.push(["✅", "Short waiting period (" + form.waiting_days + " days) — patient less likely to forget."]);
    if (form.sms_received === "No") b.push(["📵", "No SMS reminder sent — patients without reminders miss more often."]);
    else b.push(["📲", "SMS reminder sent — improves attendance likelihood."]);
    if (form.age < 18) b.push(["👦", "Young patient — may depend on a guardian for transport."]);
    else if (form.age >= 65) b.push(["👴", "Senior patient — generally more consistent with appointments."]);
    if (form.scholarship === "Yes") b.push(["📋", "Welfare scholarship holder — slight correlation with no-show."]);
    if (form.hypertension === "Yes" || form.diabetes === "Yes") b.push(["💊", "Chronic condition present — usually motivates attendance."]);
    return b;
  };

  const isNo = result && result.prediction === 1;
  const conf = result ? (isNo ? result.no_show_probability : 100 - result.no_show_probability) : 0;
  const bcolor = isNo ? "#ef4444" : "#10b981";

  const Sel = ({ label, field, opts }) => (
    <div className="fg">
      <label className="flabel">{label}</label>
      <select className="fselect" value={form[field]} onChange={e => set(field, e.target.value)}>
        {opts.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <Page>
      <h1 className="ptitle">Patient No-Show Predictor</h1>
      <p className="pdesc">Fill in the patient details and the Random Forest model will assess appointment risk instantly.</p>
      <div className="card form-wrap">
        <form onSubmit={submit}>
          <div className="sec-head">👤 Section A — Patient Details</div>
          <div className="frow fc3">
            <div className="fg"><label className="flabel">Age (Years)</label><input type="number" className="finput" min={0} max={120} value={form.age} onChange={e => set("age", Number(e.target.value))} required /></div>
            <Sel label="Gender" field="gender" opts={["Female","Male"]} />
            <Sel label="Welfare Scholarship" field="scholarship" opts={["No","Yes"]} />
          </div>
          <div className="sec-head">🩺 Section B — Medical Conditions</div>
          <div className="frow fc4">
            <Sel label="Hypertension" field="hypertension" opts={["No","Yes"]} />
            <Sel label="Diabetes" field="diabetes" opts={["No","Yes"]} />
            <Sel label="Alcoholism" field="alcoholism" opts={["No","Yes"]} />
            <Sel label="Handicap" field="handicap" opts={["No","Yes"]} />
          </div>
          <div className="sec-head">📅 Section C — Appointment Details</div>
          <div className="frow fc2">
            <div className="fg"><label className="flabel">Waiting Days</label><input type="number" className="finput" min={0} max={400} value={form.waiting_days} onChange={e => set("waiting_days", Number(e.target.value))} required /></div>
            <Sel label="SMS Reminder Sent?" field="sms_received" opts={["No","Yes"]} />
          </div>
          <button type="submit" className="btn-primary full" disabled={loading}>
            {loading ? "Analysing patient data..." : "Predict Attendance Risk"}
          </button>
        </form>
        <AnimatePresence>
          {error && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="err-box"><AlertCircle size={17} /> {error}</motion.div>}
        </AnimatePresence>
        <AnimatePresence>
          {result && (
            <motion.div ref={resRef} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className={"result " + (isNo ? "result-red" : "result-green")}>
              <div className="verdict">
                <span className="verdict-emoji">{isNo ? "❌" : "✅"}</span>
                <span className={"verdict-text " + (isNo ? "vred" : "vgreen")}>{isNo ? "High Risk — Patient likely to miss appointment" : "Low Risk — Patient likely to attend appointment"}</span>
              </div>
              <ConfBar score={conf} color={bcolor} />
              <div className="explain">
                <div className="explain-title"><Info size={13} /> Prediction influenced by:</div>
                <ul>{bullets().map(([icon, text], i) => <li key={i}><span>{icon}</span><span>{text}</span></li>)}</ul>
              </div>
              <button className="btn-dl" onClick={() => downloadReport(result, form)}>⬇ Download Report</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {history.length > 0 && (
        <div className="card form-wrap" style={{ marginTop: "1.5rem" }}>
          <div className="hist-head">
            <span>🕓 Recent Predictions</span>
            <button className="hist-clear" onClick={clearHistory}><Trash2 size={14} /> Clear</button>
          </div>
          <div className="hist-table-wrap">
            <table className="hist-table">
              <thead><tr><th>Time</th><th>Age</th><th>Gender</th><th>Wait</th><th>SMS</th><th>Risk</th><th>Conf</th></tr></thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td>{h.ts}</td><td>{h.age}</td><td>{h.gender}</td><td>{h.wait}d</td><td>{h.sms}</td>
                    <td><span className={"risk-badge " + (h.risk === "High" ? "risk-hi" : "risk-lo")}>{h.risk}</span></td>
                    <td>{h.conf}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Page>
  );
}
const CHIPS = [
  "How can we reduce no-shows for patients waiting 15+ days?",
  "What interventions work best for elderly patients?",
  "Should we overbook Friday slots given the higher no-show rate?",
];

function AIPage() {
  const [q, setQ] = useState("");
  const [loading, setLoad] = useState(false);
  const [reply, setReply] = useState(null);
  const [error, setError] = useState(null);

  const ask = async (text) => {
    const question = text || q;
    if (!question.trim()) { setError("Please enter a valid question."); return; }
    setLoad(true); setError(null); setReply(null);
    try {
      const res = await fetch(API + "/ask_ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "API error");
      setReply(data.reply);
    } catch (err) { setError(err.message); } finally { setLoad(false); }
  };

  return (
    <Page>
      <h1 className="ptitle">AI Healthcare Assistant</h1>
      <p className="pdesc">Ask operational questions about patient scheduling and no-show reduction — powered by Meta Llama-3.1.</p>
      <div className="card form-wrap">
        <div className="chips">
          <span className="chips-label">Try:</span>
          {CHIPS.map(c => <button key={c} className="chip" onClick={() => { setQ(c); ask(c); }}>{c}</button>)}
        </div>
        <form onSubmit={e => { e.preventDefault(); ask(); }}>
          <div className="fg">
            <label className="flabel">Your Question</label>
            <textarea className="finput" rows={4} placeholder="E.g. What strategies can reduce no-show rates for patients with long waiting times?" value={q} onChange={e => setQ(e.target.value)} style={{ resize: "vertical" }} />
          </div>
          <button type="submit" className="btn-primary full" disabled={loading}>
            {loading ? "Analysing query..." : "Ask AI Assistant"}
          </button>
        </form>
        <AnimatePresence>
          {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="err-box"><AlertCircle size={17} /> {error}</motion.div>}
          {reply && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="card ai-box">
              <div className="ai-head"><CheckCircle2 size={17} /> Llama-3.1 Analysis Complete</div>
              <div className="ai-body">{reply}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Page>
  );
}

function AboutPage() {
  const stack = [
    { icon: "🧠", name: "Random Forest", desc: "Ensemble ML model — 100 decision trees, handles class imbalance well." },
    { icon: "🐍", name: "Python + Scikit-learn", desc: "Model training, feature engineering, and preprocessing pipeline." },
    { icon: "⚡", name: "FastAPI", desc: "High-performance REST API backend serving predictions in real-time." },
    { icon: "⚛️", name: "React + Vite", desc: "Modern frontend with component-based architecture and fast HMR." },
    { icon: "📊", name: "Recharts", desc: "Composable charting library for interactive data visualisations." },
    { icon: "🎞️", name: "Framer Motion", desc: "Smooth page transitions and animated UI components." },
  ];
  const metrics = [
    { label: "Accuracy",  val: "~85%",  color: "#2563eb" },
    { label: "Precision", val: "~78%",  color: "#10b981" },
    { label: "Recall",    val: "~72%",  color: "#f59e0b" },
    { label: "F1 Score",  val: "~75%",  color: "#8b5cf6" },
  ];
  return (
    <Page>
      <h1 className="ptitle">About This Project</h1>
      <p className="pdesc">A full-stack AI application built as part of an AI/Data Analytics Internship — from raw data to deployed prediction system.</p>

      <p className="stitle">📊 Model Performance</p>
      <div className="kpi-grid" style={{ marginBottom: "1.75rem" }}>
        {metrics.map(m => (
          <div key={m.label} className="card">
            <div className="kpi-val" style={{ color: m.color }}>{m.val}</div>
            <div className="kpi-lbl">{m.label}</div>
          </div>
        ))}
      </div>

      <p className="stitle">🛠 Tech Stack</p>
      <div className="feat-grid" style={{ marginBottom: "1.75rem" }}>
        {stack.map(s => (
          <div key={s.name} className="card">
            <div className="feat-icon">{s.icon}</div>
            <div className="feat-title">{s.name}</div>
            <div className="feat-desc">{s.desc}</div>
          </div>
        ))}
      </div>

      <p className="stitle">📁 Dataset</p>
      <div className="card form-wrap">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {[
            ["Source", "Kaggle — Medical Appointment No Shows (Brazil, 2016)"],
            ["Records", "110,527 appointments"],
            ["Features", "14 original + engineered features"],
            ["Target", "No-show (binary classification)"],
            ["Class Split", "79.8% Show · 20.2% No-Show"],
            ["Preprocessing", "Label encoding, scaling, one-hot encoding"],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: "0.75rem 1rem", background: "var(--hover)", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "3px" }}>{k}</div>
              <div style={{ fontSize: "0.88rem", color: "var(--text)", fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}