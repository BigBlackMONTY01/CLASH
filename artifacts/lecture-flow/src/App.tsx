import { useState } from "react";

const theme = {
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
};

const screens = {
  onboarding: "onboarding",
  lecturerHome: "lecturerHome",
  studentHome: "studentHome",
  schemeBreakdown: "schemeBreakdown",
  studyNotes: "studyNotes",
};

const styles = {
  phone: {
    width: 375,
    minHeight: 812,
    background: theme.bg,
    borderRadius: 40,
    overflow: "hidden" as const,
    position: "relative" as const,
    fontFamily: "'DM Sans', sans-serif",
    border: `1px solid ${theme.border}`,
    boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
  },
  statusBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 24px 8px",
    fontSize: 12,
    color: theme.muted,
  },
  screen: {
    padding: "0 24px 100px",
    minHeight: 740,
  },
};

function Tag({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      style={{
        background: color ? `${color}18` : theme.tag,
        color: color || theme.muted,
        borderRadius: 6,
        padding: "3px 10px",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        color: theme.muted,
        fontSize: 22,
        cursor: "pointer",
        padding: "4px 0",
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 20,
      }}
    >
      <span>←</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>Back</span>
    </button>
  );
}

function NavBar({ role }: { role: "lecturer" | "student" }) {
  const color = role === "lecturer" ? theme.lecturer : theme.student;

  const items =
    role === "lecturer"
      ? [
          { icon: "⊞", label: "Home" },
          { icon: "☰", label: "Schemes" },
          { icon: "⚙", label: "Settings" },
        ]
      : [
          { icon: "⊞", label: "Home" },
          { icon: "☰", label: "Lectures" },
          { icon: "⚙", label: "Settings" },
        ];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: theme.surface,
        borderTop: `1px solid ${theme.border}`,
        display: "flex",
        justifyContent: "space-around",
        padding: "12px 0 28px",
      }}
    >
      {items.map((item, i) => (
        <div key={i} style={{ textAlign: "center", cursor: "pointer" }}>
          <div style={{ fontSize: 20 }}>{item.icon}</div>
          <div
            style={{
              fontSize: 10,
              marginTop: 4,
              color: i === 0 ? color : theme.muted,
              fontWeight: i === 0 ? 700 : 400,
            }}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function OnboardingScreen({ setScreen }: { setScreen: (s: string) => void }) {
  return (
    <div
      style={{
        padding: "60px 32px 40px",
        minHeight: 812,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            width: 56,
            height: 56,
            background: theme.accent,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            marginBottom: 48,
          }}
        >
          ✦
        </div>

        <div
          style={{
            color: theme.muted,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Welcome to
        </div>

        <div
          style={{
            fontSize: 42,
            fontWeight: 800,
            color: theme.text,
            lineHeight: 1.1,
          }}
        >
          LectureFlow
        </div>

        <div
          style={{
            fontSize: 42,
            fontWeight: 800,
            color: theme.accent,
            lineHeight: 1.1,
          }}
        >
          Studio
        </div>

        <p style={{ color: theme.muted, fontSize: 15, lineHeight: 1.6, marginTop: 16 }}>
          Lecturers break down schemes. Students build smarter notes. One
          platform, two superpowers.
        </p>
      </div>

      <div>
        <div
          style={{
            color: theme.muted,
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 16,
            textAlign: "center",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          I am a...
        </div>

        <div
          onClick={() => setScreen(screens.lecturerHome)}
          style={{
            background: `${theme.lecturer}12`,
            border: `1.5px solid ${theme.lecturer}40`,
            borderRadius: 16,
            padding: "20px 22px",
            marginBottom: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 32 }}>👨‍🏫</div>
          <div>
            <div style={{ color: theme.lecturer, fontWeight: 700 }}>
              Lecturer
            </div>
            <div style={{ color: theme.muted, fontSize: 13 }}>
              Upload & structure course content
            </div>
          </div>
          <div style={{ marginLeft: "auto", color: theme.lecturer }}>→</div>
        </div>

        <div
          onClick={() => setScreen(screens.studentHome)}
          style={{
            background: `${theme.student}12`,
            border: `1.5px solid ${theme.student}40`,
            borderRadius: 16,
            padding: "20px 22px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 32 }}>🎓</div>
          <div>
            <div style={{ color: theme.student, fontWeight: 700 }}>Student</div>
            <div style={{ color: theme.muted, fontSize: 13 }}>
              Turn lectures into study notes
            </div>
          </div>
          <div style={{ marginLeft: "auto", color: theme.student }}>→</div>
        </div>
      </div>
    </div>
  );
}

function LecturerHomeScreen({ setScreen }: { setScreen: (s: string) => void }) {
  const schemes = [
    {
      title: "Data Structures & Algorithms",
      weeks: 12,
      progress: 75,
      tag: "CSC 301",
    },
    { title: "Operating Systems", weeks: 10, progress: 40, tag: "CSC 401" },
    {
      title: "Software Engineering",
      weeks: 14,
      progress: 20,
      tag: "CSC 302",
    },
  ];

  return (
    <div style={{ position: "relative", minHeight: 812 }}>
      <div style={styles.statusBar}>
        <span>9:41</span>
        <span>●●●</span>
      </div>

      <div style={styles.screen}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: theme.muted, fontSize: 13 }}>Good morning,</div>
          <div style={{ color: theme.text, fontSize: 22, fontWeight: 800 }}>
            Dr. Adeyemi
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          {[
            { label: "Schemes", val: "3" },
            { label: "Students", val: "128" },
            { label: "Topics", val: "24" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: theme.card,
                borderRadius: 14,
                padding: "14px 10px",
                textAlign: "center",
                border: `1px solid ${theme.border}`,
              }}
            >
              <div
                style={{
                  color: theme.lecturer,
                  fontWeight: 800,
                  fontSize: 22,
                }}
              >
                {s.val}
              </div>
              <div style={{ color: theme.muted, fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            color: theme.text,
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 14,
          }}
        >
          My Schemes
        </div>

        {schemes.map((s, i) => (
          <div
            key={i}
            onClick={() => setScreen(screens.schemeBreakdown)}
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              padding: 18,
              marginBottom: 12,
              cursor: "pointer",
            }}
          >
            <div style={{ color: theme.text, fontWeight: 700, fontSize: 14 }}>
              {s.title}
            </div>
            <div style={{ color: theme.muted, fontSize: 12, marginTop: 4 }}>
              {s.weeks} weeks
            </div>
            <div style={{ marginTop: 10 }}>
              <Tag color={theme.lecturer}>{s.tag}</Tag>
            </div>

            <div
              style={{
                background: theme.border,
                borderRadius: 100,
                height: 4,
                marginTop: 14,
              }}
            >
              <div
                style={{
                  background: theme.lecturer,
                  width: `${s.progress}%`,
                  height: "100%",
                  borderRadius: 100,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <NavBar role="lecturer" />
    </div>
  );
}

function SchemeBreakdownScreen({ setScreen }: { setScreen: (s: string) => void }) {
  const topics = [
    { week: "Week 1–2", title: "Introduction to Arrays & Linked Lists" },
    { week: "Week 3–4", title: "Stacks & Queues" },
    { week: "Week 5–6", title: "Trees & Binary Search Trees" },
    { week: "Week 7–8", title: "Graph Algorithms" },
  ];

  return (
    <div style={{ position: "relative", minHeight: 812 }}>
      <div style={styles.statusBar}>
        <span>9:41</span>
        <span>●●●</span>
      </div>

      <div style={styles.screen}>
        <BackButton onClick={() => setScreen(screens.lecturerHome)} />

        <Tag color={theme.lecturer}>CSC 301</Tag>

        <div
          style={{
            color: theme.text,
            fontSize: 22,
            fontWeight: 800,
            marginTop: 10,
          }}
        >
          Data Structures & Algorithms
        </div>

        <div style={{ color: theme.muted, fontSize: 13, marginBottom: 24 }}>
          12 weeks · 8 topics
        </div>

        <div
          style={{
            background: `${theme.lecturer}15`,
            border: `1.5px dashed ${theme.lecturer}60`,
            borderRadius: 14,
            padding: "16px 18px",
            marginBottom: 24,
          }}
        >
          <div style={{ color: theme.lecturer, fontWeight: 700 }}>
            AI Scheme Breakdown
          </div>
          <div style={{ color: theme.muted, fontSize: 12 }}>
            Upload syllabus PDF to auto-generate topics
          </div>
        </div>

        {topics.map((t, i) => (
          <div
            key={i}
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: 14,
              padding: 16,
              marginBottom: 10,
            }}
          >
            <div style={{ color: theme.muted, fontSize: 11 }}>{t.week}</div>
            <div
              style={{
                color: theme.text,
                fontWeight: 700,
                fontSize: 14,
                marginTop: 6,
              }}
            >
              {t.title}
            </div>
          </div>
        ))}
      </div>

      <NavBar role="lecturer" />
    </div>
  );
}

function StudentHomeScreen({ setScreen }: { setScreen: (s: string) => void }) {
  const lectures = [
    {
      course: "CSC 301",
      title: "Stacks & Queues Deep Dive",
      lecturer: "Dr. Adeyemi",
      hasNotes: false,
    },
    {
      course: "MTH 201",
      title: "Differential Equations Intro",
      lecturer: "Prof. Okafor",
      hasNotes: true,
    },
    {
      course: "CSC 302",
      title: "Software Development Lifecycle",
      lecturer: "Dr. Ibrahim",
      hasNotes: true,
    },
  ];

  return (
    <div style={{ position: "relative", minHeight: 812 }}>
      <div style={styles.statusBar}>
        <span>9:41</span>
        <span>●●●</span>
      </div>

      <div style={styles.screen}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: theme.muted, fontSize: 13 }}>Good morning,</div>
          <div style={{ color: theme.text, fontSize: 22, fontWeight: 800 }}>
            Tolu
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          {[
            { label: "Courses", val: "5" },
            { label: "Notes", val: "14" },
            { label: "Streak", val: "7d" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: theme.card,
                borderRadius: 14,
                padding: "14px 10px",
                textAlign: "center",
                border: `1px solid ${theme.border}`,
              }}
            >
              <div
                style={{
                  color: theme.student,
                  fontWeight: 800,
                  fontSize: i === 2 ? 16 : 22,
                }}
              >
                {s.val}
              </div>
              <div style={{ color: theme.muted, fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div
          onClick={() => setScreen(screens.studyNotes)}
          style={{
            background: `linear-gradient(135deg, ${theme.student}20, ${theme.student}08)`,
            border: `1.5px dashed ${theme.student}60`,
            borderRadius: 16,
            padding: "18px 20px",
            marginBottom: 24,
            cursor: "pointer",
          }}
        >
          <div style={{ color: theme.student, fontWeight: 700 }}>
            Generate Study Notes
          </div>
          <div style={{ color: theme.muted, fontSize: 12 }}>
            Upload lecture notes or paste text
          </div>
        </div>

        <div
          style={{
            color: theme.text,
            fontWeight: 700,
            fontSize: 15,
            marginBottom: 14,
          }}
        >
          Recent Lectures
        </div>

        {lectures.map((l, i) => (
          <div
            key={i}
            onClick={() => setScreen(screens.studyNotes)}
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: 14,
              padding: 16,
              marginBottom: 10,
              cursor: "pointer",
            }}
          >
            <Tag color={theme.student}>{l.course}</Tag>
            <div
              style={{
                color: theme.text,
                fontWeight: 600,
                fontSize: 13,
                marginTop: 8,
              }}
            >
              {l.title}
            </div>
            <div style={{ color: theme.muted, fontSize: 11 }}>
              {l.lecturer}
            </div>
            <div
              style={{
                color: l.hasNotes ? theme.student : theme.muted,
                fontSize: 12,
                fontWeight: 600,
                marginTop: 8,
              }}
            >
              {l.hasNotes ? "Notes ✓" : "No notes"}
            </div>
          </div>
        ))}
      </div>

      <NavBar role="student" />
    </div>
  );
}

function StudyNotesScreen({ setScreen }: { setScreen: (s: string) => void }) {
  const [tab, setTab] = useState("summary");
  const tabs = ["summary", "key points", "flashcards"];

  return (
    <div style={{ position: "relative", minHeight: 812 }}>
      <div style={styles.statusBar}>
        <span>9:41</span>
        <span>●●●</span>
      </div>

      <div style={styles.screen}>
        <BackButton onClick={() => setScreen(screens.studentHome)} />

        <Tag color={theme.student}>CSC 301</Tag>

        <div
          style={{
            color: theme.text,
            fontSize: 20,
            fontWeight: 800,
            marginTop: 10,
          }}
        >
          Stacks & Queues Deep Dive
        </div>

        <div style={{ color: theme.muted, fontSize: 12, marginTop: 4 }}>
          Dr. Adeyemi
        </div>

        <div
          style={{
            background: `${theme.student}15`,
            border: `1px solid ${theme.student}40`,
            borderRadius: 10,
            padding: "10px 14px",
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          <div style={{ color: theme.student, fontSize: 13, fontWeight: 600 }}>
            ✦ AI notes generated from lecture content
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? theme.student : theme.card,
                color: tab === t ? "#0D0D0D" : theme.muted,
                border: `1px solid ${tab === t ? theme.student : theme.border}`,
                borderRadius: 100,
                padding: "7px 14px",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                textTransform: "capitalize",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "summary" && (
          <div style={{ color: theme.text, fontSize: 14, lineHeight: 1.75 }}>
            A <b style={{ color: theme.student }}>Stack</b> follows LIFO,
            meaning Last In, First Out. A{" "}
            <b style={{ color: theme.student }}>Queue</b> follows FIFO, meaning
            First In, First Out.
          </div>
        )}

        {tab === "key points" && (
          <div>
            {[
              "Stack operations: push(), pop(), peek()",
              "Queue operations: enqueue(), dequeue()",
              "Stacks are used in call stack management",
              "Queues are used in scheduling and BFS traversal",
            ].map((point, i) => (
              <div
                key={i}
                style={{
                  color: theme.text,
                  fontSize: 13,
                  padding: "12px 0",
                  borderBottom: `1px solid ${theme.border}`,
                }}
              >
                {i + 1}. {point}
              </div>
            ))}
          </div>
        )}

        {tab === "flashcards" && (
          <div>
            {[
              { q: "What does LIFO stand for?", a: "Last In, First Out" },
              { q: "What does FIFO stand for?", a: "First In, First Out" },
            ].map((card, i) => (
              <div
                key={i}
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 10,
                }}
              >
                <div style={{ color: theme.muted, fontSize: 11 }}>Q</div>
                <div style={{ color: theme.text, fontWeight: 600 }}>
                  {card.q}
                </div>
                <div style={{ color: theme.student, marginTop: 10 }}>
                  {card.a}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NavBar role="student" />
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState(screens.onboarding);

  const screenLabels: Record<string, string> = {
    onboarding: "Role Select",
    lecturerHome: "Lecturer Home",
    studentHome: "Student Home",
    schemeBreakdown: "Scheme Breakdown",
    studyNotes: "Study Notes",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060606",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            color: "#C8F45A",
            fontWeight: 800,
            fontSize: 28,
          }}
        >
          LectureFlow Studio
        </div>
        <div style={{ color: "#555", fontSize: 14, marginTop: 6 }}>
          Mobile UI Concept
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 32,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {Object.entries(screenLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setScreen(key)}
            style={{
              background: screen === key ? "#C8F45A" : "#1A1A1A",
              color: screen === key ? "#0D0D0D" : "#666",
              border: `1px solid ${screen === key ? "#C8F45A" : "#2A2A2A"}`,
              borderRadius: 100,
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={styles.phone}>
        {screen === screens.onboarding && (
          <OnboardingScreen setScreen={setScreen} />
        )}
        {screen === screens.lecturerHome && (
          <LecturerHomeScreen setScreen={setScreen} />
        )}
        {screen === screens.studentHome && (
          <StudentHomeScreen setScreen={setScreen} />
        )}
        {screen === screens.schemeBreakdown && (
          <SchemeBreakdownScreen setScreen={setScreen} />
        )}
        {screen === screens.studyNotes && (
          <StudyNotesScreen setScreen={setScreen} />
        )}
      </div>
    </div>
  );
}
