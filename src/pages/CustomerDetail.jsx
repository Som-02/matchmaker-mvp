import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import MatchCard from "../components/MatchCard";
import customers from "../data/customers.json";
import pool from "../data/pool.json";
import { getRankedMatches } from "../utils/matching";

const BIODATA_SECTIONS = [
  {
    title: "Personal",
    fields: [
      ["Gender", "gender"], ["Date of Birth", "dob"], ["Age", "age"],
      ["Country", "country"], ["City", "city"], ["Height", (c) => `${c.heightCm} cm`],
      ["Marital Status", "maritalStatus"], ["Siblings", "siblings"],
    ],
  },
  {
    title: "Contact",
    fields: [["Email", "email"], ["Phone", "phone"]],
  },
  {
    title: "Education & Career",
    fields: [
      ["Undergraduate College", "ugCollege"], ["Degree", "degree"],
      ["Income", (c) => `₹${c.incomeLPA} LPA`], ["Company", "currentCompany"], ["Designation", "designation"],
    ],
  },
  {
    title: "Background",
    fields: [
      ["Religion", "religion"], ["Caste", "caste"], ["Gotra", "gotra"], ["Manglik", "manglik"],
      ["Languages Known", (c) => c.languagesKnown.join(", ")],
    ],
  },
  {
    title: "Lifestyle & Preferences",
    fields: [
      ["Diet Preference", "dietPreference"], ["Smoking / Drinking", "smokingDrinking"],
      ["Family Type", "familyType"], ["Family Values", "familyValues"],
      ["Want Kids", "wantKids"], ["Open to Relocate", "openToRelocate"],
      ["Open to Pets", "openToPets"], ["Horoscope Match Important", "horoscopeMatchImportant"],
    ],
  },
];

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const customer = customers.find((c) => String(c.id) === id);
  const [tab, setTab] = useState("matches");
  const [notes, setNotes] = useState(() => {
    const stored = sessionStorage.getItem(`tdc_notes_${id}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [noteDraft, setNoteDraft] = useState("");
  const [toast, setToast] = useState(null);

  const matches = useMemo(() => (customer ? getRankedMatches(customer, pool, 12) : []), [customer]);

  if (!customer) {
    return (
      <Layout>
        <p>Customer not found. <Link to="/dashboard" style={{ color: "var(--wine)", fontWeight: 700 }}>Back to dashboard</Link></p>
      </Layout>
    );
  }

  function addNote() {
    if (!noteDraft.trim()) return;
    const next = [{ text: noteDraft.trim(), date: new Date().toLocaleString() }, ...notes];
    setNotes(next);
    sessionStorage.setItem(`tdc_notes_${id}`, JSON.stringify(next));
    setNoteDraft("");
  }

  function handleSendMatch(match) {
    setToast(`Match with ${match.firstName} ${match.lastName} sent to ${customer.firstName}.`);
    setTimeout(() => setToast(null), 3500);
  }

  return (
    <Layout>
      <Link to="/dashboard" style={styles.backLink}>← Back to dashboard</Link>

      <header style={styles.header}>
        <div style={styles.avatarLg}>{customer.photoInitials}</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24 }}>{customer.firstName} {customer.lastName}</h1>
          <p style={{ color: "var(--ink-muted)", fontSize: 14, marginTop: 4 }}>
            {customer.age} yrs · {customer.city} · {customer.designation} at {customer.currentCompany}
          </p>
        </div>
        <span className="tag">{customer.statusTag}</span>
      </header>

      <div style={styles.tabs}>
        {[
          ["matches", `Suggested Matches (${matches.length})`],
          ["biodata", "Full Biodata"],
          ["notes", `Notes (${notes.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{ ...styles.tabBtn, ...(tab === key ? styles.tabBtnActive : {}) }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "matches" && (
        <div style={styles.matchGrid}>
          {matches.map((m) => (
            <MatchCard key={m.id} customer={customer} match={m} onSendMatch={handleSendMatch} />
          ))}
        </div>
      )}

      {tab === "biodata" && (
        <div style={styles.biodataGrid}>
          {BIODATA_SECTIONS.map((section) => (
            <div key={section.title} className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 14, color: "var(--wine)" }}>{section.title}</h4>
              <dl style={styles.dl}>
                {section.fields.map(([label, accessor]) => (
                  <div key={label} style={styles.dlRow}>
                    <dt style={styles.dt}>{label}</dt>
                    <dd style={styles.dd}>{typeof accessor === "function" ? accessor(customer) : customer[accessor]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}

      {tab === "notes" && (
        <div className="card" style={{ padding: 20, maxWidth: 640 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Add a quick note from a call or meeting…"
              rows={2}
              style={styles.textarea}
            />
            <button className="btn btn-primary" onClick={addNote} style={{ alignSelf: "flex-end" }}>Add note</button>
          </div>
          {notes.length === 0 ? (
            <p style={{ color: "var(--ink-muted)", fontSize: 13.5 }}>No notes yet for this client.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {notes.map((n, i) => (
                <li key={i} style={styles.noteItem}>
                  <p style={{ fontSize: 13.5, lineHeight: 1.5 }}>{n.text}</p>
                  <p style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 6 }}>{n.date}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {toast && <div className="toast">✓ {toast}</div>}
    </Layout>
  );
}

const styles = {
  backLink: { fontSize: 13, fontWeight: 600, color: "var(--wine)", display: "inline-block", marginBottom: 18 },
  header: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24 },
  avatarLg: {
    width: 58, height: 58, borderRadius: "50%", background: "var(--wine-tint)", color: "var(--wine-dark)",
    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 19, flexShrink: 0,
  },
  tabs: { display: "flex", gap: 6, marginBottom: 22, borderBottom: "1px solid var(--border)" },
  tabBtn: {
    background: "none", border: "none", padding: "10px 6px", marginRight: 18, fontSize: 14, fontWeight: 600,
    color: "var(--ink-muted)", borderBottom: "2px solid transparent",
  },
  tabBtnActive: { color: "var(--wine)", borderBottom: "2px solid var(--wine)" },
  matchGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 },
  biodataGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 },
  dl: { margin: 0, display: "flex", flexDirection: "column", gap: 10 },
  dlRow: { display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 },
  dt: { color: "var(--ink-muted)" },
  dd: { margin: 0, fontWeight: 600, textAlign: "right" },
  textarea: { flex: 1, padding: 10, borderRadius: 8, border: "1px solid var(--border)", fontFamily: "inherit", fontSize: 13.5, resize: "vertical" },
  noteItem: { padding: 12, background: "var(--surface-warm)", borderRadius: 10 },
};
