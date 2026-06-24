/* ============================================================
   EduNova — Auth Service  (Auth.js)
   All auth calls go directly to the Railway backend.
   No mock data — real API only.
============================================================ */

const API_BASE_URL = "https://edunova-8ut1.onrender.com";

/* ── ENDPOINT PATHS ─────────────────────────────────────── */
const ENDPOINTS = {
  login:    "/api/auth/login", // POST x-www-form-urlencoded { username, password }
  register: "/api/auth/register",  // POST multipart/form-data
  me:       "/api/auth/me",        // GET  Authorization: Bearer <token>
  logout:   "/api/auth/logout",    // POST Authorization: Bearer <token>
};

/* ── TOKEN HELPERS ──────────────────────────────────────── */
const TOKEN_KEY = "edunova_token";
const USER_KEY  = "edunova_user";

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getToken()      { return localStorage.getItem(TOKEN_KEY); }
function isLoggedIn()    { return !!getToken(); }
function getStoredUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; }
  catch { return null; }
}

/* ── ROUTE GUARD ─────────────────────────────────────────── */
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.replace("login.html");
  }
}

/* ── LOGOUT ─────────────────────────────────────────────── */
async function logout() {
  const token = getToken();
  if (token) {
    try {
      await fetch(API_BASE_URL + ENDPOINTS.logout, {
        method: "POST",
        headers: { "Authorization": "Bearer " + token }
      });
    } catch (_) { /* ignore network errors on logout */ }
  }
  clearSession();
  window.location.replace("login.html");
}

/* ── LOGIN ───────────────────────────────────────────────
   Returns: { ok: true, user, token }  on success
            { ok: false, message }     on failure
──────────────────────────────────────────────────────────── */
async function apiLogin(email, password) {
  try {
    // FastAPI OAuth2 requires x-www-form-urlencoded with field "username"
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    form.append("grant_type", "password");

    const res = await fetch(API_BASE_URL + ENDPOINTS.login, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, message: data.message || "Invalid credentials. Please try again." };
    }

    const token   = data.access_token || data.token || data.accessToken;
    const rawUser = data.user  || data;
    const user    = _normaliseUser(rawUser);
    saveSession(token, user);
    return { ok: true, user, token };

  } catch (err) {
    return { ok: false, message: "Network error. Please check your connection." };
  }
}

/* ── REGISTER ────────────────────────────────────────────
   Accepts a plain object of all form fields.
   Returns: { ok: true, user, token }  on success
            { ok: false, message }     on failure
──────────────────────────────────────────────────────────── */
async function apiRegister(fields) {
  try {
    // Build multipart form for file uploads (CV, certificate, avatar)
    const form = new FormData();
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined && v !== null) form.append(k, v);
    }

    const res = await fetch(API_BASE_URL + ENDPOINTS.register, {
      method: "POST",
      body: form,
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, message: data.message || "Registration failed. Please try again." };
    }

    const token   = data.access_token || data.token || data.accessToken;
    const user    = _normaliseUser(data.user || data);
    saveSession(token, user);
    return { ok: true, user, token };

  } catch (err) {
    return { ok: false, message: "Network error. Please check your connection." };
  }
}

/* ── FETCH CURRENT USER (/me) ────────────────────────────── */
async function fetchMe() {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(API_BASE_URL + ENDPOINTS.me, {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!res.ok) {
      clearSession();
      return null;
    }
    const data = await res.json().catch(() => ({}));
    const user = _normaliseUser(data.user || data);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch {
    // Network failure — fall back to cached user so UI still loads
    return getStoredUser();
  }
}

/* ── USER NORMALISER ─────────────────────────────────────── */
function _normaliseUser(u) {
  if (!u || typeof u !== "object") return null;
  const firstName = u.firstName || u.first_name  || (u.name || "").split(" ")[0] || "";
  const lastName  = u.lastName  || u.last_name   || (u.name || "").split(" ").slice(1).join(" ") || "";
  const title     = u.title     || u.academicTitle || "";
  const fullName  = u.fullName  || u.full_name
    || (title ? title + " " : "") + firstName + (lastName ? " " + lastName : "");

  return {
    id:            u.id || u._id || u.userId,
    firstName,
    lastName,
    fullName,
    email:         u.email,
    phone:         u.phone || u.phoneNumber || "",
    username:      u.username || "",
    role:          u.role || "Lecturer",
    title,
    qualification: u.qualification || u.degree || "",
    institution:   u.institution   || u.university || "",
    department:    u.department    || u.faculty || "",
    experience:    u.experience    || u.yearsExperience || "",
    bio:           u.bio           || u.about || "",
    country:       u.country       || "",
    avatarInitials:u.avatarInitials || _initials(firstName, lastName),
    avatarUrl:     u.avatarUrl     || u.avatar || u.profilePicture || "",
  };
}

function _initials(first, last) {
  return ((first || "").charAt(0) + (last || "").charAt(0)).toUpperCase() || "U";
}