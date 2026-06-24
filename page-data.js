/* ================================================================
   EduNova — Page Data Loader  (page-data.js)
   ================================================================
   This file detects which page is active and runs the correct
   data loader. Include it AFTER app.js on every protected page.

   Every loader:
    - Shows skeleton UI while fetching
    - Replaces hardcoded content with API data
    - Falls back gracefully if API is unavailable
================================================================ */

document.addEventListener("appReady", ({ detail: { user } }) => {
  const page = location.pathname.split("/").pop().replace(".html","").toLowerCase();
  const loaders = {
    "dashboard":     loadDashboard,
    "classes":       loadClasses,
    "live":          loadLive,
    "students":      loadStudents,
    "assignments":   loadAssignments,
    "quizzes":       loadQuizzes,
    "announcements": loadAnnouncements,
    "messages":      loadMessages,
    "schedule":      loadSchedule,
    "resources":     loadResources,
    "reports":       loadReports,
    "settings":      loadSettings,
  };
  const loader = loaders[page];
  if (loader) loader(user);
});

/* ════════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════════ */
async function loadDashboard(user) {
  const [stats, classes, upcoming, activity, announcements] = await Promise.all([
    getDashboardStats(),
    getDashboardClasses(),
    getDashboardUpcoming(),
    getDashboardActivity(),
    getDashboardAnnouncements(),
  ]);

  // Stat cards
  _setText("statTotalClasses",    stats?.totalClasses      ?? "—");
  _setText("statActiveStudents",  stats?.activeStudents    ?? "—");
  _setText("statPendingAssignments", stats?.pendingAssignments ?? "—");
  _setText("statAvgAttendance",   (stats?.avgAttendance ?? "—") + (stats?.avgAttendance ? "%" : ""));
  _setText("statCompletionRate",  (stats?.completionRate ?? "—") + (stats?.completionRate ? "%" : ""));
  _setText("statAvgGrade",        (stats?.avgGrade ?? "—") + (stats?.avgGrade ? "%" : ""));
  _setText("statNewMessages",     stats?.newMessages       ?? "—");

  // Classes list
  if (classes && document.getElementById("dashClassList")) {
    document.getElementById("dashClassList").innerHTML = classes.map(c => `
      <div class="class-row" style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer;" onclick="window.location='classes.html'">
        <div style="width:40px;height:40px;border-radius:10px;background:${c.color}18;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <span style="font-size:.75rem;font-weight:700;color:${c.color}">${c.code}</span>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:.85rem;font-weight:600;color:var(--navy);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.name}</div>
          <div style="font-size:.75rem;color:var(--text-muted);">${c.students} students</div>
        </div>
        ${statusBadge(c.status)}
      </div>`).join("");
  }

  // Upcoming events
  if (upcoming && document.getElementById("dashUpcoming")) {
    const typeColors = { lecture:"#1E56C8", quiz:"#F59E0B", deadline:"#EF4444", lab:"#0D9488" };
    document.getElementById("dashUpcoming").innerHTML = upcoming.map(e => `
      <div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">
        <div style="width:42px;flex-shrink:0;text-align:center;background:var(--bg);border-radius:8px;padding:4px;">
          <div style="font-size:.62rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">${e.day||""}</div>
          <div style="font-size:.95rem;font-weight:700;color:var(--navy);">${e.date?.split(" ")[0]||""}</div>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:.84rem;font-weight:600;color:var(--navy);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.name}</div>
          <div style="font-size:.75rem;color:var(--text-muted);">${e.time}</div>
        </div>
        <span style="background:${typeColors[e.type]||"#6B7A99"}18;color:${typeColors[e.type]||"#6B7A99"};font-size:.68rem;font-weight:700;padding:3px 8px;border-radius:20px;white-space:nowrap;flex-shrink:0;">${e.type}</span>
      </div>`).join("");
  }

  // Activity feed
  if (activity && document.getElementById("dashActivity")) {
    const typeIcons = {
      submission: "📝", question:"❓", grade:"⭐", join:"👋", default:"📌"
    };
    document.getElementById("dashActivity").innerHTML = activity.map(a => `
      <div style="display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);">
        <div style="width:30px;height:30px;border-radius:8px;background:var(--bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:.9rem;">${typeIcons[a.type]||typeIcons.default}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:.82rem;color:var(--text);line-height:1.4;" >${a.text}</div>
          <div style="font-size:.72rem;color:var(--text-muted);margin-top:2px;">${a.time}</div>
        </div>
      </div>`).join("");
  }

  // Announcement strip
  if (announcements && document.getElementById("dashAnnouncements")) {
    const catColors = { exam:"#EF4444", schedule:"#1E56C8", deadline:"#F59E0B", resource:"#0D9488", general:"#6366F1" };
    document.getElementById("dashAnnouncements").innerHTML = announcements.map(n => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;" onclick="window.location='Announcements.html'">
        <div style="width:8px;height:8px;border-radius:50%;background:${catColors[n.category]||"#6B7A99"};flex-shrink:0;"></div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:.82rem;font-weight:600;color:var(--navy);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${n.title}</div>
          <div style="font-size:.72rem;color:var(--text-muted);">${n.date}</div>
        </div>
      </div>`).join("");
  }
}

/* ════════════════════════════════════════════════════════
   CLASSES
════════════════════════════════════════════════════════ */
async function loadClasses(user) {
  const classes = await getClasses();
  if (!classes) return;

  _setText("totalClassesCount", classes.length);
  _setText("activeClassesCount", classes.filter(c=>c.status==="active").length);
  _setText("totalStudentsCount", classes.reduce((s,c)=>s+c.students,0));

  const grid = document.getElementById("classesGrid");
  if (!grid) return;

  grid.innerHTML = classes.map(c => `
    <div class="class-card" style="background:var(--card);border-radius:14px;border:1px solid var(--border);box-shadow:0 2px 16px rgba(11,31,75,.08);overflow:hidden;transition:transform .2s,box-shadow .2s;cursor:pointer;" onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 28px rgba(11,31,75,.12)'" onmouseleave="this.style.transform='';this.style.boxShadow='0 2px 16px rgba(11,31,75,.08)'">
      <div style="height:6px;background:${c.color};"></div>
      <div style="padding:20px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;">
          <div>
            <div style="font-size:.72rem;font-weight:700;color:${c.color};text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">${c.code}</div>
            <div style="font-size:1rem;font-weight:700;color:var(--navy);line-height:1.3;">${c.name}</div>
          </div>
          ${statusBadge(c.status)}
        </div>
        <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:14px;line-height:1.4;">${c.description}</div>
        <div style="display:flex;gap:16px;font-size:.78rem;color:var(--text-muted);margin-bottom:14px;">
          <span>👥 ${c.students} students</span>
          <span>📚 ${c.lessons} lessons</span>
          <span>⏱ ${c.duration}</span>
        </div>
        <div style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;font-size:.73rem;color:var(--text-muted);margin-bottom:4px;"><span>Progress</span><span>${c.progress}%</span></div>
          <div style="height:5px;background:var(--border);border-radius:4px;overflow:hidden;"><div style="height:100%;width:${c.progress}%;background:${c.color};border-radius:4px;transition:width .6s;"></div></div>
        </div>
        <div style="display:flex;gap:8px;">
          <button onclick="event.stopPropagation();appToast('Opening ${c.name}...')" style="flex:1;padding:8px;background:${c.color};color:#fff;border:none;border-radius:9px;font-size:.8rem;font-weight:600;cursor:pointer;font-family:inherit;transition:opacity .2s;" onmouseenter="this.style.opacity='.85'" onmouseleave="this.style.opacity='1'">Open Class</button>
          <button onclick="event.stopPropagation();appToast('Editing ${c.name}...')" style="padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:9px;font-size:.8rem;cursor:pointer;font-family:inherit;color:var(--text);">Edit</button>
        </div>
      </div>
    </div>`).join("");
}

/* ════════════════════════════════════════════════════════
   LIVE
════════════════════════════════════════════════════════ */
async function loadLive(user) {
  const data = await getLive();
  if (!data) return;

  // Active session
  if (data.active) {
    const s = data.active;
    _setText("liveSessionTitle",    s.title);
    _setText("liveSessionCourse",   s.course);
    _setText("liveParticipantCount",`${s.participants}/${s.total}`);
    _setText("liveSessionDuration", s.duration);
  }

  // Participants
  if (data.participants && document.getElementById("participantsList")) {
    document.getElementById("participantsList").innerHTML = data.participants.map(p => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">
        <div style="width:34px;height:34px;border-radius:50%;background:${p.color};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.78rem;color:#fff;flex-shrink:0;">${p.avatar}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:.84rem;font-weight:600;color:var(--navy);">${p.name}</div>
          <div style="font-size:.72rem;color:var(--text-muted);">${p.status}</div>
        </div>
        <div style="display:flex;gap:5px;">
          <span style="font-size:.75rem;">${p.muted?"🔇":"🔊"}</span>
          <span style="font-size:.75rem;">${p.video?"📹":"📷"}</span>
        </div>
      </div>`).join("");
  }

  // Chat
  if (data.chat && document.getElementById("liveChat")) {
    document.getElementById("liveChat").innerHTML = data.chat.map(m => `
      <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:10px;">
        <div style="width:28px;height:28px;border-radius:50%;background:${m.color};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.65rem;color:#fff;flex-shrink:0;">${m.avatar}</div>
        <div>
          <div style="font-size:.72rem;font-weight:700;color:var(--navy);">${m.sender} <span style="font-weight:400;color:var(--text-muted);">${m.time}</span></div>
          <div style="font-size:.82rem;color:var(--text);margin-top:2px;">${m.text}</div>
        </div>
      </div>`).join("");
  }

  // Recordings
  if (data.recordings && document.getElementById("recordingsList")) {
    document.getElementById("recordingsList").innerHTML = data.recordings.map(r => `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);">
        <div style="width:44px;height:44px;border-radius:10px;background:#EFF6FF;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg fill="none" viewBox="0 0 24 24" stroke="#1E56C8" stroke-width="2" style="width:20px;height:20px;"><path stroke-linecap="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82V15.18a1 1 0 01-1.447.894L15 14M3 8h12a2 2 0 012 2v4a2 2 0 01-2 2H3a2 2 0 01-2-2v-4a2 2 0 012-2z"/></svg>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:.84rem;font-weight:600;color:var(--navy);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.title}</div>
          <div style="font-size:.73rem;color:var(--text-muted);">${r.date} · ${r.duration} · ${r.views} views · ${r.size}</div>
        </div>
        <button onclick="appToast('Downloading recording...')" style="padding:6px 12px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:.78rem;font-weight:600;cursor:pointer;font-family:inherit;">Download</button>
      </div>`).join("");
  }
}

