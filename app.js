/* ================================================================
   EduNova — Shared App Shell  (app.js)
   ================================================================
   Include on EVERY protected page (after auth.js and api.js):
     <script src="auth.js"></script>
     <script src="api.js"></script>
     <script src="app.js"></script>

   It will:
     1. Run requireAuth() — redirect to login if not logged in
     2. Load the logged-in user and populate header/profile everywhere
     3. Apply saved Settings (theme, accent, font-size, compact mode)
     4. Wire the sidebar hamburger + collapse + mobile overlay
     5. Wire the notification bell + profile chip logout
     6. Provide shared toast(), showBanner(), formatDate() utilities
================================================================ */

/* ── 1. AUTH GUARD (instant — runs before anything renders) ── */
requireAuth();

/* ── 2. SETTINGS APPLICATION ─────────────────────────────── */
(function applySettings() {
  try {
    const s = JSON.parse(localStorage.getItem("edunova_settings") || "{}");

    // Theme
    if (s.theme === "dark") document.documentElement.setAttribute("data-theme", "dark");

    // Accent colour
    if (s.accentColor) {
      document.documentElement.style.setProperty("--accent", s.accentColor);
    }

    // Font size
    const sizes = { small: "13px", medium: "15px", large: "17px" };
    if (s.fontSize && sizes[s.fontSize]) {
      document.documentElement.style.fontSize = sizes[s.fontSize];
    }

    // Compact mode
    if (s.compactMode) document.body.classList.add("compact-mode");

    // Sidebar colour override
    if (s.sidebarColor && s.sidebarColor !== "navy") {
      const palette = {
        dark:   "#0f172a",
        blue:   "#1e3a5f",
        teal:   "#0f4c4c",
        purple: "#2e1065",
      };
      if (palette[s.sidebarColor]) {
        document.documentElement.style.setProperty("--navy", palette[s.sidebarColor]);
      }
    }
  } catch (_) {}
})();

/* ── 3. USER POPULATION ────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {

  injectSkeletonCSS();

  // Load user (from /me or localStorage cache)
  const user = await fetchMe();
  if (!user) { logout(); return; }

  // ── Header profile chip ──
  const avatarEl = document.getElementById("headerAvatar");
  const nameEl   = document.getElementById("headerName");
  const roleEl   = document.getElementById("headerRole");

  if (avatarEl) {
    if (user.avatarUrl) {
      avatarEl.style.cssText += ";background-image:url(" + user.avatarUrl + ");background-size:cover;background-position:center;";
      avatarEl.textContent = "";
    } else {
      avatarEl.textContent = user.avatarInitials || "?";
    }
  }
  if (nameEl) nameEl.textContent = user.fullName  || user.firstName || "Lecturer";
  if (roleEl) roleEl.textContent = user.role      || "Lecturer";

  // ── Welcome message (Dashboard) ──
  const welcomeEl = document.getElementById("welcomeMsg");
  if (welcomeEl) {
    welcomeEl.textContent = "Welcome back, " + (user.fullName || user.firstName) + " 👋";
  }

  // ── Header date ──
  const dateEl = document.getElementById("headerDate");
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric", year: "numeric"
    });
  }

  // ── Profile chip — click to go to settings ──
  document.querySelectorAll(".profile-chip").forEach(chip => {
    chip.style.cursor = "pointer";
    chip.addEventListener("click", () => {
      window.location.href = "settings.html";
    });
  });

  // ── Notification bell ──
  document.querySelectorAll(".notif-btn").forEach(btn => {
    btn.addEventListener("click", () => appToast("No new notifications"));
  });

  // ── Sidebar wiring ──
  _wireSidebar();

  // ── Dispatch ready event so each page can start loading data ──
  document.dispatchEvent(new CustomEvent("appReady", { detail: { user } }));
});

/* ── 4. SIDEBAR ─────────────────────────────────────────────── */
function _wireSidebar() {
  const sidebar  = document.getElementById("sidebar");
  const overlay  = document.getElementById("overlay");
  const hamburger = document.querySelector(".hamburger");

  if (!sidebar || !hamburger) return;

  hamburger.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle("open");
      if (overlay) overlay.classList.toggle("open");
    } else {
      sidebar.classList.toggle("collapsed");
      document.body.classList.toggle("sidebar-collapsed");
    }
  });

  if (overlay) overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
  });

  // Close mobile drawer on nav click (real hrefs navigate)
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("open");
        if (overlay) overlay.classList.remove("open");
      }
    });
  });
}

