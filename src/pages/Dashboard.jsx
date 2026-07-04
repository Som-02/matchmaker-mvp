import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import customers from "../data/customers.json";

const STATUS_COLORS = {
  "New Client": { bg: "var(--gold-tint)", fg: "var(--wine-dark)" },
  "Profile Verification": { bg: "#EFE6F5", fg: "#5B3A78" },
  "Matches in Progress": { bg: "var(--wine-tint)", fg: "var(--wine-dark)" },
  "Meeting Scheduled": { bg: "#DCEAF6", fg: "#2A5E82" },
  "Follow-up Needed": { bg: "#FBE9E4", fg: "#A9502E" },
  "Engaged": { bg: "var(--sage-tint)", fg: "#3E5B43" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const statuses = ["All", ...new Set(customers.map((c) => c.statusTag))];

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesQuery = `${c.firstName} ${c.lastName} ${c.city}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || c.statusTag === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  return (
    <Layout>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Your Client Roster</p>
          <h1 style={styles.title}>Customer Dashboard</h1>
        </div>
        <div style={styles.statPill}>
          <strong style={{ fontSize: 20, fontFamily: "Fraunces, serif", color: "var(--wine-dark)" }}>{customers.length}</strong>
          <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>clients assigned</span>
        </div>
      </header>

      <div style={styles.controls}>
        <input
          placeholder="Search by name or city…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.search}
        />
        <div style={styles.filterRow}>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                ...styles.filterChip,
                ...(statusFilter === s ? styles.filterChipActive : {}),
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              {["Name", "Age", "City", "Marital Status", "Status"].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const colors = STATUS_COLORS[c.statusTag] ?? { bg: "var(--surface-warm)", fg: "var(--ink)" };
              return (
                <tr key={c.id} className="row-hover" style={styles.row} onClick={() => navigate(`/customer/${c.id}`)}>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={styles.avatar}>{c.photoInitials}</div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 14 }}>{c.firstName} {c.lastName}</p>
                        <p style={{ fontSize: 12, color: "var(--ink-muted)" }}>{c.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>{c.age}</td>
                  <td style={styles.td}>{c.city}</td>
                  <td style={styles.td}>{c.maritalStatus}</td>
                  <td style={styles.td}>
                    <span className="tag" style={{ background: colors.bg, color: colors.fg }}>{c.statusTag}</span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ ...styles.td, textAlign: "center", color: "var(--ink-muted)", padding: 40 }}>
                No clients match this search.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 },
  eyebrow: { fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 700, marginBottom: 4 },
  title: { fontSize: 26 },
  statPill: { display: "flex", flexDirection: "column", alignItems: "flex-end" },
  controls: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 },
  search: {
    padding: "11px 14px", borderRadius: 10, border: "1px solid var(--border)",
    fontSize: 14, maxWidth: 340, fontFamily: "inherit", background: "var(--surface)",
  },
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  filterChip: {
    border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink-muted)",
    borderRadius: 999, padding: "6px 14px", fontSize: 12.5, fontWeight: 600,
  },
  filterChipActive: { background: "var(--wine)", color: "#fff", borderColor: "var(--wine)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left", fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.05em",
    color: "var(--ink-muted)", padding: "14px 18px", borderBottom: "1px solid var(--border)",
  },
  td: { padding: "14px 18px", fontSize: 14, borderBottom: "1px solid var(--border)" },
  row: { cursor: "pointer", transition: "background 0.12s" },
  avatar: {
    width: 34, height: 34, borderRadius: "50%", background: "var(--wine-tint)", color: "var(--wine-dark)",
    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12.5, flexShrink: 0,
  },
};