/* ════════════════════════════════════════════════════════
   STUDENTS
════════════════════════════════════════════════════════ */
async function loadStudents(user) {
  const students = await getStudents();
  if (!students) return;

  _setText("totalStudentsVal",  students.length);
  _setText("activeStudentsVal", students.filter(s=>s.status!=="at-risk").length);
  _setText("atRiskVal",         students.filter(s=>s.status==="at-risk").length);
  _setText("avgGradeVal",       Math.round(students.reduce((s,st)=>s+st.grade,0)/students.length) + "%");

  const tbody = document.getElementById("studentsTableBody") || document.getElementById("studentGrid") || document.getElementById("studentsList");
  if (!tbody) return;

  // Table body
  if (tbody.tagName === "TBODY" || tbody.id === "studentsTableBody") {
    tbody.innerHTML = students.map(s => `
      <tr style="border-bottom:1px solid var(--border);cursor:pointer;" onmouseenter="this.style.background='var(--bg)'" onmouseleave="this.style.background=''">
        <td style="padding:12px 16px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:34px;height:34px;border-radius:50%;background:${s.color};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.78rem;color:#fff;flex-shrink:0;">${s.avatar}</div>
            <div>
              <div style="font-size:.85rem;font-weight:600;color:var(--navy);">${s.name}</div>
              <div style="font-size:.73rem;color:var(--text-muted);">${s.email}</div>
            </div>
          </div>
        </td>
        <td style="padding:12px 16px;font-size:.83rem;color:var(--text);">${s.class}</td>
        <td style="padding:12px 16px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:60px;height:5px;background:var(--border);border-radius:4px;overflow:hidden;"><div style="height:100%;width:${s.grade}%;background:${s.grade>=80?"#10B981":s.grade>=60?"#F59E0B":"#EF4444"};"></div></div>
            <span style="font-size:.82rem;font-weight:600;color:var(--navy);">${s.grade}%</span>
          </div>
        </td>
        <td style="padding:12px 16px;font-size:.83rem;">${s.attendance}%</td>
        <td style="padding:12px 16px;">${statusBadge(s.status)}</td>
        <td style="padding:12px 16px;">
          <button onclick="appToast('Viewing ${s.name}...')" style="padding:5px 12px;background:var(--accent);color:#fff;border:none;border-radius:7px;font-size:.78rem;cursor:pointer;font-family:inherit;font-weight:600;">View</button>
        </td>
      </tr>`).join("");
  } else {
    // Card grid fallback
    tbody.innerHTML = students.map(s => `
      <div style="background:var(--card);border-radius:14px;border:1px solid var(--border);padding:18px;box-shadow:0 2px 12px rgba(11,31,75,.07);transition:transform .2s;" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform=''">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <div style="width:44px;height:44px;border-radius:50%;background:${s.color};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;color:#fff;">${s.avatar}</div>
          <div><div style="font-size:.9rem;font-weight:700;color:var(--navy);">${s.name}</div><div style="font-size:.75rem;color:var(--text-muted);">${s.class}</div></div>
          <div style="margin-left:auto;">${statusBadge(s.status)}</div>
        </div>
        <div style="display:flex;gap:16px;font-size:.78rem;color:var(--text-muted);margin-bottom:12px;"><span>Grade: <strong style="color:var(--navy)">${s.grade}%</strong></span><span>Attendance: <strong style="color:var(--navy)">${s.attendance}%</strong></span></div>
        <button onclick="appToast('Viewing ${s.name}...')" style="width:100%;padding:8px;background:var(--accent);color:#fff;border:none;border-radius:9px;font-size:.82rem;font-weight:600;cursor:pointer;font-family:inherit;">View Profile</button>
      </div>`).join("");
  }
}