/* ── 5. SHARED UTILITIES ─────────────────────────────────────── */

// Toast notification
let _toastTimer;
function appToast(msg, type = "info") {
  let toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.style.cssText = `
      position:fixed;bottom:28px;right:28px;z-index:9999;
      background:#0B1F4B;color:#fff;padding:13px 22px;border-radius:12px;
      font-size:.86rem;font-weight:600;font-family:'DM Sans',sans-serif;
      box-shadow:0 8px 28px rgba(11,31,75,.25);
      display:flex;align-items:center;gap:10px;
      transform:translateY(20px);opacity:0;
      transition:transform .28s ease,opacity .28s ease;pointer-events:none;
      max-width:360px;
    `;
    document.body.appendChild(toast);
  }
  const colors = { success:"#10B981", error:"#EF4444", warning:"#F59E0B", info:"#1E56C8" };
  toast.style.background = colors[type] || colors.info;
  toast.textContent = msg;
  toast.style.transform = "translateY(0)";
  toast.style.opacity   = "1";
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    toast.style.transform = "translateY(20px)";
    toast.style.opacity   = "0";
  }, 3000);
}

// Error banner (top of page)
function appBanner(msg, type = "error") {
  let banner = document.getElementById("appBanner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "appBanner";
    banner.style.cssText = `
      position:fixed;top:18px;left:50%;transform:translateX(-50%);
      z-index:9999;padding:12px 24px;border-radius:12px;
      font-size:.84rem;font-weight:600;font-family:'DM Sans',sans-serif;
      box-shadow:0 8px 24px rgba(0,0,0,.2);max-width:90vw;text-align:center;
      transition:opacity .3s;
    `;
    document.body.appendChild(banner);
  }
  const styles = {
    error:   "background:#EF4444;color:#fff;",
    success: "background:#10B981;color:#fff;",
    warning: "background:#F59E0B;color:#fff;",
    info:    "background:#1E56C8;color:#fff;",
  };
  banner.style.cssText += styles[type] || styles.error;
  banner.textContent = msg;
  banner.style.opacity = "1";
  setTimeout(() => { banner.style.opacity = "0"; }, 5000);
}

// Date formatter
function fmtDate(dateStr, opts = {}) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const defaults = { month: "short", day: "numeric", year: "numeric" };
  return d.toLocaleDateString("en-US", { ...defaults, ...opts });
}

// Relative time
function relTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  const d = Math.floor(h / 24);
  return d + "d ago";
}

// Status badge HTML
function statusBadge(status) {
  const map = {
    active:    ["#DCFCE7","#16A34A","Active"],
    live:      ["#DCFCE7","#16A34A","Live"],
    scheduled: ["#EFF6FF","#1E56C8","Scheduled"],
    draft:     ["#F5F5F5","#6B7A99","Draft"],
    grading:   ["#FFFBEB","#D97706","Grading"],
    closed:    ["#FEF2F2","#EF4444","Closed"],
    "at-risk": ["#FEF2F2","#EF4444","At Risk"],
    excellent: ["#DCFCE7","#16A34A","Excellent"],
  };
  const [bg, color, label] = map[status] || ["#F5F5F5","#6B7A99", status];
  return `<span style="background:${bg};color:${color};font-size:.7rem;font-weight:700;padding:3px 10px;border-radius:20px;white-space:nowrap;">${label}</span>`;
}

// Loading spinner HTML
function spinnerHTML(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`;
}

// Inject global styles needed by app.js
(function injectAppStyles() {
  if (document.getElementById("app-global-css")) return;
  const s = document.createElement("style");
  s.id = "app-global-css";
  s.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }
    .compact-mode .content { padding: 16px 18px !important; gap: 14px !important; }
    .compact-mode .nav-item { padding: 7px 20px !important; }
    [data-theme="dark"] {
      --bg: #0f172a; --card: #1e293b; --text: #e2e8f0; --text-muted: #94a3b8;
      --border: #334155; --navy: #020617;
    }
    [data-theme="dark"] .header { background: #1e293b; }
    [data-theme="dark"] input, [data-theme="dark"] select, [data-theme="dark"] textarea {
      background: #1e293b !important; color: #e2e8f0 !important; border-color: #334155 !important;
    }
  `;
  document.head.appendChild(s);
})();