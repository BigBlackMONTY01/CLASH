import { useState, useRef } from "react";

const darkTheme = {
  bg: "#0D0D0D",
  surface: "#161616",
  card: "#1E1E1E",
  border: "#2A2A2A",
  accent: "#C8F45A",
  text: "#F0F0F0",
  muted: "#6B6B6B",
  lecturer: "#5AF4C8",
  student: "#C8F45A",
  tag: "#252525",
  inputBg: "#1A1A1A",
  isDark: true,
};

const lightTheme = {
  bg: "#FFFFFF",
  surface: "#F4F4F4",
  card: "#FFFFFF",
  border: "#E4E4E4",
  accent: "#4D8B00",
  text: "#111111",
  muted: "#888888",
  lecturer: "#007B64",
  student: "#4D8B00",
  tag: "#F0F0F0",
  inputBg: "#F8F8F8",
  isDark: false,
};

type Theme = typeof darkTheme;

const S = {
  onboarding: "onboarding",
  lecturerHome: "lecturerHome",
  lecturerSchemes: "lecturerSchemes",
  schemeBreakdown: "schemeBreakdown",
  weekDetail: "weekDetail",
  createScheme: "createScheme",
  uploadSyllabus: "uploadSyllabus",
  lecturerSettings: "lecturerSettings",
  studentHome: "studentHome",
  studentLectures: "studentLectures",
  courseDetail: "courseDetail",
  studyNotes: "studyNotes",
  generateNotes: "generateNotes",
  flashcardPractice: "flashcardPractice",
  studentSettings: "studentSettings",
};

type Nav = (screen: string, dir?: "forward" | "back") => void;