/* ════════════════════════════════════════════════════════
   ASSIGNMENTS
════════════════════════════════════════════════════════ */
async function loadAssignments(user) {
  const assignments = await getAssignments();
  if (!assignments) return;

  _setText("totalAssignmentsVal",  assignments.length);
  _setText("activeAssignmentsVal", assignments.filter(a=>a.status==="active").length);
  _setText("draftAssignmentsVal",  assignments.filter(a=>a.status==="draft").length);
  _setText("gradingAssignmentsVal",assignments.filter(a=>a.status==="grading").length);

  const list = document.getElementById("assignmentList");
  if (!list) return;

  list.innerHTML = assignments.map(a => {
    const pct = a.total ? Math.round(a.submissions/a.total*100) : 0;
    const dueDate = a.dueDate ? fmtDate(a.dueDate) : "No deadline";
    return `
      <div class="assignment-card" data-status="${a.status}" data-course="${a.course}" style="background:var(--card);border-radius:14px;border:1px solid var(--border);padding:20px;box-shadow:0 2px 12px rgba(11,31,75,.07);transition:transform .2s;" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform=''">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px;">
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span style="font-size:.7rem;font-weight:700;color:var(--accent);text-transform:uppercase;">${a.course}</span>
              <span style="font-size:.7rem;background:#EFF6FF;color:var(--accent);padding:2px 7px;border-radius:20px;">${a.category}</span>
              ${statusBadge(a.status)}
            </div>
            <div style="font-size:.95rem;font-weight:700;color:var(--navy);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.title}</div>
            <div style="font-size:.78rem;color:var(--text-muted);margin-top:4px;">${a.description}</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;font-size:.78rem;color:var(--text-muted);margin-bottom:12px;">
          <span>📅 Due: ${dueDate}</span>
          <span>⭐ ${a.totalPoints} pts</span>
          <span>📝 ${a.submissions}/${a.total} submitted</span>
        </div>
        <div style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;font-size:.73rem;color:var(--text-muted);margin-bottom:4px;"><span>Submissions</span><span>${pct}%</span></div>
          <div style="height:5px;background:var(--border);border-radius:4px;overflow:hidden;"><div style="height:100%;width:${pct}%;background:${pct>=80?"#10B981":pct>=50?"#1E56C8":"#F59E0B"};border-radius:4px;"></div></div>
        </div>
        <div style="display:flex;gap:8px;">
          ${a.status==="draft"
            ? `<button onclick="appToast('Publishing assignment...',\'success\')" style="flex:1;padding:7px;background:var(--success);color:#fff;border:none;border-radius:9px;font-size:.8rem;font-weight:600;cursor:pointer;font-family:inherit;">Publish</button>`
            : `<button onclick="appToast('Opening submissions...')" style="flex:1;padding:7px;background:var(--accent);color:#fff;border:none;border-radius:9px;font-size:.8rem;font-weight:600;cursor:pointer;font-family:inherit;">View Submissions</button>`}
          <button onclick="appToast('Editing assignment...')" style="padding:7px 12px;background:var(--bg);border:1px solid var(--border);border-radius:9px;font-size:.8rem;cursor:pointer;font-family:inherit;">Edit</button>
          <button onclick="if(confirm('Delete this assignment?')){appToast('Assignment deleted','error');this.closest('.assignment-card').remove()}" style="padding:7px 12px;background:#FEF2F2;border:1px solid #FECACA;color:#EF4444;border-radius:9px;font-size:.8rem;cursor:pointer;font-family:inherit;">Delete</button>
        </div>
      </div>`}).join("");
}

