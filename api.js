/* ================================================================
   EduNova — Central API Service  (api.js)
   All data is fetched exclusively from the Railway backend.
================================================================ */

const API_BASE_URL = "https://edunova-8ut1.onrender.com";

/* ── ENDPOINTS ─────────────────────────────────────────────── */
const API = {
  // Auth
  login:            "/auth/login",
  register:         "/auth/register",
  me:               "/auth/me",
  logout:           "/auth/logout",
  updateProfile:    "/auth/profile",
  changePassword:   "/auth/password",

  // Dashboard
  dashboardStats:    "/dashboard/stats",
  dashboardClasses:  "/dashboard/classes",
  dashboardUpcoming: "/dashboard/upcoming",
  dashboardActivity: "/dashboard/activity",
  dashboardAnnouncements: "/dashboard/announcements",

  // Classes
  classes:       "/classes",
  classById:     (id) => `/classes/${id}`,
  createClass:   "/classes",
  updateClass:   (id) => `/classes/${id}`,
  deleteClass:   (id) => `/classes/${id}`,

  // Live
  liveSessions:     "/live",
  liveStart:        "/live/start",
  liveEnd:          (id) => `/live/${id}/end`,
  liveParticipants: (id) => `/live/${id}/participants`,
  liveChat:         (id) => `/live/${id}/chat`,
  liveRecordings:   "/live/recordings",

  // Students
  students:          "/students",
  studentById:       (id) => `/students/${id}`,
  studentGrades:     (id) => `/students/${id}/grades`,
  studentAttendance: (id) => `/students/${id}/attendance`,

  // Assignments
  assignments:           "/assignments",
  assignmentById:        (id) => `/assignments/${id}`,
  createAssignment:      "/assignments",
  updateAssignment:      (id) => `/assignments/${id}`,
  deleteAssignment:      (id) => `/assignments/${id}`,
  assignmentSubmissions: (id) => `/assignments/${id}/submissions`,
  gradeSubmission:       (aId, sId) => `/assignments/${aId}/submissions/${sId}/grade`,

  // Quizzes
  quizzes:      "/quizzes",
  quizById:     (id) => `/quizzes/${id}`,
  createQuiz:   "/quizzes",
  updateQuiz:   (id) => `/quizzes/${id}`,
  deleteQuiz:   (id) => `/quizzes/${id}`,
  quizResults:  (id) => `/quizzes/${id}/results`,
  publishQuiz:  (id) => `/quizzes/${id}/publish`,

  // Announcements
  announcements:        "/announcements",
  announcementById:     (id) => `/announcements/${id}`,
  createAnnouncement:   "/announcements",
  replyAnnouncement:    (id) => `/announcements/${id}/reply`,
  markAnnouncementRead: (id) => `/announcements/${id}/read`,

  // Messages
  conversations:    "/messages/conversations",
  conversationById: (id) => `/messages/conversations/${id}`,
  sendMessage:      (id) => `/messages/conversations/${id}/send`,
  newConversation:  "/messages/conversations/new",

  // Schedule
  schedule:    "/schedule",
  createEvent: "/schedule",
  updateEvent: (id) => `/schedule/${id}`,
  deleteEvent: (id) => `/schedule/${id}`,

  // Resources
  resources:       "/resources",
  resourceById:    (id) => `/resources/${id}`,
  uploadResource:  "/resources/upload",
  deleteResource:  (id) => `/resources/${id}`,
  resourceFolders: "/resources/folders",

  // Reports
  reportsOverview:   "/reports/overview",
  reportsStudents:   "/reports/students",
  reportsClasses:    "/reports/classes",
  reportsEngagement: "/reports/engagement",
  exportReport:      (type) => `/reports/export/${type}`,

  // Settings
  getSettings:    "/settings",
  saveSettings:   "/settings",
  uploadAvatar:   "/settings/avatar",
  deleteAccount:  "/settings/account",
  notifSettings:  "/settings/notifications",
  privacySettings:"/settings/privacy",
  sessions:       "/settings/sessions",
  revokeSession:  (id) => `/settings/sessions/${id}`,
};

/* ── HTTP HELPER ───────────────────────────────────────────── */
async function _req(method, path, body = null, isFormData = false) {
  const token = getToken();
  const headers = {};
  if (token) headers["Authorization"] = "Bearer " + token;
  if (body && !isFormData) headers["Content-Type"] = "application/json";

  const opts = { method, headers };
  if (body) opts.body = isFormData ? body : JSON.stringify(body);

  try {
    const res = await fetch(API_BASE_URL + path, opts);
    if (res.status === 401) {
      clearSession();
      window.location.replace("login.html");
      return null;
    }
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error("API error [" + method + " " + path + "]:", err);
    return { ok: false, status: 0, data: {} };
  }
}