function Tag({ children, color, t }: { children: React.ReactNode; color?: string; t: Theme }) {
  return (
    <span style={{ background: color ? `${color}22` : t.tag, color: color || t.muted, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {children}
    </span>
  );
}

function BackButton({ to, nav, t }: { to: string; nav: Nav; t: Theme }) {
  return (
    <button onClick={() => nav(to, "back")} style={{ background: "none", border: "none", color: t.muted, fontSize: 22, cursor: "pointer", padding: "4px 0", display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>
      <span>←</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>Back</span>
    </button>
  );
}

function StatusBar({ t, isDark, setIsDark }: { t: Theme; isDark: boolean; setIsDark: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px 8px", fontSize: 12, color: t.muted, flexShrink: 0 }}>
      <span style={{ fontWeight: 600 }}>9:41</span>
      <button onClick={() => setIsDark(!isDark)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: "2px 6px", borderRadius: 8, color: t.muted }}>
        {isDark ? "☀" : "🌙"}
      </button>
    </div>
  );
}

function NavBar({ role, screen, nav, t }: { role: "lecturer" | "student"; screen: string; nav: Nav; t: Theme }) {
  const color = role === "lecturer" ? t.lecturer : t.student;
  const items = role === "lecturer"
    ? [{ icon: "⊞", label: "Home", targets: [S.lecturerHome], go: S.lecturerHome }, { icon: "☰", label: "Schemes", targets: [S.lecturerSchemes, S.schemeBreakdown, S.weekDetail, S.createScheme, S.uploadSyllabus], go: S.lecturerSchemes }, { icon: "⚙", label: "Settings", targets: [S.lecturerSettings], go: S.lecturerSettings }]
    : [{ icon: "⊞", label: "Home", targets: [S.studentHome], go: S.studentHome }, { icon: "☰", label: "Lectures", targets: [S.studentLectures, S.studyNotes, S.generateNotes, S.courseDetail, S.flashcardPractice], go: S.studentLectures }, { icon: "⚙", label: "Settings", targets: [S.studentSettings], go: S.studentSettings }];
  return (
    <div style={{ flexShrink: 0, background: t.surface, borderTop: `1px solid ${t.border}`, display: "flex", justifyContent: "space-around", padding: "12px 0 28px" }}>
      {items.map((item, i) => {
        const isActive = item.targets.includes(screen);
        return (
          <div key={i} onClick={() => nav(item.go)} style={{ textAlign: "center", cursor: "pointer", flex: 1 }}>
            <div style={{ fontSize: 20 }}>{item.icon}</div>
            <div style={{ fontSize: 10, marginTop: 4, color: isActive ? color : t.muted, fontWeight: isActive ? 700 : 400 }}>{item.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 20px" }}>{children}</div>;
}

function OnboardingScreen({ nav, t }: { nav: Nav; t: Theme }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px 32px 40px" }}>
      <div>
        <div style={{ width: 56, height: 56, background: t.accent, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 48 }}>✦</div>
        <div style={{ color: t.muted, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Welcome to</div>
        <div style={{ fontSize: 42, fontWeight: 800, color: t.text, lineHeight: 1.1 }}>LectureFlow</div>
        <div style={{ fontSize: 42, fontWeight: 800, color: t.accent, lineHeight: 1.1 }}>Studio</div>
        <p style={{ color: t.muted, fontSize: 15, lineHeight: 1.6, marginTop: 16 }}>Lecturers break down schemes. Students build smarter notes. One platform, two superpowers.</p>
      </div>
      <div>
        <div style={{ color: t.muted, fontSize: 12, fontWeight: 600, marginBottom: 16, textAlign: "center", letterSpacing: "0.06em", textTransform: "uppercase" }}>I am a...</div>
        <div onClick={() => nav(S.lecturerHome)} style={{ background: `${t.lecturer}18`, border: `1.5px solid ${t.lecturer}40`, borderRadius: 16, padding: "20px 22px", marginBottom: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 32 }}>👨‍🏫</div>
          <div><div style={{ color: t.lecturer, fontWeight: 700 }}>Lecturer</div><div style={{ color: t.muted, fontSize: 13 }}>Upload & structure course content</div></div>
          <div style={{ marginLeft: "auto", color: t.lecturer }}>→</div>
        </div>
        <div onClick={() => nav(S.studentHome)} style={{ background: `${t.student}18`, border: `1.5px solid ${t.student}40`, borderRadius: 16, padding: "20px 22px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 32 }}>🎓</div>
          <div><div style={{ color: t.student, fontWeight: 700 }}>Student</div><div style={{ color: t.muted, fontSize: 13 }}>Turn lectures into study notes</div></div>
          <div style={{ marginLeft: "auto", color: t.student }}>→</div>
        </div>
      </div>
    </div>
  );
}

function LecturerHomeScreen({ nav, screen, t }: { nav: Nav; screen: string; t: Theme }) {
  return (
    <>
      <Screen>
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: t.muted, fontSize: 13 }}>Good morning,</div>
          <div style={{ color: t.text, fontSize: 22, fontWeight: 800 }}>Dr. Adeyemi</div>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          {[{ label: "Schemes", val: "3" }, { label: "Students", val: "128" }, { label: "Topics", val: "24" }].map((s, i) => (
            <div key={i} style={{ flex: 1, background: t.card, borderRadius: 14, padding: "14px 10px", textAlign: "center", border: `1px solid ${t.border}` }}>
              <div style={{ color: t.lecturer, fontWeight: 800, fontSize: 22 }}>{s.val}</div>
              <div style={{ color: t.muted, fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div onClick={() => nav(S.createScheme)} style={{ background: `${t.lecturer}15`, border: `1.5px dashed ${t.lecturer}60`, borderRadius: 14, padding: "14px 18px", marginBottom: 20, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 22, color: t.lecturer }}>＋</div>
          <div><div style={{ color: t.lecturer, fontWeight: 700, fontSize: 13 }}>Create New Scheme</div><div style={{ color: t.muted, fontSize: 12 }}>Start a new course curriculum</div></div>
        </div>
        <div style={{ color: t.text, fontWeight: 700, fontSize: 16, marginBottom: 14 }}>My Schemes</div>
        {[{ title: "Data Structures & Algorithms", weeks: 12, progress: 75, tag: "CSC 301" }, { title: "Operating Systems", weeks: 10, progress: 40, tag: "CSC 401" }, { title: "Software Engineering", weeks: 14, progress: 20, tag: "CSC 302" }].map((s, i) => (
          <div key={i} onClick={() => nav(S.schemeBreakdown)} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: 18, marginBottom: 12, cursor: "pointer" }}>
            <div style={{ color: t.text, fontWeight: 700, fontSize: 14 }}>{s.title}</div>
            <div style={{ color: t.muted, fontSize: 12, marginTop: 4 }}>{s.weeks} weeks</div>
            <div style={{ marginTop: 10 }}><Tag color={t.lecturer} t={t}>{s.tag}</Tag></div>
            <div style={{ background: t.border, borderRadius: 100, height: 4, marginTop: 14 }}><div style={{ background: t.lecturer, width: `${s.progress}%`, height: "100%", borderRadius: 100 }} /></div>
          </div>
        ))}
      </Screen>
      <NavBar role="lecturer" screen={screen} nav={nav} t={t} />
    </>
  );
}

function LecturerSchemesScreen({ nav, screen, t }: { nav: Nav; screen: string; t: Theme }) {
  return (
    <>
      <Screen>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ color: t.text, fontWeight: 800, fontSize: 20 }}>All Schemes</div>
          <div onClick={() => nav(S.createScheme)} style={{ background: t.lecturer, color: t.bg, borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ New</div>
        </div>
        {[{ title: "Data Structures & Algorithms", weeks: 12, progress: 75, tag: "CSC 301", students: 54 }, { title: "Operating Systems", weeks: 10, progress: 40, tag: "CSC 401", students: 38 }, { title: "Software Engineering", weeks: 14, progress: 20, tag: "CSC 302", students: 36 }, { title: "Computer Networks", weeks: 13, progress: 60, tag: "CSC 403", students: 42 }, { title: "Database Management", weeks: 11, progress: 90, tag: "CSC 305", students: 61 }].map((s, i) => (
          <div key={i} onClick={() => nav(S.schemeBreakdown)} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: 18, marginBottom: 12, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div><div style={{ color: t.text, fontWeight: 700, fontSize: 14 }}>{s.title}</div><div style={{ color: t.muted, fontSize: 12, marginTop: 3 }}>{s.weeks} weeks · {s.students} students</div></div>
              <Tag color={t.lecturer} t={t}>{s.tag}</Tag>
            </div>
            <div style={{ background: t.border, borderRadius: 100, height: 4, marginTop: 14 }}><div style={{ background: t.lecturer, width: `${s.progress}%`, height: "100%", borderRadius: 100 }} /></div>
            <div style={{ color: t.muted, fontSize: 11, marginTop: 6 }}>{s.progress}% complete</div>
          </div>
        ))}
      </Screen>
      <NavBar role="lecturer" screen={screen} nav={nav} t={t} />
    </>
  );
}

function SchemeBreakdownScreen({ nav, screen, t }: { nav: Nav; screen: string; t: Theme }) {
  const topics = [
    { week: "Week 1–2", title: "Introduction to Arrays & Linked Lists", done: true },
    { week: "Week 3–4", title: "Stacks & Queues", done: true },
    { week: "Week 5–6", title: "Trees & Binary Search Trees", done: false },
    { week: "Week 7–8", title: "Graph Algorithms", done: false },
    { week: "Week 9–10", title: "Dynamic Programming", done: false },
    { week: "Week 11–12", title: "Sorting & Searching", done: false },
  ];
  return (
    <>
      <Screen>
        <BackButton to={S.lecturerSchemes} nav={nav} t={t} />
        <Tag color={t.lecturer} t={t}>CSC 301</Tag>
        <div style={{ color: t.text, fontSize: 22, fontWeight: 800, marginTop: 10 }}>Data Structures & Algorithms</div>
        <div style={{ color: t.muted, fontSize: 13, marginBottom: 20 }}>12 weeks · 8 topics</div>
        <div onClick={() => nav(S.uploadSyllabus)} style={{ background: `${t.lecturer}15`, border: `1.5px dashed ${t.lecturer}60`, borderRadius: 14, padding: "16px 18px", marginBottom: 20, cursor: "pointer" }}>
          <div style={{ color: t.lecturer, fontWeight: 700 }}>✦ AI Scheme Breakdown</div>
          <div style={{ color: t.muted, fontSize: 12 }}>Upload syllabus PDF to auto-generate topics</div>
        </div>
        {topics.map((topic, i) => (
          <div key={i} onClick={() => nav(S.weekDetail)} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16, marginBottom: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: topic.done ? `${t.lecturer}22` : t.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, color: topic.done ? t.lecturer : t.muted }}>{topic.done ? "✓" : "○"}</div>
            <div><div style={{ color: t.muted, fontSize: 11 }}>{topic.week}</div><div style={{ color: t.text, fontWeight: 700, fontSize: 14, marginTop: 3 }}>{topic.title}</div></div>
            <div style={{ marginLeft: "auto", color: t.muted }}>›</div>
          </div>
        ))}
      </Screen>
      <NavBar role="lecturer" screen={screen} nav={nav} t={t} />
    </>
  );
}

function WeekDetailScreen({ nav, screen, t }: { nav: Nav; screen: string; t: Theme }) {
  return (
    <>
      <Screen>
        <BackButton to={S.schemeBreakdown} nav={nav} t={t} />
        <Tag color={t.lecturer} t={t}>Week 3–4</Tag>
        <div style={{ color: t.text, fontSize: 20, fontWeight: 800, marginTop: 10 }}>Stacks & Queues</div>
        <div style={{ color: t.muted, fontSize: 13, marginBottom: 24 }}>CSC 301 · Dr. Adeyemi</div>
        {[{ label: "Learning Objectives", items: ["Understand LIFO and FIFO principles", "Implement Stack using arrays & linked lists", "Implement Queue using arrays & linked lists", "Apply stacks in expression evaluation"] }, { label: "Resources", items: ["Lecture Slides (PDF)", "Video: Stack Implementation in C++", "Textbook: Chapter 5 (pp. 120–148)", "Practice Problems (12 exercises)"] }].map((section, si) => (
          <div key={si} style={{ marginBottom: 24 }}>
            <div style={{ color: t.text, fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{section.label}</div>
            {section.items.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.lecturer, marginTop: 6, flexShrink: 0 }} />
                <div style={{ color: t.text, fontSize: 13, lineHeight: 1.5 }}>{item}</div>
              </div>
            ))}
          </div>
        ))}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16 }}>
          <div style={{ color: t.muted, fontSize: 11, marginBottom: 8 }}>ASSESSMENT</div>
          <div style={{ color: t.text, fontWeight: 700 }}>Week 4 Quiz</div>
          <div style={{ color: t.muted, fontSize: 12, marginTop: 4 }}>10 MCQs · 20 minutes · 5% of grade</div>
          <div style={{ marginTop: 12, background: t.lecturer, color: t.bg, borderRadius: 10, padding: "10px 16px", textAlign: "center", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>View Quiz</div>
        </div>
      </Screen>
      <NavBar role="lecturer" screen={screen} nav={nav} t={t} />
    </>
  );
}

function CreateSchemeScreen({ nav, screen, t }: { nav: Nav; screen: string; t: Theme }) {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [weeks, setWeeks] = useState("12");
  const input: React.CSSProperties = { width: "100%", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: "13px 16px", color: t.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" };
  return (
    <>
      <Screen>
        <BackButton to={S.lecturerSchemes} nav={nav} t={t} />
        <div style={{ color: t.text, fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Create New Scheme</div>
        {[{ label: "Course Title", val: title, set: setTitle, ph: "e.g. Introduction to Computer Science" }, { label: "Course Code", val: code, set: setCode, ph: "e.g. CSC 101" }, { label: "Number of Weeks", val: weeks, set: setWeeks, ph: "12" }].map((f, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ color: t.muted, fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</div>
            <input value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.ph} style={input} />
          </div>
        ))}
        <div style={{ marginBottom: 18 }}>
          <div style={{ color: t.muted, fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Department</div>
          <select style={{ ...input, appearance: "none" }}>
            <option>Computer Science</option><option>Mathematics</option><option>Physics</option><option>Engineering</option>
          </select>
        </div>
        <div onClick={() => nav(S.uploadSyllabus)} style={{ background: `${t.lecturer}15`, border: `1.5px dashed ${t.lecturer}60`, borderRadius: 14, padding: "16px 18px", marginBottom: 24, cursor: "pointer", textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>📄</div>
          <div style={{ color: t.lecturer, fontWeight: 700 }}>Upload Syllabus (optional)</div>
          <div style={{ color: t.muted, fontSize: 12 }}>AI will auto-generate topics from PDF</div>
        </div>
        <div onClick={() => nav(S.schemeBreakdown)} style={{ background: t.lecturer, color: t.bg, borderRadius: 14, padding: 16, textAlign: "center", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Create Scheme</div>
      </Screen>
      <NavBar role="lecturer" screen={screen} nav={nav} t={t} />
    </>
  );
}

function UploadSyllabusScreen({ nav, screen, t }: { nav: Nav; screen: string; t: Theme }) {
  const [uploaded, setUploaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const handleUpload = () => { setUploaded(true); setProcessing(true); setTimeout(() => setProcessing(false), 1500); };
  return (
    <>
      <Screen>
        <BackButton to={S.schemeBreakdown} nav={nav} t={t} />
        <div style={{ color: t.text, fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Upload Syllabus</div>
        <div style={{ color: t.muted, fontSize: 13, marginBottom: 24 }}>AI will extract and structure your topics automatically</div>
        <div onClick={handleUpload} style={{ background: t.card, border: `2px dashed ${uploaded ? t.lecturer : t.border}`, borderRadius: 16, padding: "40px 20px", textAlign: "center", marginBottom: 20, cursor: "pointer" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{uploaded ? "📄" : "☁"}</div>
          <div style={{ color: uploaded ? t.lecturer : t.text, fontWeight: 700, fontSize: 15 }}>{uploaded ? "syllabus_csc301.pdf" : "Tap to upload PDF"}</div>
          <div style={{ color: t.muted, fontSize: 12, marginTop: 6 }}>{uploaded ? "2.4 MB · Uploaded" : "Supports PDF, DOCX up to 10MB"}</div>
        </div>
        {uploaded && (
          <div style={{ background: `${t.lecturer}15`, border: `1px solid ${t.lecturer}40`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
            <div style={{ color: t.lecturer, fontWeight: 700, marginBottom: 10 }}>{processing ? "⟳ Processing syllabus..." : "✓ AI Analysis Complete"}</div>
            {!processing && ["Introduction to Arrays (Week 1)", "Linked Lists (Week 2)", "Stacks & Queues (Week 3–4)", "Trees (Week 5–6)", "Graph Algorithms (Week 7–8)"].map((item, i, arr) => (
              <div key={i} style={{ color: t.text, fontSize: 13, padding: "6px 0", borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : "none" }}>✦ {item}</div>
            ))}
          </div>
        )}
        {uploaded && !processing && (
          <div onClick={() => nav(S.schemeBreakdown, "back")} style={{ background: t.lecturer, color: t.bg, borderRadius: 14, padding: 16, textAlign: "center", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Apply to Scheme</div>
        )}
      </Screen>
      <NavBar role="lecturer" screen={screen} nav={nav} t={t} />
    </>
  );
}

function LecturerSettingsScreen({ nav, screen, t }: { nav: Nav; screen: string; t: Theme }) {
  return (
    <>
      <Screen>
        <div style={{ textAlign: "center", marginBottom: 28, paddingTop: 8 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${t.lecturer}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 12px" }}>👨‍🏫</div>
          <div style={{ color: t.text, fontWeight: 800, fontSize: 18 }}>Dr. Adeyemi</div>
          <div style={{ color: t.muted, fontSize: 13 }}>adeyemi@university.edu</div>
          <div style={{ marginTop: 8 }}><Tag color={t.lecturer} t={t}>Senior Lecturer</Tag></div>
        </div>
        {[{ section: "Account", items: [{ icon: "👤", label: "Edit Profile" }, { icon: "🔒", label: "Change Password" }, { icon: "📧", label: "Email Notifications" }] }, { section: "Preferences", items: [{ icon: "🌐", label: "Language" }, { icon: "🎨", label: "Theme" }, { icon: "♿", label: "Accessibility" }] }, { section: "About", items: [{ icon: "📋", label: "Terms of Service" }, { icon: "🔏", label: "Privacy Policy" }, { icon: "ℹ", label: "App Version 2.1.0" }] }].map((group, gi) => (
          <div key={gi} style={{ marginBottom: 24 }}>
            <div style={{ color: t.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{group.section}</div>
            <div style={{ background: t.card, borderRadius: 14, overflow: "hidden", border: `1px solid ${t.border}` }}>
              {group.items.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: i < group.items.length - 1 ? `1px solid ${t.border}` : "none", cursor: "pointer" }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ color: t.text, fontSize: 14, flex: 1 }}>{item.label}</span>
                  <span style={{ color: t.muted }}>›</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div onClick={() => nav(S.onboarding, "back")} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16, textAlign: "center", color: "#EF4444", fontWeight: 700, cursor: "pointer" }}>Sign Out</div>
      </Screen>
      <NavBar role="lecturer" screen={screen} nav={nav} t={t} />
    </>
  );
}

function StudentHomeScreen({ nav, screen, t }: { nav: Nav; screen: string; t: Theme }) {
  const lectures = [{ course: "CSC 301", title: "Stacks & Queues Deep Dive", lecturer: "Dr. Adeyemi", hasNotes: false }, { course: "MTH 201", title: "Differential Equations Intro", lecturer: "Prof. Okafor", hasNotes: true }, { course: "CSC 302", title: "Software Development Lifecycle", lecturer: "Dr. Ibrahim", hasNotes: true }];
  return (
    <>
      <Screen>
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: t.muted, fontSize: 13 }}>Good morning,</div>
          <div style={{ color: t.text, fontSize: 22, fontWeight: 800 }}>Tolu</div>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          {[{ label: "Courses", val: "5" }, { label: "Notes", val: "14" }, { label: "Streak", val: "7d" }].map((s, i) => (
            <div key={i} style={{ flex: 1, background: t.card, borderRadius: 14, padding: "14px 10px", textAlign: "center", border: `1px solid ${t.border}` }}>
              <div style={{ color: t.student, fontWeight: 800, fontSize: i === 2 ? 16 : 22 }}>{s.val}</div>
              <div style={{ color: t.muted, fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div onClick={() => nav(S.generateNotes)} style={{ background: `linear-gradient(135deg, ${t.student}20, ${t.student}08)`, border: `1.5px dashed ${t.student}60`, borderRadius: 16, padding: "18px 20px", marginBottom: 24, cursor: "pointer" }}>
          <div style={{ color: t.student, fontWeight: 700 }}>✦ Generate Study Notes</div>
          <div style={{ color: t.muted, fontSize: 12 }}>Upload lecture notes or paste text</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ color: t.text, fontWeight: 700, fontSize: 15 }}>Recent Lectures</div>
          <div onClick={() => nav(S.studentLectures)} style={{ color: t.student, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>See all</div>
        </div>
        {lectures.map((l, i) => (
          <div key={i} onClick={() => nav(S.studyNotes)} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16, marginBottom: 10, cursor: "pointer" }}>
            <Tag color={t.student} t={t}>{l.course}</Tag>
            <div style={{ color: t.text, fontWeight: 600, fontSize: 13, marginTop: 8 }}>{l.title}</div>
            <div style={{ color: t.muted, fontSize: 11 }}>{l.lecturer}</div>
            <div style={{ color: l.hasNotes ? t.student : t.muted, fontSize: 12, fontWeight: 600, marginTop: 8 }}>{l.hasNotes ? "Notes ✓" : "No notes"}</div>
          </div>
        ))}
      </Screen>
      <NavBar role="student" screen={screen} nav={nav} t={t} />
    </>
  );
}

function StudentLecturesScreen({ nav, screen, t }: { nav: Nav; screen: string; t: Theme }) {
  const [filter, setFilter] = useState("all");
  const lectures = [{ course: "CSC 301", title: "Stacks & Queues Deep Dive", lecturer: "Dr. Adeyemi", hasNotes: false, date: "Today" }, { course: "MTH 201", title: "Differential Equations Intro", lecturer: "Prof. Okafor", hasNotes: true, date: "Yesterday" }, { course: "CSC 302", title: "Software Development Lifecycle", lecturer: "Dr. Ibrahim", hasNotes: true, date: "Mon" }, { course: "CSC 301", title: "Introduction to Arrays", lecturer: "Dr. Adeyemi", hasNotes: true, date: "Fri" }, { course: "PHY 201", title: "Electromagnetism Basics", lecturer: "Dr. Chukwu", hasNotes: false, date: "Thu" }, { course: "CSC 403", title: "Network Protocols Overview", lecturer: "Dr. Yusuf", hasNotes: true, date: "Wed" }];
  const filtered = filter === "all" ? lectures : lectures.filter((l) => filter === "notes" ? l.hasNotes : !l.hasNotes);
  return (
    <>
      <Screen>
        <div style={{ color: t.text, fontWeight: 800, fontSize: 20, marginBottom: 20 }}>All Lectures</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[["all", "All"], ["notes", "With Notes"], ["nonotes", "No Notes"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{ background: filter === val ? t.student : t.card, color: filter === val ? t.bg : t.muted, border: `1px solid ${filter === val ? t.student : t.border}`, borderRadius: 100, padding: "7px 14px", fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{label}</button>
          ))}
        </div>
        {filtered.map((l, i) => (
          <div key={i} onClick={() => nav(S.studyNotes)} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16, marginBottom: 10, cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}><Tag color={t.student} t={t}>{l.course}</Tag><span style={{ color: t.muted, fontSize: 11 }}>{l.date}</span></div>
              <div style={{ color: t.text, fontWeight: 600, fontSize: 13 }}>{l.title}</div>
              <div style={{ color: t.muted, fontSize: 11, marginTop: 2 }}>{l.lecturer}</div>
            </div>
            <div style={{ color: l.hasNotes ? t.student : t.muted, fontSize: 18 }}>{l.hasNotes ? "✓" : "○"}</div>
          </div>
        ))}
      </Screen>
      <NavBar role="student" screen={screen} nav={nav} t={t} />
    </>
  );
}

function CourseDetailScreen({ nav, screen, t }: { nav: Nav; screen: string; t: Theme }) {
  const topics = [{ title: "Introduction to Arrays", done: true, notes: true }, { title: "Linked Lists", done: true, notes: true }, { title: "Stacks & Queues", done: true, notes: false }, { title: "Trees & BSTs", done: false, notes: false }, { title: "Graph Algorithms", done: false, notes: false }];
  return (
    <>
      <Screen>
        <BackButton to={S.studentLectures} nav={nav} t={t} />
        <Tag color={t.student} t={t}>CSC 301</Tag>
        <div style={{ color: t.text, fontSize: 20, fontWeight: 800, marginTop: 10 }}>Data Structures & Algorithms</div>
        <div style={{ color: t.muted, fontSize: 13, marginTop: 4, marginBottom: 20 }}>Dr. Adeyemi · 12 weeks</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {[{ label: "Topics", val: "12" }, { label: "Notes", val: "8" }, { label: "Flashcards", val: "24" }].map((s, i) => (
            <div key={i} style={{ flex: 1, background: t.card, borderRadius: 12, padding: "12px 8px", textAlign: "center", border: `1px solid ${t.border}` }}>
              <div style={{ color: t.student, fontWeight: 800, fontSize: 18 }}>{s.val}</div>
              <div style={{ color: t.muted, fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ color: t.text, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Topics</div>
        {topics.map((topic, i) => (
          <div key={i} onClick={() => nav(S.studyNotes)} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: 14, marginBottom: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: topic.done ? `${t.student}22` : t.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, color: topic.done ? t.student : t.muted }}>{topic.done ? "✓" : "○"}</div>
            <div style={{ flex: 1 }}><div style={{ color: t.text, fontWeight: 600, fontSize: 13 }}>{topic.title}</div><div style={{ color: topic.notes ? t.student : t.muted, fontSize: 11, marginTop: 2 }}>{topic.notes ? "Notes ready" : "No notes yet"}</div></div>
            <div style={{ color: t.muted }}>›</div>
          </div>
        ))}
      </Screen>
      <NavBar role="student" screen={screen} nav={nav} t={t} />
    </>
  );
}

function StudyNotesScreen({ nav, screen, t }: { nav: Nav; screen: string; t: Theme }) {
  const [tab, setTab] = useState("summary");
  return (
    <>
      <Screen>
        <BackButton to={S.studentLectures} nav={nav} t={t} />
        <Tag color={t.student} t={t}>CSC 301</Tag>
        <div style={{ color: t.text, fontSize: 20, fontWeight: 800, marginTop: 10 }}>Stacks & Queues Deep Dive</div>
        <div style={{ color: t.muted, fontSize: 12, marginTop: 4 }}>Dr. Adeyemi</div>
        <div style={{ background: `${t.student}15`, border: `1px solid ${t.student}40`, borderRadius: 10, padding: "10px 14px", marginTop: 20, marginBottom: 20 }}>
          <div style={{ color: t.student, fontSize: 13, fontWeight: 600 }}>✦ AI notes generated from lecture content</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {["summary", "key points", "flashcards"].map((tabItem) => (
            <button key={tabItem} onClick={() => setTab(tabItem)} style={{ background: tab === tabItem ? t.student : t.card, color: tab === tabItem ? t.bg : t.muted, border: `1px solid ${tab === tabItem ? t.student : t.border}`, borderRadius: 100, padding: "7px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "capitalize", fontFamily: "'DM Sans', sans-serif" }}>{tabItem}</button>
          ))}
        </div>
        {tab === "summary" && (
          <div>
            <div style={{ color: t.text, fontSize: 14, lineHeight: 1.75, marginBottom: 16 }}>A <b style={{ color: t.student }}>Stack</b> follows LIFO, meaning Last In, First Out. A <b style={{ color: t.student }}>Queue</b> follows FIFO, meaning First In, First Out.</div>
            <div style={{ color: t.text, fontSize: 14, lineHeight: 1.75 }}>Stacks are used in function call management, expression parsing, and undo/redo. Queues are essential in scheduling, buffering, and BFS graph traversal.</div>
            <div onClick={() => nav(S.flashcardPractice)} style={{ marginTop: 20, background: `${t.student}15`, border: `1px solid ${t.student}40`, borderRadius: 12, padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>🃏</span>
              <div><div style={{ color: t.student, fontWeight: 700, fontSize: 13 }}>Practice Flashcards</div><div style={{ color: t.muted, fontSize: 12 }}>6 cards ready</div></div>
              <div style={{ marginLeft: "auto", color: t.student }}>→</div>
            </div>
          </div>
        )}
        {tab === "key points" && ["Stack operations: push(), pop(), peek()", "Queue operations: enqueue(), dequeue()", "Stacks are used in call stack management", "Queues are used in scheduling and BFS traversal", "Both can be implemented with arrays or linked lists", "Time complexity: O(1) for all basic operations"].map((point, i) => (
          <div key={i} style={{ color: t.text, fontSize: 13, padding: "12px 0", borderBottom: `1px solid ${t.border}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: `${t.student}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: t.student, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
            <span>{point}</span>
          </div>
        ))}
        {tab === "flashcards" && (
          <div>
            {[{ q: "What does LIFO stand for?", a: "Last In, First Out" }, { q: "What does FIFO stand for?", a: "First In, First Out" }, { q: "Which data structure uses LIFO?", a: "Stack" }, { q: "What is the time complexity of push/pop?", a: "O(1)" }].map((card, i) => (
              <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
                <div style={{ color: t.muted, fontSize: 11, marginBottom: 4 }}>Q</div>
                <div style={{ color: t.text, fontWeight: 600 }}>{card.q}</div>
                <div style={{ color: t.student, marginTop: 10 }}>→ {card.a}</div>
              </div>
            ))}
            <div onClick={() => nav(S.flashcardPractice)} style={{ background: t.student, color: t.bg, borderRadius: 14, padding: 14, textAlign: "center", fontWeight: 700, cursor: "pointer", marginTop: 8 }}>Start Practice Mode</div>
          </div>
        )}
      </Screen>
      <NavBar role="student" screen={screen} nav={nav} t={t} />
    </>
  );
}

function GenerateNotesScreen({ nav, screen, t }: { nav: Nav; screen: string; t: Theme }) {
  const [text, setText] = useState("");
  const [generated, setGenerated] = useState(false);
  return (
    <>
      <Screen>
        <BackButton to={S.studentHome} nav={nav} t={t} />
        <div style={{ color: t.text, fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Generate Study Notes</div>
        <div style={{ color: t.muted, fontSize: 13, marginBottom: 20 }}>Paste text or upload a file for AI-powered notes</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[["📋", "Paste Text"], ["📄", "Upload PDF"], ["🔗", "From URL"]].map(([icon, label], i) => (
            <div key={i} style={{ flex: 1, background: i === 0 ? `${t.student}18` : t.card, border: `1px solid ${i === 0 ? t.student : t.border}`, borderRadius: 12, padding: "12px 8px", textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 20 }}>{icon}</div>
              <div style={{ color: i === 0 ? t.student : t.muted, fontSize: 11, fontWeight: 600, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your lecture notes, transcript, or any text here..." rows={7} style={{ width: "100%", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: "13px 16px", color: t.text, fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.6 }} />
        <div style={{ color: t.muted, fontSize: 12, marginTop: 6, marginBottom: 16 }}>{text.length} characters</div>
        {!generated ? (
          <div onClick={() => text.trim().length > 10 && setGenerated(true)} style={{ background: text.trim().length > 10 ? t.student : t.border, color: text.trim().length > 10 ? t.bg : t.muted, borderRadius: 14, padding: 16, textAlign: "center", fontWeight: 700, fontSize: 15, cursor: text.trim().length > 10 ? "pointer" : "default" }}>✦ Generate Notes</div>
        ) : (
          <div>
            <div style={{ background: `${t.student}15`, border: `1px solid ${t.student}40`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ color: t.student, fontWeight: 700, marginBottom: 8 }}>✦ Notes Generated!</div>
              <div style={{ color: t.text, fontSize: 13, lineHeight: 1.6 }}>Summary, key points, and flashcards are ready based on your input.</div>
            </div>
            <div onClick={() => nav(S.studyNotes)} style={{ background: t.student, color: t.bg, borderRadius: 14, padding: 14, textAlign: "center", fontWeight: 700, cursor: "pointer" }}>View Study Notes →</div>
          </div>
        )}
      </Screen>
      <NavBar role="student" screen={screen} nav={nav} t={t} />
    </>
  );
}

function FlashcardPracticeScreen({ nav, screen, t }: { nav: Nav; screen: string; t: Theme }) {
  const cards = [{ q: "What does LIFO stand for?", a: "Last In, First Out" }, { q: "What does FIFO stand for?", a: "First In, First Out" }, { q: "Which data structure uses LIFO?", a: "Stack" }, { q: "What is the time complexity of push/pop?", a: "O(1)" }, { q: "What traversal uses a Queue?", a: "Breadth-First Search (BFS)" }, { q: "Real-world use of a Stack?", a: "Browser back/forward history" }];
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const handleAnswer = (ok: boolean) => { if (ok) setCorrect((c) => c + 1); if (index + 1 >= cards.length) { setDone(true); } else { setIndex((i) => i + 1); setFlipped(false); } };
  const reset = () => { setIndex(0); setFlipped(false); setCorrect(0); setDone(false); };
  return (
    <>
      <Screen>
        <BackButton to={S.studyNotes} nav={nav} t={t} />
        {!done ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ color: t.text, fontWeight: 800, fontSize: 18 }}>Flashcard Practice</div>
              <Tag color={t.student} t={t}>{index + 1} / {cards.length}</Tag>
            </div>
            <div style={{ background: t.border, borderRadius: 100, height: 4, marginBottom: 24 }}><div style={{ background: t.student, width: `${(index / cards.length) * 100}%`, height: "100%", borderRadius: 100, transition: "width 0.3s" }} /></div>
            <div onClick={() => setFlipped(!flipped)} style={{ background: t.card, border: `1.5px solid ${flipped ? t.student : t.border}`, borderRadius: 20, padding: "32px 24px", minHeight: 180, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", marginBottom: 16, transition: "border-color 0.2s" }}>
              <div style={{ color: t.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>{flipped ? "Answer" : "Question — tap to reveal"}</div>
              <div style={{ color: flipped ? t.student : t.text, fontSize: 17, fontWeight: 700, lineHeight: 1.4 }}>{flipped ? cards[index].a : cards[index].q}</div>
            </div>
            {flipped && (
              <div style={{ display: "flex", gap: 10 }}>
                <div onClick={() => handleAnswer(false)} style={{ flex: 1, background: "#EF444415", border: "1px solid #EF444440", borderRadius: 14, padding: 14, textAlign: "center", color: "#EF4444", fontWeight: 700, cursor: "pointer" }}>✗ Got it wrong</div>
                <div onClick={() => handleAnswer(true)} style={{ flex: 1, background: `${t.student}15`, border: `1px solid ${t.student}40`, borderRadius: 14, padding: 14, textAlign: "center", color: t.student, fontWeight: 700, cursor: "pointer" }}>✓ Got it right</div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ fontSize: 60, marginBottom: 20 }}>🎉</div>
            <div style={{ color: t.text, fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Round Complete!</div>
            <div style={{ color: t.muted, fontSize: 14, marginBottom: 32 }}>You got {correct} out of {cards.length} correct</div>
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: t.student }}>{Math.round((correct / cards.length) * 100)}%</div>
              <div style={{ color: t.muted, fontSize: 13, marginTop: 4 }}>Accuracy</div>
            </div>
            <div onClick={reset} style={{ background: t.student, color: t.bg, borderRadius: 14, padding: 14, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>Practice Again</div>
            <div onClick={() => nav(S.studyNotes, "back")} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: 14, color: t.text, fontWeight: 700, cursor: "pointer" }}>Back to Notes</div>
          </div>
        )}
      </Screen>
      <NavBar role="student" screen={screen} nav={nav} t={t} />
    </>
  );
}

function StudentSettingsScreen({ nav, screen, t }: { nav: Nav; screen: string; t: Theme }) {
  return (
    <>
      <Screen>
        <div style={{ textAlign: "center", marginBottom: 28, paddingTop: 8 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${t.student}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 12px" }}>🎓</div>
          <div style={{ color: t.text, fontWeight: 800, fontSize: 18 }}>Tolu Adebayo</div>
          <div style={{ color: t.muted, fontSize: 13 }}>tolu@students.university.edu</div>
          <div style={{ marginTop: 8 }}><Tag color={t.student} t={t}>200 Level · CSC</Tag></div>
        </div>
        <div style={{ background: `${t.student}15`, border: `1px solid ${t.student}40`, borderRadius: 14, padding: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ color: t.text, fontWeight: 700 }}>Study Streak</div>
            <div style={{ color: t.student, fontWeight: 800 }}>7 days 🔥</div>
          </div>
          <div style={{ background: t.border, borderRadius: 100, height: 6 }}><div style={{ background: t.student, width: "70%", height: "100%", borderRadius: 100 }} /></div>
          <div style={{ color: t.muted, fontSize: 12, marginTop: 6 }}>Keep going! 3 more days to unlock your badge</div>
        </div>
        {[{ section: "Account", items: [{ icon: "👤", label: "Edit Profile" }, { icon: "🔒", label: "Change Password" }, { icon: "📧", label: "Notifications" }] }, { section: "Study Preferences", items: [{ icon: "⏰", label: "Study Reminders" }, { icon: "🃏", label: "Flashcard Difficulty" }, { icon: "📊", label: "Progress Reports" }] }, { section: "About", items: [{ icon: "📋", label: "Terms of Service" }, { icon: "🔏", label: "Privacy Policy" }, { icon: "ℹ", label: "App Version 2.1.0" }] }].map((group, gi) => (
          <div key={gi} style={{ marginBottom: 24 }}>
            <div style={{ color: t.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{group.section}</div>
            <div style={{ background: t.card, borderRadius: 14, overflow: "hidden", border: `1px solid ${t.border}` }}>
              {group.items.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: i < group.items.length - 1 ? `1px solid ${t.border}` : "none", cursor: "pointer" }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ color: t.text, fontSize: 14, flex: 1 }}>{item.label}</span>
                  <span style={{ color: t.muted }}>›</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div onClick={() => nav(S.onboarding, "back")} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16, textAlign: "center", color: "#EF4444", fontWeight: 700, cursor: "pointer" }}>Sign Out</div>
      </Screen>
      <NavBar role="student" screen={screen} nav={nav} t={t} />
    </>
  );
}

const ANIM_DURATION = 280;

export default function App() {
  const [screen, setScreen] = useState(S.onboarding);
  const [isDark, setIsDark] = useState(true);
  const [animKey, setAnimKey] = useState(0);
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");
  const t = isDark ? darkTheme : lightTheme;

  const nav: Nav = (nextScreen, dir = "forward") => {
    setAnimDir(dir);
    setAnimKey((k) => k + 1);
    setScreen(nextScreen);
  };

  const lecturerScreens = new Set([S.lecturerHome, S.lecturerSchemes, S.schemeBreakdown, S.weekDetail, S.createScheme, S.uploadSyllabus, S.lecturerSettings]);
  const studentScreens = new Set([S.studentHome, S.studentLectures, S.courseDetail, S.studyNotes, S.generateNotes, S.flashcardPractice, S.studentSettings]);
  const role = lecturerScreens.has(screen) ? "lecturer" : studentScreens.has(screen) ? "student" : null;

  const slideIn = animDir === "forward"
    ? { animation: `slideInRight ${ANIM_DURATION}ms cubic-bezier(0.4,0,0.2,1) both` }
    : { animation: `slideInLeft ${ANIM_DURATION}ms cubic-bezier(0.4,0,0.2,1) both` };

  return (
    <div style={{ minHeight: "100vh", background: t.isDark ? "#000" : "#e8e8e8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { display: none; }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
      `}</style>

      <div style={{ width: "min(430px, 100vw)", height: "min(900px, 100vh)", background: t.bg, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", borderRadius: "clamp(0px, 2vw, 40px)", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
        <StatusBar t={t} isDark={isDark} setIsDark={setIsDark} />

        <div key={animKey} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", ...slideIn }}>
          {screen === S.onboarding && <OnboardingScreen nav={nav} t={t} />}
          {screen === S.lecturerHome && <LecturerHomeScreen nav={nav} screen={screen} t={t} />}
          {screen === S.lecturerSchemes && <LecturerSchemesScreen nav={nav} screen={screen} t={t} />}
          {screen === S.schemeBreakdown && <SchemeBreakdownScreen nav={nav} screen={screen} t={t} />}
          {screen === S.weekDetail && <WeekDetailScreen nav={nav} screen={screen} t={t} />}
          {screen === S.createScheme && <CreateSchemeScreen nav={nav} screen={screen} t={t} />}
          {screen === S.uploadSyllabus && <UploadSyllabusScreen nav={nav} screen={screen} t={t} />}
          {screen === S.lecturerSettings && <LecturerSettingsScreen nav={nav} screen={screen} t={t} />}
          {screen === S.studentHome && <StudentHomeScreen nav={nav} screen={screen} t={t} />}
          {screen === S.studentLectures && <StudentLecturesScreen nav={nav} screen={screen} t={t} />}
          {screen === S.courseDetail && <CourseDetailScreen nav={nav} screen={screen} t={t} />}
          {screen === S.studyNotes && <StudyNotesScreen nav={nav} screen={screen} t={t} />}
          {screen === S.generateNotes && <GenerateNotesScreen nav={nav} screen={screen} t={t} />}
          {screen === S.flashcardPractice && <FlashcardPracticeScreen nav={nav} screen={screen} t={t} />}
          {screen === S.studentSettings && <StudentSettingsScreen nav={nav} screen={screen} t={t} />}
        </div>
      </div>
    </div>
  );
}