/* ════════════════════════════════════════════════════════
   QUIZZES
════════════════════════════════════════════════════════ */
async function loadQuizzes(user) {
  const quizzes = await getQuizzes();
  if (!quizzes) return;

  _setText("totalQuizzesVal",     quizzes.length);
  _setText("activeQuizzesVal",    quizzes.filter(q=>q.status==="active").length);
  _setText("draftQuizzesVal",     quizzes.filter(q=>q.status==="draft").length);
  _setText("closedQuizzesVal",    quizzes.filter(q=>q.status==="closed").length);

  const list = document.getElementById("quizList");
  if (!list) return;

  list.innerHTML = quizzes.map(q => {
    const pct = q.total ? Math.round(q.attempts/q.total*100) : 0;
    return `
      <div class="quiz-card" data-status="${q.status}" style="background:var(--card);border-radius:14px;border:1px solid var(--border);padding:20px;box-shadow:0 2px 12px rgba(11,31,75,.07);transition:transform .2s;" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform=''">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px;">
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span style="font-size:.7rem;font-weight:700;color:var(--accent);text-transform:uppercase;">${q.course}</span>
              ${statusBadge(q.status)}
            </div>
            <div style="font-size:.95rem;font-weight:700;color:var(--navy);line-height:1.3;">${q.title}</div>
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:.78rem;color:var(--text-muted);margin-bottom:12px;">
          <span>❓ ${q.questions} questions</span>
          <span>⏱ ${q.duration} min</span>
          <span>📅 Due: ${q.dueDate ? fmtDate(q.dueDate) : "—"}</span>
          <span>✅ Pass mark: ${q.passMark}%</span>
        </div>
        ${q.status==="active"||q.status==="closed" ? `
        <div style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;font-size:.73rem;color:var(--text-muted);margin-bottom:4px;">
            <span>Attempts: ${q.attempts}/${q.total}</span>
            ${q.avgScore ? `<span>Avg Score: ${q.avgScore}%</span>` : ""}
          </div>
          <div style="height:5px;background:var(--border);border-radius:4px;overflow:hidden;"><div style="height:100%;width:${pct}%;background:var(--accent);border-radius:4px;"></div></div>
        </div>` : ""}
        <div style="display:flex;gap:8px;">
          ${q.status==="draft"
            ? `<button onclick="appToast('Publishing quiz...','success')" style="flex:1;padding:7px;background:var(--success);color:#fff;border:none;border-radius:9px;font-size:.8rem;font-weight:600;cursor:pointer;font-family:inherit;">Publish</button>`
            : q.status==="active"
            ? `<button onclick="appToast('Viewing results...')" style="flex:1;padding:7px;background:var(--accent);color:#fff;border:none;border-radius:9px;font-size:.8rem;font-weight:600;cursor:pointer;font-family:inherit;">View Results</button>`
            : `<button onclick="appToast('Viewing results...')" style="flex:1;padding:7px;background:var(--bg);border:1px solid var(--border);border-radius:9px;font-size:.8rem;font-weight:600;cursor:pointer;font-family:inherit;color:var(--navy);">View Results</button>`}
          <button onclick="appToast('Editing quiz...')" style="padding:7px 12px;background:var(--bg);border:1px solid var(--border);border-radius:9px;font-size:.8rem;cursor:pointer;font-family:inherit;">Edit</button>
          <button onclick="if(confirm('Delete this quiz?')){appToast('Quiz deleted','error');this.closest('.quiz-card').remove()}" style="padding:7px 12px;background:#FEF2F2;border:1px solid #FECACA;color:#EF4444;border-radius:9px;font-size:.8rem;cursor:pointer;font-family:inherit;">Delete</button>
        </div>
      </div>`}).join("");
}