const $get    = (path)            => _req("GET",    path);
const $post   = (path, body, fd)  => _req("POST",   path, body, fd);
const $put    = (path, body)      => _req("PUT",    path, body);
const $patch  = (path, body)      => _req("PATCH",  path, body);
const $delete = (path)            => _req("DELETE", path);

/* ── API FETCH WRAPPERS ─────────────────────────────────────── */

async function getUser()              { return (await $get(API.me))?.data?.user || null; }
async function getDashboardStats()    { return (await $get(API.dashboardStats))?.data || null; }
async function getDashboardClasses()  { return (await $get(API.dashboardClasses))?.data || null; }
async function getDashboardUpcoming() { return (await $get(API.dashboardUpcoming))?.data || null; }
async function getDashboardActivity() { return (await $get(API.dashboardActivity))?.data || null; }
async function getDashboardAnnouncements() { return (await $get(API.dashboardAnnouncements))?.data || null; }

async function getClasses()           { return (await $get(API.classes))?.data || null; }
async function createClass(data)      { return $post(API.createClass, data); }
async function updateClass(id, data)  { return $put(API.updateClass(id), data); }
async function deleteClass(id)        { return $delete(API.deleteClass(id)); }

async function getStudents()          { return (await $get(API.students))?.data || null; }

async function getAssignments()       { return (await $get(API.assignments))?.data || null; }
async function createAssignment(data) { return $post(API.createAssignment, data); }
async function updateAssignment(id,d) { return $put(API.updateAssignment(id), d); }
async function deleteAssignment(id)   { return $delete(API.deleteAssignment(id)); }

async function getQuizzes()           { return (await $get(API.quizzes))?.data || null; }
async function createQuiz(data)       { return $post(API.createQuiz, data); }
async function deleteQuiz(id)         { return $delete(API.deleteQuiz(id)); }
async function publishQuiz(id)        { return $post(API.publishQuiz(id)); }

async function getAnnouncements()     { return (await $get(API.announcements))?.data || null; }
async function createAnnouncement(d)  { return $post(API.createAnnouncement, d); }
async function replyAnnouncement(id,d){ return $post(API.replyAnnouncement(id), d); }
async function markAnnouncementRead(id){ return $patch(API.markAnnouncementRead(id)); }

async function getConversations()     { return (await $get(API.conversations))?.data || null; }
async function getMessages(id)        { return (await $get(API.conversationById(id)))?.data || null; }
async function sendMessage(id, text)  { return $post(API.sendMessage(id), { text }); }

async function getSchedule()          { return (await $get(API.schedule))?.data || null; }
async function createEvent(data)      { return $post(API.createEvent, data); }
async function deleteEvent(id)        { return $delete(API.deleteEvent(id)); }

async function getResources()         { return (await $get(API.resources))?.data || null; }
async function deleteResource(id)     { return $delete(API.deleteResource(id)); }

async function getReports()           { return (await $get(API.reportsOverview))?.data || null; }

async function getLive()              { return (await $get(API.liveSessions))?.data || null; }
async function endLiveSession(id)     { return $post(API.liveEnd(id)); }

async function getSettings()          { return (await $get(API.getSettings))?.data || null; }
async function saveSettings(data)     { return $put(API.saveSettings, data); }
async function updateProfile(data,fd) { return $post(API.updateProfile, data, fd); }

/* ── SKELETON LOADER ──────────────────────────────────────── */
function showSkeleton(containerId, rows = 4, cols = 1) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = Array(rows).fill(0).map(() =>
    `<div style="display:grid;grid-template-columns:${Array(cols).fill('1fr').join(' ')};gap:12px;margin-bottom:12px;">
       ${Array(cols).fill(0).map(() =>
         `<div class="skeleton" style="height:56px;border-radius:10px;background:linear-gradient(90deg,#e8edf5 25%,#f2f5fb 50%,#e8edf5 75%);background-size:400%;animation:shimmer 1.4s infinite;"></div>`
       ).join('')}
     </div>`
  ).join('');
}

function injectSkeletonCSS() {
  if (document.getElementById('skeleton-css')) return;
  const s = document.createElement('style');
  s.id = 'skeleton-css';
  s.textContent = `@keyframes shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}`;
  document.head.appendChild(s);
}