/* ════════════════════════════════════════════════════════
   ANNOUNCEMENTS
════════════════════════════════════════════════════════ */
async function loadAnnouncements(user) {
  const announcements = await getAnnouncements();
  if (!announcements) return;

  const unread = announcements.filter(a=>a.unread).length;
  _setText("totalAnnouncementsVal", announcements.length);
  _setText("unreadAnnouncementsVal", unread);

  const list = document.getElementById("announcementsList") || document.getElementById("annList");
  if (!list) return;

  const catColors = { exam:"#EF4444", schedule:"#1E56C8", deadline:"#F59E0B", resource:"#0D9488", general:"#6366F1" };
  const priColors = { high:"#EF4444", medium:"#F59E0B", low:"#10B981" };

  list.innerHTML = announcements.map(a => `
    <div id="ann-${a.id}" style="background:var(--card);border-radius:14px;border:1px solid ${a.unread?"var(--accent)":"var(--border)"};padding:20px;box-shadow:0 2px 12px rgba(11,31,75,.07);margin-bottom:12px;${a.unread?"border-left:4px solid var(--accent);":""}" >
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <div style="width:42px;height:42px;border-radius:12px;background:${catColors[a.category]||"#6366F1"}18;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.1rem;">
          ${{exam:"📋",schedule:"📅",deadline:"⏰",resource:"📚",general:"📣"}[a.category]||"📣"}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px;">
            <span style="font-size:.95rem;font-weight:700;color:var(--navy);">${a.title}</span>
            ${a.unread ? `<span style="background:var(--accent);color:#fff;font-size:.65rem;font-weight:700;padding:2px 7px;border-radius:20px;">NEW</span>` : ""}
            <span style="background:${priColors[a.priority]||"#6B7A99"}18;color:${priColors[a.priority]||"#6B7A99"};font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:capitalize;">${a.priority}</span>
          </div>
          <div style="font-size:.82rem;color:var(--text-muted);margin-bottom:8px;line-height:1.5;">${a.preview}</div>
          <div style="font-size:.82rem;color:var(--text);line-height:1.6;margin-bottom:10px;">${a.fullContent}</div>
          <div style="display:flex;align-items:center;gap:12px;font-size:.75rem;color:var(--text-muted);">
            <span>👤 ${a.sender}</span>
            <span>🕐 ${a.time}</span>
            <span>👥 ${a.target}</span>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px;">
            <button onclick="appToast('Reply sent to ${a.sender.replace(/'/g,"\\'")}','success')" style="padding:6px 14px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:.8rem;font-weight:600;cursor:pointer;font-family:inherit;">Reply</button>
            <button onclick="document.getElementById('ann-${a.id}').style.borderColor='var(--border)';document.getElementById('ann-${a.id}').style.borderLeft='';appToast('Marked as read')" style="padding:6px 14px;background:var(--bg);border:1px solid var(--border);border-radius:8px;font-size:.8rem;cursor:pointer;font-family:inherit;">Mark Read</button>
            <button onclick="document.getElementById('ann-${a.id}').remove();appToast('Archived')" style="padding:6px 14px;background:var(--bg);border:1px solid var(--border);border-radius:8px;font-size:.8rem;cursor:pointer;font-family:inherit;">Archive</button>
          </div>
        </div>
      </div>
    </div>`).join("");
}

/* ════════════════════════════════════════════════════════
   MESSAGES
════════════════════════════════════════════════════════ */
async function loadMessages(user) {
  const conversations = await getConversations();
  if (!conversations) return;

  const list = document.getElementById("convList") || document.getElementById("conversationList");
  if (!list) return;

  list.innerHTML = conversations.map(c => `
    <div id="conv-${c.id}" class="conv-item" onclick="openConversation('${c.id}','${c.name.replace(/'/g,"\\'")}','${c.avatar}','${c.color}')" style="display:flex;align-items:center;gap:10px;padding:12px 16px;cursor:pointer;border-bottom:1px solid var(--border);transition:background .15s;${c.unread?"background:rgba(30,86,200,.04)":""}" onmouseenter="this.style.background='var(--bg)'" onmouseleave="this.style.background='${c.unread?"rgba(30,86,200,.04)":""}'">
      <div style="position:relative;">
        <div style="width:42px;height:42px;border-radius:50%;background:${c.color};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;color:#fff;flex-shrink:0;">${c.avatar}</div>
        ${c.online ? `<div style="position:absolute;bottom:1px;right:1px;width:10px;height:10px;border-radius:50%;background:#10B981;border:2px solid var(--card);"></div>` : ""}
      </div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:.85rem;font-weight:${c.unread?700:600};color:var(--navy);">${c.name}</span>
          <span style="font-size:.7rem;color:var(--text-muted);">${c.time}</span>
        </div>
        <div style="font-size:.75rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.lastMessage}</div>
      </div>
      ${c.unread ? `<div style="min-width:18px;height:18px;border-radius:20px;background:var(--accent);color:#fff;font-size:.65rem;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px;">${c.unread}</div>` : ""}
    </div>`).join("");

  // Open first conversation
  if (conversations.length > 0) openConversation(conversations[0].id, conversations[0].name, conversations[0].avatar, conversations[0].color);
}

async function openConversation(id, name, avatar, color) {
  // Highlight selected
  document.querySelectorAll(".conv-item").forEach(el => el.style.background = "");
  const el = document.getElementById("conv-" + id);
  if (el) el.style.background = "rgba(30,86,200,.08)";

  // Set header
  _setText("convName",   name);
  _setText("convRole",   "");
  const avatarEl = document.getElementById("convAvatar");
  if (avatarEl) { avatarEl.textContent = avatar; avatarEl.style.background = color; }

  // Load messages
  const msgs = await getMessages(id);
  const area = document.getElementById("messageArea") || document.getElementById("msgArea");
  if (!area || !msgs) return;

  area.innerHTML = msgs.map(m => {
    const isMe = m.from === "me";
    return `<div style="display:flex;justify-content:${isMe?"flex-end":"flex-start"};margin-bottom:10px;">
      <div style="max-width:70%;padding:10px 14px;border-radius:${isMe?"12px 4px 12px 12px":"4px 12px 12px 12px"};background:${isMe?"var(--accent)":"var(--bg)"};color:${isMe?"#fff":"var(--text)"};font-size:.85rem;line-height:1.45;box-shadow:0 2px 8px rgba(11,31,75,.08);">
        ${m.text}
        <div style="font-size:.68rem;opacity:.7;margin-top:4px;text-align:right;">${m.time}</div>
      </div>
    </div>`;
  }).join("");
  area.scrollTop = area.scrollHeight;

  // Wire send button
  const sendBtn = document.getElementById("sendBtn");
  const msgInput = document.getElementById("msgInput") || document.getElementById("messageInput");
  if (sendBtn && msgInput) {
    sendBtn.onclick = async () => {
      const text = msgInput.value.trim();
      if (!text) return;
      await sendMessage(id, text);
      msgInput.value = "";
      area.innerHTML += `<div style="display:flex;justify-content:flex-end;margin-bottom:10px;"><div style="max-width:70%;padding:10px 14px;border-radius:12px 4px 12px 12px;background:var(--accent);color:#fff;font-size:.85rem;line-height:1.45;">${text}<div style="font-size:.68rem;opacity:.7;margin-top:4px;text-align:right;">Just now</div></div></div>`;
      area.scrollTop = area.scrollHeight;
    };
    msgInput.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendBtn.click(); } });
  }
}

/* ════════════════════════════════════════════════════════
   SCHEDULE
════════════════════════════════════════════════════════ */
async function loadSchedule(user) {
  const events = await getSchedule();
  if (!events) return;

  const list = document.getElementById("eventsList") || document.getElementById("scheduleList");
  if (!list) return;

  const typeColors = { lecture:"#1E56C8", lab:"#0D9488", quiz:"#F59E0B", deadline:"#EF4444", meeting:"#6366F1" };
  const grouped = {};
  events.forEach(e => {
    const d = e.date || "Other";
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(e);
  });

  list.innerHTML = Object.entries(grouped).map(([date, evts]) => `
    <div style="margin-bottom:20px;">
      <div style="font-size:.78rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px;">${fmtDate(date, {weekday:"long",month:"long",day:"numeric"})}</div>
      ${evts.map(e => `
        <div style="display:flex;gap:14px;align-items:flex-start;padding:14px;background:var(--card);border-radius:12px;border:1px solid var(--border);margin-bottom:8px;border-left:4px solid ${typeColors[e.type]||"#6B7A99"};">
          <div style="text-align:center;min-width:44px;">
            <div style="font-size:.78rem;font-weight:700;color:${typeColors[e.type]||"#6B7A99"};">${e.time}</div>
            <div style="font-size:.68rem;color:var(--text-muted);">–${e.end}</div>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:.88rem;font-weight:700;color:var(--navy);">${e.title}</div>
            <div style="font-size:.76rem;color:var(--text-muted);margin-top:2px;">${e.location}${e.course ? " · " + e.course : ""}</div>
          </div>
          <div style="display:flex;gap:6px;align-items:center;">
            <span style="background:${typeColors[e.type]||"#6B7A99"}18;color:${typeColors[e.type]||"#6B7A99"};font-size:.68rem;font-weight:700;padding:3px 8px;border-radius:20px;text-transform:capitalize;">${e.type}</span>
            <button onclick="if(confirm('Remove this event?')){appToast('Event removed','info');this.closest('[style]').remove()}" style="padding:4px;background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:.8rem;" title="Remove">✕</button>
          </div>
        </div>`).join("")}
    </div>`).join("");
}

/* ════════════════════════════════════════════════════════
   RESOURCES
════════════════════════════════════════════════════════ */
async function loadResources(user) {
  const resources = await getResources();
  if (!resources) return;

  _setText("totalResourcesVal",   resources.length);
  _setText("totalDownloadsVal",   resources.reduce((s,r)=>s+r.downloads,0));

  const list = document.getElementById("resourcesList") || document.getElementById("resourceGrid");
  if (!list) return;

  const typeIcons = { pdf:"📄", zip:"📦", docx:"📝", xlsx:"📊", mp4:"🎥", pptx:"📊" };
  const typeColors = { pdf:"#EF4444", zip:"#F59E0B", docx:"#1E56C8", xlsx:"#10B981", mp4:"#6366F1", pptx:"#EC4899" };

  list.innerHTML = resources.map(r => `
    <div style="background:var(--card);border-radius:12px;border:1px solid var(--border);padding:16px;display:flex;align-items:center;gap:12px;transition:transform .2s;cursor:pointer;" onmouseenter="this.style.transform='translateY(-1px)'" onmouseleave="this.style.transform=''">
      <div style="width:44px;height:44px;border-radius:10px;background:${typeColors[r.type]||"#6B7A99"}18;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;">${typeIcons[r.type]||"📎"}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:.85rem;font-weight:600;color:var(--navy);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.name}</div>
        <div style="font-size:.73rem;color:var(--text-muted);margin-top:2px;">${r.course} · ${r.size} · ${r.downloads} downloads · ${fmtDate(r.date)}</div>
      </div>
      <div style="display:flex;gap:6px;">
        <button onclick="appToast('Downloading ${r.name.replace(/'/g,"\\'")}...')" style="padding:6px 12px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:.78rem;font-weight:600;cursor:pointer;font-family:inherit;">Download</button>
        <button onclick="if(confirm('Delete this resource?')){appToast('Resource deleted','error');this.closest('[style]').remove()}" style="padding:6px 10px;background:#FEF2F2;border:1px solid #FECACA;color:#EF4444;border-radius:8px;font-size:.78rem;cursor:pointer;font-family:inherit;">✕</button>
      </div>
    </div>`).join("");
}

/* ════════════════════════════════════════════════════════
   REPORTS
════════════════════════════════════════════════════════ */
async function loadReports(user) {
  const data = await getReports();
  if (!data) return;
  const ov = data.overview;

  _setText("rTotalStudents",   ov?.totalStudents  ?? "—");
  _setText("rAvgGrade",        (ov?.avgGrade      ?? "—") + "%");
  _setText("rAvgAttendance",   (ov?.avgAttendance ?? "—") + "%");
  _setText("rCompletionRate",  (ov?.completionRate?? "—") + "%");
  _setText("rPassRate",        (ov?.passRate      ?? "—") + "%");
  _setText("rAtRisk",          ov?.atRisk         ?? "—");

  // Grade distribution
  const distEl = document.getElementById("gradeDistribution");
  if (distEl && data.gradeDistribution) {
    distEl.innerHTML = data.gradeDistribution.map(g => `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <div style="width:80px;font-size:.78rem;color:var(--text-muted);flex-shrink:0;">${g.label}</div>
        <div style="flex:1;height:14px;background:var(--border);border-radius:8px;overflow:hidden;">
          <div style="height:100%;width:${g.pct}%;background:var(--accent);border-radius:8px;transition:width .6s;"></div>
        </div>
        <div style="width:36px;text-align:right;font-size:.78rem;font-weight:600;color:var(--navy);">${g.count}</div>
      </div>`).join("");
  }

  // Top students
  const topEl = document.getElementById("topStudents");
  if (topEl && data.topStudents) {
    topEl.innerHTML = data.topStudents.map((s,i) => `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);">
        <div style="width:24px;height:24px;border-radius:50%;background:${["#F59E0B","#6B7A99","#CD7F32","var(--accent)"][i]||"var(--accent)"};display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#fff;flex-shrink:0;">${i+1}</div>
        <div style="flex:1;"><div style="font-size:.84rem;font-weight:600;color:var(--navy);">${s.name}</div><div style="font-size:.73rem;color:var(--text-muted);">${s.course}</div></div>
        <div style="text-align:right;"><div style="font-size:.84rem;font-weight:700;color:var(--navy);">${s.grade}%</div><div style="font-size:.72rem;color:var(--text-muted);">${s.attendance}% att.</div></div>
      </div>`).join("");
  }

  // Class performance
  const perfEl = document.getElementById("classPerformance");
  if (perfEl && data.classPerformance) {
    perfEl.innerHTML = data.classPerformance.map(c => `
      <div style="padding:12px 0;border-bottom:1px solid var(--border);">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="font-size:.84rem;font-weight:600;color:var(--navy);">${c.name}</span>
          <span style="font-size:.84rem;font-weight:700;color:var(--accent);">${c.avg}%</span>
        </div>
        <div style="display:flex;gap:16px;font-size:.73rem;color:var(--text-muted);margin-bottom:6px;">
          <span>👥 ${c.students} students</span><span>📅 ${c.attendance}% attendance</span>
        </div>
        <div style="height:5px;background:var(--border);border-radius:4px;overflow:hidden;">
          <div style="height:100%;width:${c.avg}%;background:${c.avg>=80?"#10B981":c.avg>=65?"#1E56C8":"#F59E0B"};border-radius:4px;"></div>
        </div>
      </div>`).join("");
  }
}

/* ════════════════════════════════════════════════════════
   SETTINGS
════════════════════════════════════════════════════════ */
async function loadSettings(user) {
  if (!user) return;

  // Populate profile fields
  _setVal("settingFirstName",   user.firstName);
  _setVal("settingLastName",    user.lastName);
  _setVal("settingEmail",       user.email);
  _setVal("settingPhone",       user.phone);
  _setVal("settingTitle",       user.title);
  _setVal("settingDepartment",  user.department);
  _setVal("settingInstitution", user.institution);
  _setVal("settingBio",         user.bio);
  _setVal("settingCountry",     user.country);
  _setVal("settingUsername",    user.username);

  // Avatar
  const av = document.getElementById("settingsAvatar");
  if (av) { av.textContent = user.avatarInitials || "?"; }

  // Load saved settings
  const s = await getSettings();
  if (!s) return;

  // Apply to UI controls
  _setChecked("themeToggle",        s.theme === "dark");
  _setChecked("compactToggle",      s.compactMode);
  _setChecked("emailNotifsToggle",  s.emailNotifs);
  _setChecked("pushNotifsToggle",   s.pushNotifs);
  _setChecked("weeklyReportToggle", s.weeklyReport);
  _setChecked("submissionToggle",   s.submissionAlerts);
  _setChecked("messageToggle",      s.messageAlerts);
  _setVal("fontSizeSelect",         s.fontSize);
  _setVal("timezoneSelect",         s.timezone);
  _setVal("languageSelect",         s.language);

  // Wire save buttons
  document.querySelectorAll(".btn-save-settings, [data-save-settings]").forEach(btn => {
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.textContent = "Saving…";

      const newSettings = {
        theme:           _getChecked("themeToggle")        ? "dark" : "light",
        compactMode:     _getChecked("compactToggle"),
        emailNotifs:     _getChecked("emailNotifsToggle"),
        pushNotifs:      _getChecked("pushNotifsToggle"),
        weeklyReport:    _getChecked("weeklyReportToggle"),
        submissionAlerts:_getChecked("submissionToggle"),
        messageAlerts:   _getChecked("messageToggle"),
        fontSize:        _getVal("fontSizeSelect")    || s.fontSize,
        timezone:        _getVal("timezoneSelect")    || s.timezone,
        language:        _getVal("languageSelect")    || s.language,
        accentColor:     s.accentColor,
        sidebarColor:    s.sidebarColor,
      };

      await saveSettings(newSettings);
      localStorage.setItem("edunova_settings", JSON.stringify(newSettings));

      // Apply immediately
      if (newSettings.theme === "dark") document.documentElement.setAttribute("data-theme","dark");
      else document.documentElement.removeAttribute("data-theme");
      if (newSettings.compactMode) document.body.classList.add("compact-mode");
      else document.body.classList.remove("compact-mode");

      btn.disabled = false;
      btn.textContent = "Save Changes";
      appToast("Settings saved!", "success");
    });
  });

  // Wire profile save
  const profileSaveBtn = document.getElementById("saveProfileBtn") || document.querySelector("[data-save-profile]");
  if (profileSaveBtn) {
    profileSaveBtn.addEventListener("click", async () => {
      profileSaveBtn.disabled = true;
      profileSaveBtn.textContent = "Saving…";
      const fields = {
        firstName:   _getVal("settingFirstName"),
        lastName:    _getVal("settingLastName"),
        phone:       _getVal("settingPhone"),
        department:  _getVal("settingDepartment"),
        institution: _getVal("settingInstitution"),
        bio:         _getVal("settingBio"),
        country:     _getVal("settingCountry"),
        title:       _getVal("settingTitle"),
      };
      const result = await updateProfile(fields);
      if (result?.ok !== false) {
        const updated = { ...user, ...fields };
        localStorage.setItem("edunova_user", JSON.stringify(updated));
        appToast("Profile updated!", "success");
      } else {
        appBanner("Failed to save profile. Please try again.", "error");
      }
      profileSaveBtn.disabled = false;
      profileSaveBtn.textContent = "Save Profile";
    });
  }

  // Wire logout button
  document.querySelectorAll("[data-logout], .btn-logout, #logoutBtn").forEach(btn => {
    btn.addEventListener("click", () => { if (confirm("Sign out of EduNova?")) logout(); });
  });

  // Wire accent colour pickers
  document.querySelectorAll(".color-swatch, [data-accent]").forEach(el => {
    el.addEventListener("click", () => {
      const color = el.dataset.accent || el.style.background;
      if (color) {
        document.documentElement.style.setProperty("--accent", color);
        const curr = JSON.parse(localStorage.getItem("edunova_settings") || "{}");
        curr.accentColor = color;
        localStorage.setItem("edunova_settings", JSON.stringify(curr));
        appToast("Accent colour updated!", "success");
      }
    });
  });
}

/* ── HELPERS ──────────────────────────────────────────────── */
function _setText(id, val) { const el=document.getElementById(id); if(el) el.textContent = val ?? "—"; }
function _setVal(id, val)  { const el=document.getElementById(id); if(el && val!==undefined && val!==null) el.value = val; }
function _setChecked(id, v){ const el=document.getElementById(id); if(el) el.checked = !!v; }
function _getVal(id)       { const el=document.getElementById(id); return el ? el.value : ""; }
function _getChecked(id)   { const el=document.getElementById(id); return el ? el.checked : false; }